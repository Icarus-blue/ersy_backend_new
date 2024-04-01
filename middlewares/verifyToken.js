import expressAsyncHandler from "express-async-handler";
import jwt from 'jsonwebtoken'

export const verifyToken = expressAsyncHandler(async (req, res, next) => {

    const authHeader = req.headers['authorization'];
    if (!authHeader) return next({ message: "Authorization header must be provided", status: 405 })
    console.log(authHeader)

    const token = authHeader.split(" ")[1]
    if (!token) return next({ message: "Token was not found", status: 404 })

    const decodedToken = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN || "my-secret-token")
    if (!decodedToken.id) return next({ message: 'id was not found in the token', status: 404 });
    console.log(decodedToken)
    req.userId = decodedToken?.id;
    next();
})