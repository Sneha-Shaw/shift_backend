import jwt from 'jsonwebtoken'
import env from 'dotenv'

env.config()

export const generateToken = (id) => {
    return jwt.sign({ _id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY_TIME
    })
}
