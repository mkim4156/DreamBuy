import jwt from 'jsonwebtoken';

const authenticateJWT = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token){
        return res.status(401).json({ message: "No token, authorization denied"});
    }

    // verifying the token
    try{
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.username = decoded.username;
        req.user_id = decoded.user_id;
        req.created_at = decoded.created_at;
        req.profile_picture_url = decoded.profile_picture_url;
        next();

    } catch (err){
        res.status(401).json({ message: "Token is not valid"})
    }
}

export default authenticateJWT;