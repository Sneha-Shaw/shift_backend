import userAccount from '../model/userAccountSchema.js'
import leaveRequestModel from '../model/LeaveRequestSchema.js'
import specialRequestModel from '../model/specialRequestSchema.js'
import { generateToken } from '../utils/generateToken.js'
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
            res.status(200).json({
                success: true,
                message: "Login successfully!",
                name: checkEmail.name,
                _id: checkEmail._id,
                email: checkEmail.email, 
                token: generateToken(checkEmail._id)

            })
        } else {
            res.status(401).json({
                success: false,
                message: "Wrong password!"
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
        if (getSingleUser) {
            res.status(200).json(
                getSingleUser
            )
        }
        else {
            res.status(404).json({
                success: false,
                message: "User not found!"
            })
        }
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// @route: PUT /auth/:id/update-profile
// @purpose: update user profile
export const updateProfile = async (req, res) => {
    try {
        const id = req.params.id
        const {
            name,
            email,
            mobile,
            address,
            city,
            state,
            pincode,
            about,
            designation,
            nightDuty
        } = req.body
        // check user
        const checkUser = await userAccount.findById(id)
        if (checkUser) {
            checkUser.name = name || checkUser.name
            checkUser.email = email || checkUser.email
            checkUser.mobile = mobile || checkUser.mobile
            checkUser.address = address || checkUser.address
            checkUser.city = city || checkUser.city
            checkUser.state = state || checkUser.state
            checkUser.pincode = pincode || checkUser.pincode
            checkUser.about = about || checkUser.about
            checkUser.designation = designation || checkUser.designation
            checkUser.nightDuty = nightDuty
            const updatedUser = await checkUser.save()
            res.status(200).json({
                success: true,
                message: "Profile updated successfully!",
                updatedUser
            })
        } else {
            res.status(404).json({
                success: false,
                message: "User not found!"
            })
        }
    }
    catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
}

//@route: POST /auth/:id/request-leave
//@purpose: : post routes for  user to request leave
export const requestLeave = async (req, res) => {
    const {
        leaveType,
        leaveReason,
        startDate,
        endDate
    } = req.body
    const id = req.params.id
    const checkUser = await userAccount
        .findById(id)
    if (isEmpty(checkUser)) {
        res.status(404).json({
            success: false,
            message: "User not found!"
        })
    }
    else {
        const newLeaveRequest = new leaveRequestModel({
            leaveType,
            leaveReason,
            startDate,
            endDate,
            user: id,
            username: checkUser.name
        })
        const saveLeaveRequest = await newLeaveRequest.save()
        res.json({
            success: true,
            message: "Leave request sent successfully!",
            leaveRequest: saveLeaveRequest
        })
    }
}

//@route: GET /auth/:id/get-leaves
//@purpose: : get routes for  user to get all leave request
export const getLeaves = async (req, res) => {
    try {
        const id = req.params.id
        const getLeaves = await leaveRequestModel
            .find({
                user: id
            })
            .sort({ $natural: -1 })
            .populate('user', 'name email mobile')
        res.status(200).json(getLeaves)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

//@route: POST /auth/:id/special-request
//@purpose: : post routes for  user to request special requests
export const requestSpecial = async (req, res) => {
    const { request } = req.body
    const id = req.params.id
    // check if user exists
    const checkUser = await userAccount
        .findById(id)
    if (isEmpty(checkUser)) {
        res.status(404).json({
            success: false,
            message: "User not found!"
        })
    }
    else {
        const newSpecialRequest = new specialRequestModel({
            request,
            user: id,
            username: checkUser.name
        })
        const saveSpecialRequest = await newSpecialRequest.save()
        res.json({
            success: true,
            message: "Special request sent successfully!"
        })
    }

}

//@route: GET /auth/:id/get-special-requests
//@purpose: : get routes for  user to get all special requests
export const getSpecialRequests = async (req, res) => {
    try {
        const id = req.params.id
        const getSpecialRequests = await specialRequestModel
            .find({ user: id })
            .sort({ $natural: -1 })
            .populate('user', 'name email mobile')
        res.status(200).json(getSpecialRequests)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

