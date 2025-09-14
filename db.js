import mysql from 'mysql2/promise';

// Configuring my database connection
const pool = mysql.createPool({
    host: 'localhost',  // can be localhost or an ip address
    user: 'root',
    password: '123',    
    database: 'dream',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Testing the connection, this is optional but good for debugging
pool.getConnection()
    .then(connection => {
        console.log('Succesfully connected to the MySQL database!');
        connection.release();
    })
    .catch(err => {
        console.log("Error connecting to the databse:", err.message);
    });

export default pool;