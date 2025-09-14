import express from 'express'
import cors from 'cors';
import db from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authenticateJWT from './middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// enables CORS for all origins
app.use(express.json());
app.use(cors());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.send('This is the main page of this backend server');
})


app.post('/api/createaccount', async (req, res) => {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 13);

    if (!username || !hash){
        return res.status(400).json({ message: "Username and password are required." });
    }

    let connection;
    try {
        connection = await db.getConnection();

        // Hash the password before storing it
        const [rows] = await connection.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash]);

        if (rows.affectedRows > 0){
            return res.status(201).json({ message: "Account created successfully!", userId: rows.insertId });
        } else {
            return res.status(500).json({ message: 'Failed to create account.' });
        }
    } catch (error) {
        console.error('Error creating account:', error);

        if (error.code == "ER_DUP_ENTRY"){
            return res.status(409).json({ message: "Username already exists." });
        }
        res.status(500).json({ message: 'Internal server error.' });
    } finally {
        if (connection){
            connection.release();
        }
    }

    res.status(200).json({message : 'Account created Successfully' });
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if(!username || !password){
        return res.status(400).json({ message: "Username or Password is required. "});
    }

    let connection;
    try{
        connection = await db.getConnection();
        
        const [rows] = await connection.execute('SELECT username, password, user_id, created_at, profile_picture_url FROM users WHERE username = ?', [username]);

        // Comparing the password and hashed password
        const isMatch = await bcrypt.compare(password, rows[0].password);
        if(!isMatch){
            return res.status(500).json({ message: `Username or Password does not exists.`})
        }
    
        jwt.sign(
            { "username"            : rows[0].username,
              "user_id"             : rows[0].user_id,
              "created_at"          : rows[0].created_at,
              "profile_picture_url" : rows[0].profile_picture_url
             },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) {
                    console.error("JWT signing failed:", err);
                    return res.status(500).json({ message: "Token generation failed." });
                }
                return res.status(201).json({ token, message: "Login Successful" });
            }
        );

    } catch (error) {
        console.error('Error logging into the account:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }finally{
        if(connection){
            connection.release();
        }
    }

});

app.delete('/api/delete/:id', async (req, res) => {
    const userId = req.params.id;
    if(!userId){
        console.error('Missing a user ID for delete request');
        return res.status(400).json({ message: 'Missing user ID'})
    }
    console.log(`Received a DELETE request for user with ID: ${userId}`);

    // Make sure to delete all tables with THAT id
    let connection;
    try{
        connection = await db.getConnection();
        
        const [rows] = await connection.execute('DELETE FROM users where user_id = ?', [userId]);
        if (rows.affectedRows == 0){
            return res.status(500).json({ message: `No such ID was found in the database.`})
        }

        console.log("Successfully deleted the ID");
        return res.status(200).json({ message: `User with ID ${userId} deleted successfully.`});

    }
    catch(error){
        console.error('Error deleting an account');
        return res.status(500).json({ message : `There was an ${error}`})
    }finally{
        if(connection){
            connection.release();
        }
    }
})

const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads/profiles');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const profileUpload = multer({ storage: profileStorage });

app.put('/api/changeProfile/:id', profileUpload.single('profilePicture'), async (req, res) =>{
    const userId = req.params.id;
    if(!userId){
        console.error("Unable detect id in the url");
        return res.status(400).json({ message: "Missing an user ID"});
    }

    // Check if a file was uploaded by multer
    if (!req.file) {
        return res.status(400).json({ message: "No profile picture file was uploaded." });
    }
    // The path where the file is stored on your server
    const profilePictureUrl = `http://localhost:8000/uploads/profiles/${req.file.filename}`;

    let connection;
    try {
        connection = await db.getConnection();
        const [rows] = await connection.execute('UPDATE users SET profile_picture_url = ? WHERE user_id = ?', [profilePictureUrl, userId]);

        if (rows.affectedRows === 0) {
            return res.status(404).json({ message: `No such ID was found in the database.` });
        }

        console.log("Successfully changed the Profile Picture");
        
        // Find the user again to return the full updated object
        const [updatedUserRows] = await connection.execute('SELECT * FROM users WHERE user_id = ?', [userId]);
        const updatedUser = updatedUserRows[0];

        return res.status(200).json(updatedUser);
    } catch(error){
        console.error('Error changing Profile Picture');
        return res.status(500).json({ message : `There was an ${error}`})
    }finally{
        if(connection){
            connection.release();
        }
    }
})

const itemStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads/items');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const itemUpload = multer({ storage: itemStorage });

app.post('/api/sell-item/:id', itemUpload.array('images', 5), async (req, res) =>{
    const userId = req.params.id;
    if(!userId){
        console.error("Unable to find ID in the url");
        return res.status(400).json({ message: "Missing an ID"});
    }

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No images were uploaded." });
    }

    const imageUrls = req.files.map(file => `http://localhost:8000/uploads/items/${file.filename}`);
    console.log('Uploaded image URLs:', imageUrls);

    const itemName = req.body.itemName;
    const condition = req.body.condition;
    const price = req.body.price;
    const category = req.body.category.split(','); // Split the string back into an array

    if(!itemName || !condition || !price || !category){ // missing !image
        console.error("One or more input(s) are missing");
        return res.status(400).json({ message : "Missing input(s)"});
    }
    
    let connection;
    try{
        connection = await db.getConnection();
        await connection.beginTransaction(); // Data Integrity

        const imageJson = JSON.stringify(imageUrls);
        const [sellResult] = await connection.execute(
            'INSERT INTO sells (user_id, item_name, item_condition, price, item_images) VALUES (?, ?, ?, ?, ?)',
            [userId, itemName, condition, price, imageJson]
        )

        // getting the id (product_id) of the new row that were inserted to the sell table
        const newSellId = sellResult.insertId;

        // making the steps like (?, ?, ?,...)
        const placeholders = category.map(()=> '?').join(', ');

        console.log(category);
        const query = `SELECT category_id FROM categories WHERE name IN (${placeholders})`;
        const [categoryRows] = await connection.execute(
            query,
            category
        );
console.log(categoryRows)
        // console.log(category.length);
        // console.log(categoryRows.length)
        // console.log(categoryRows)
        // if(categoryRows.length !== category.length){
        //     await connection.rollback(); 
        //     return res.status(400).json({ message: "One or more categories are invalid." });
        // }

        // mapping [[product_id, category_id], [product_id, category_id],...]
        const sellCategoryValues = categoryRows.map(row=>[newSellId, row.category_id])
        
        for (const values of sellCategoryValues){
            await connection.execute(
                'INSERT INTO sells_category (product_id, category_id) VALUES (?, ?)',
                values
            );
        }

        await connection.commit(); // Commit the transaction
        return res.status(200).json({ message: "Successfully stored item information into the database! " });

    } catch(error){
        console.error("There was an error during saving the item");
        console.error('Database query failed:', error);
        return res.status(500).json({ message: `There was an error: ${error}`});
    }finally{
        if(connection){
            connection.release();
        }
    }
})

app.get('/api/grab-items/:pages', async (req, res) => {
    const pages = req.params.pages;
    if(pages < 0){
        console.error("Pages cannot be negative")
    }
    
    let connection;
    try{
        const itemsPerPage = 20;
        const offset = (pages - 1) * 20;
        
        connection = await db.getConnection();
        
        const query = `
            SELECT 
                s.*,
                u.username,
                u.profile_picture_url,
                GROUP_CONCAT(c.name) AS categories
            FROM
                sells AS s
            INNER JOIN
                users AS u ON s.user_id = u.user_id
            INNER JOIN
                sells_category AS sc ON s.id = sc.product_id
            INNER JOIN
                categories AS c ON sc.category_id = c.category_id
            GROUP BY
                s.id
            ORDER BY
                s.created_at DESC
            LIMIT ${itemsPerPage} OFFSET ${offset} ;
        `;

        const countQuery = `SELECT COUNT(*) AS total_items FROM dream.sells `
        
        // Getting the items and the count of the total items in the database
        const [itemsResult, countResult] = await Promise.all([connection.execute(query), connection.execute(countQuery)]);

        const [rows] = itemsResult;
        const [[{total_items}]] = countResult;
        
        const processedRows = rows.map(row => {
            if (row.categories) {
                row.categories = row.categories.split(',');
            } else {
                row.categories = [];
            }
            return row;
        });

        return res.status(200).json({ 
            message: "Successfully retrieved items", 
            data: processedRows,
            totalItems: total_items
        });

    } catch (error){
        console.log("Error: ", error)
        return res.status(500).json({ message : "Error in connecting to the database "})
    } finally{
        if(connection){
            connection.release();
        }
    }
})

app.get('/api/grab-items/search/:search/:pages', async (req, res) => {
    const searchedItem = req.params.search;
    const pages = parseInt(req.params.pages, 10);

    if(!searchedItem || isNaN(pages) || pages < 1){
        console.error('Missing or invalid search term or page number.');
        return res.status(400).json({ message: "Missing or invalid search term or page number." });
    }

    let connection;
    try{
        const itemsPerPage = 20;
        const offset = (pages - 1) * itemsPerPage;
        
        connection = await db.getConnection();
        
        const query = `SELECT 
                s.*,
                u.username,
                u.profile_picture_url,
                GROUP_CONCAT(c.name) AS categories
            FROM
                dream.sells AS s
            INNER JOIN
                dream.users AS u ON s.user_id = u.user_id
            INNER JOIN
                dream.sells_category AS sc ON s.id = sc.product_id
            INNER JOIN
                dream.categories AS c ON sc.category_id = c.category_id
            WHERE
                s.item_name LIKE '%${searchedItem}%'
            GROUP BY
                s.id
            ORDER BY
                s.created_at DESC
            LIMIT ${itemsPerPage} OFFSET ${offset}`;
        const totalItemQuery = `SELECT COUNT(*) AS total_items FROM dream.sells INNER JOIN dream.users ON dream.sells.user_id = dream.users.user_id WHERE sells.item_name LIKE '%${searchedItem}%' ORDER BY sells.created_at DESC`
        
        const [itemsResult, countResult] = await Promise.all([connection.execute(query), connection.execute(totalItemQuery)]);
        
        const [rows] = itemsResult;
        const [[{total_items}]] = countResult;
        
        const processedRows = rows.map(row => {
            if (row.categories) {
                row.categories = row.categories.split(',');
            } else {
                row.categories = [];
            }
            return row;
        });
        console.log("ROWS", rows)

        return res.status(200).json({ 
            message: "Successfully retrieved items", 
            data: processedRows,
            totalItems: total_items
        });
    } catch (error){
        return res.status(500).json({ message : "Error in connecting to the database "})
    } finally{
        if(connection){
            connection.release();
        }
    }
})

app.get('/api/grab-items/filter/:filter/:cond/:min/:max/:pages', async (req, res) => {
    // Getting all the values from the params
    const filterCategories = req.params.filter.split(',');
    if(filterCategories.length === 0){
        console.error("There isn't any filter words in the array");
        return res.status(400).json({ message: "No words in the filter array"});
    }

    const condition = req.params.cond;

    const min_price = req.params.min;
    if(!min_price){
        console.error("Min Price range is missing");
        return res.status(400).json({ message: "Min Price is missing"});
    }

    const max_price = req.params.max;
    if(!max_price){
        console.error("Max Price range is missing");
        return res.status(400).json({ message: "Max Price is missing"});
    }

    const pages = req.params.pages;
    if(pages < 1){
        console.error("Pages cannot be less than 1");
        return res.status(400).json({ message: "Incorrect page number"});
    }

    let connection;
    try{
        const itemsPerPage = 20;
        const offset = (pages - 1) * itemsPerPage;
        
        connection = await db.getConnection();
        
        console.log("Current Filtering Categories: ", filterCategories)

        // Making dynamic (?, ?,...) based on the number of array in the filterCategories
        const placeholders = filterCategories.map(() => '?').join(', ');

        const query = `SELECT
            s.*,
            u.username,
            u.profile_picture_url,
            GROUP_CONCAT(c.name) AS categories
        FROM
            sells AS s
        INNER JOIN
            users AS u ON s.user_id = u.user_id
        INNER JOIN
            sells_category AS sc ON s.id = sc.product_id
        INNER JOIN
            categories AS c ON sc.category_id = c.category_id
        WHERE
            s.id IN (
                SELECT sc.product_id
                FROM sells_category sc
                INNER JOIN categories c ON sc.category_id = c.category_id
                WHERE c.name IN (${placeholders})
                GROUP BY sc.product_id
                HAVING COUNT(DISTINCT c.name) = ${filterCategories.length}
            )
            AND s.price BETWEEN ${min_price} AND ${max_price}
            AND (s.item_condition = '${condition}' OR '${condition}' = 'all')
        GROUP BY
            s.id
        ORDER BY
            s.created_at DESC
        LIMIT ${itemsPerPage} OFFSET ${offset};`;
        
        const totalItemQuery = `SELECT
            COUNT(DISTINCT s.id) AS total_items
        FROM
            sells AS s
        INNER JOIN
            sells_category AS sc ON s.id = sc.product_id
        INNER JOIN
            categories AS c ON sc.category_id = c.category_id
        WHERE
            s.id IN (
                SELECT sc.product_id
                FROM sells_category sc
                INNER JOIN categories c ON sc.category_id = c.category_id
                WHERE c.name IN (${placeholders})
                GROUP BY sc.product_id
                HAVING COUNT(DISTINCT c.name) = ${filterCategories.length}
            )
            AND s.price BETWEEN ${min_price} AND ${max_price}
            AND (s.item_condition = '${condition}' OR '${condition}' = 'all')`
        
        const [itemsResult, countResult] = await Promise.all([connection.execute(query, filterCategories), connection.execute(totalItemQuery, filterCategories)]);
        
        const [rows] = itemsResult;
        const [[{total_items}]] = countResult;
        

        const processedRows = rows.map(row => {
            if (row.categories) {
                row.categories = row.categories.split(',');
            } else {
                row.categories = [];
            }
            return row;
        });

        return res.status(200).json({ 
            message: "Successfully retrieved items", 
            data: processedRows,
            totalItems: total_items
        });
    } catch(error){
        console.error("Trouble accessign the database: ", error)
        return res.status(500).json({ message: "Error in the database"})
    } finally{
        connection.release();
    }
});

app.get('/api/grab-items/filter/:filter/:cond/:min/:max/:pages/:search', async (req, res) => {
    // Getting all the values from the params
    const filterCategories = req.params.filter.split(',');
    if(filterCategories.length === 0){
        console.error("There isn't any filter words in the array");
        return res.status(400).json({ message: "No words in the filter array"});
    }

    const condition = req.params.cond;

    const min_price = req.params.min;
    if(!min_price){
        console.error("Min Price range is missing");
        return res.status(400).json({ message: "Min Price is missing"});
    }

    const max_price = req.params.max;
    if(!max_price){
        console.error("Max Price range is missing");
        return res.status(400).json({ message: "Max Price is missing"});
    }

    const pages = req.params.pages;
    if(pages < 1){
        console.error("Pages cannot be less than 1");
        return res.status(400).json({ message: "Incorrect page number"});
    }

    const search = req.params.search;
    if(!search){
        console.error("No search item was not found");
        return res.status(400).json({ message: "Search item was not found" })
    }

    let connection;
    try{
        const itemsPerPage = 20;
        const offset = (pages - 1) * itemsPerPage;
        
        connection = await db.getConnection();
        
        console.log("Current Filtering Categories: ", filterCategories)

        // Making dynamic (?, ?,...) based on the number of array in the filterCategories
        const placeholders = filterCategories.map(() => '?').join(', ');

        const query = `SELECT
            s.*,
            u.username,
            u.profile_picture_url,
            GROUP_CONCAT(c.name) AS categories
        FROM
            sells AS s
        INNER JOIN
            users AS u ON s.user_id = u.user_id
        INNER JOIN
            sells_category AS sc ON s.id = sc.product_id
        INNER JOIN
            categories AS c ON sc.category_id = c.category_id
        WHERE
            s.id IN (
                SELECT sc.product_id
                FROM sells_category sc
                INNER JOIN categories c ON sc.category_id = c.category_id
                WHERE c.name IN (${placeholders})
                GROUP BY sc.product_id
                HAVING COUNT(DISTINCT c.name) = ${filterCategories.length}
            )
            AND s.price BETWEEN ${min_price} AND ${max_price}
            AND (s.item_condition = '${condition}' OR '${condition}' = 'all')
            AND s.item_name LIKE '%${search}%'
        GROUP BY
            s.id
        ORDER BY
            s.created_at DESC
        LIMIT ${itemsPerPage} OFFSET ${offset};`;
        
        const totalItemQuery = `SELECT
            COUNT(DISTINCT s.id) AS total_items
        FROM
            sells AS s
        INNER JOIN
            sells_category AS sc ON s.id = sc.product_id
        INNER JOIN
            categories AS c ON sc.category_id = c.category_id
        WHERE
            s.id IN (
                SELECT sc.product_id
                FROM sells_category sc
                INNER JOIN categories c ON sc.category_id = c.category_id
                WHERE c.name IN (${placeholders})
                GROUP BY sc.product_id
                HAVING COUNT(DISTINCT c.name) = ${filterCategories.length}
            )
            AND s.price BETWEEN ${min_price} AND ${max_price}
            AND (s.item_condition = '${condition}' OR '${condition}' = 'all')
            AND s.item_name LIKE '%${search}%'`
        
        const [itemsResult, countResult] = await Promise.all([connection.execute(query, filterCategories), connection.execute(totalItemQuery, filterCategories)]);
        
        const [rows] = itemsResult;
        const [[{total_items}]] = countResult;
        

        const processedRows = rows.map(row => {
            if (row.categories) {
                row.categories = row.categories.split(',');
            } else {
                row.categories = [];
            }
            return row;
        });

        return res.status(200).json({ 
            message: "Successfully retrieved items", 
            data: processedRows,
            totalItems: total_items
        });
    } catch(error){
        console.error("Trouble accessing the database in Search + Filtering functionality: ", error)
        return res.status(500).json({ message: "Error in the database"})
    } finally{
        connection.release();
    }
});

app.get('/api/profile/items/:user_id/:pages', async (req, res) => {
    const id = req.params.user_id;
    if(!id){
        console.error('ID does not exist or undefined');
        return res.status(400).json({ message: "ID does not exist or undefined"});
    }

    const pages = req.params.pages;
    if(!pages){
        console.error("Pages does not exist");
        return res.status(400).json({ message: "Page does not exist or its undefined"})
    }

    let connection;
    try{
        const itemsPerPage = 8;
        const offset = (pages - 1) * itemsPerPage;

        connection = await db.getConnection();

        const query = `
            SELECT 
                s.*,
                u.username,
                u.profile_picture_url,
                GROUP_CONCAT(c.name) AS categories
            FROM
                sells AS s
            INNER JOIN
                users AS u ON s.user_id = u.user_id
            INNER JOIN
                sells_category AS sc ON s.id = sc.product_id
            INNER JOIN
                categories AS c ON sc.category_id = c.category_id
            WHERE
                s.user_id = ?
            GROUP BY
                s.id
            ORDER BY
                s.created_at DESC
            LIMIT ${itemsPerPage} OFFSET ${offset};
        `;

        const totalQuery = `
            SELECT 
                COUNT(*) AS total_items 
            FROM
                sells 
            WHERE 
                user_id = ?;
        `;

        const [itemResult, totalResult] = await Promise.all([connection.execute(query, [id]), connection.execute(totalQuery, [id])])

        const [rows] = itemResult;
        const [[{total_items}]] = totalResult
        console.log(rows)
        console.log(total_items)

        const processedRows = rows.map(row => {
            if(row.categories){
                row.categories = row.categories.split(',');
            } else{
                row.categories = []
            }
            return row;
        })

        console.log(total_items)

        return res.status(200).json({ 
            message: "Successfully retrieved items", 
            data: processedRows,
            totalItems: total_items
        });

    } catch(error){
        console.error("Error in the database: ", error);
        return res.status(500).json({ message: "Error in database", error})
    } finally{
        connection.release();
    }

});

app.delete('/api/profile/items/delete/:product_id/', async (req, res) => {
    const product_id = req.params.product_id;
    if(!product_id){
        console.error('ID does not exist');
        return res.status(404).json({ message: "ID does not exist" });
    }


    let connection;
    try{

        connection = await db.getConnection();

        const deleteCategorySells = `DELETE FROM sells_category WHERE product_id = ?`;
        const [deletedCategorySells] = await connection.execute(deleteCategorySells, [product_id]);
        
        // Then, delete from the parent table (sells)
        const deleteSells = `DELETE FROM sells WHERE id = ?`;
        const [deletedSell] = await connection.execute(deleteSells, [product_id]);

        if (deletedSell.affectedRows === 0) {
            return res.status(500).json({ message: `No such ID was found in the database.` });
        }


        console.log("Successfully deleted the ID");
        return res.status(200).json({ message: `Item ${product_id} was successfully deleted from the database`});
    } catch(error){
        console.error("Error in accessing to the database when trying to delete an item", error);
        return res.status(500).json({ message: "There was an error in accessing to the database"});
    } finally{
        connection.release();
    }
});

app.get('/api/dashboard', authenticateJWT, (req, res) => {
    res.json({ message: `Welcome to the dashboard, user ${req.username} .`, username: req.username, user_id: req.user_id, created_at: req.created_at, profile_picture_url: req.profile_picture_url});
});

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));