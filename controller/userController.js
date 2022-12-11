import userAccount from '../model/userAccountSchema.js'
import { generateToken } from '../utils/generateToken.js'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import env from 'dotenv'
import isEmpty from '../utils/isEmpty.js'

env.config()

//@route: POST /auth/login
//@purpose: : post routes for  user to login
export const loginUser = async (req, res) => {
    const { email, password } = req.body

    const checkEmail = await userAccount.findOne({ email: email })

    if (!isEmpty(checkEmail)) {
        const checkPassword = await bcrypt.compare(password, checkEmail.password)
        if (checkPassword) {
            res.json({
                success: true,
                _id: checkEmail._id,
                name: checkEmail.username,
                email: checkEmail.email,
                mobile: checkEmail.mobile,
                // designatuon,department,typw
                designation: checkEmail.designation,
                department: checkEmail.department,
                type: checkEmail.type,
                token: generateToken(checkEmail._id)
            })
        } else {
            res.status(401).json({
                success: false,
                message: "Invalid password!"
            })
        }
    } else {
        res.status(404).json({
            success: false,
            message: "User not found!"
        })
    }
}

//@route: GET /auth/
//@purpose: : get routes for get all user account
export const getUser = async (req, res) => {
    try {
        const getUserAccount = await userAccount.find()
        res.status(200).json(getUserAccount)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

//@route: GET /auth/:id
//@purpose: get single user
export const getSingleUser = async (req, res) => {
    try {
        const id = req.params.id
        const getSingleUser = await userAccount.findById(id)
        res.status(200).json(getSingleUser)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

//@route: POST /auth/forgot-password
//@purpose: : post routes for  user to forgot password
export const forgotPassword = async (req, res) => {
    const { email } = req.body
    const checkEmail = await userAccount.findOne({email:email})
    if(!isEmpty(checkEmail)){
        const token = generateToken(checkEmail._id)
        const resetLink = `http://localhost:3000/reset-password/${token}`
        res.json({
            resetLink
        })
    }else{
        res.status(404).json({
            success:false,
            message:"User not found!"
        })
    }
}
