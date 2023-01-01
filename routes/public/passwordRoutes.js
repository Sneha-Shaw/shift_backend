import express from 'express'
import {
    forgetPassword,
    resetPassword
} from '../../controller/passwordController.js'
const route = express.Router()

route.post('/send-email', forgetPassword)
route.post('/reset-password/:id', resetPassword)

export default route