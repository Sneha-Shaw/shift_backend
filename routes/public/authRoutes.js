import express from 'express'
import {
    getSingleUser,
    loginUser,
    getUser,
    forgotPassword
} from '../../controller/userController.js'
const route = express.Router()

route.post('/login', loginUser)
route.get('/', getUser)
route.get('/get-single-user/:id', getSingleUser)
route.post('/forgot-password', forgotPassword)

export default route
