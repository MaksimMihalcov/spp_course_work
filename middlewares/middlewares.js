import jwt from 'jsonwebtoken'
import {secretKey} from "../config.js";

export const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token
    try {
        req.user = jwt.verify(token, secretKey)
        next()
    } catch (e) {
        res.clearCookie("token")
        return res.redirect("/login")
    }
}