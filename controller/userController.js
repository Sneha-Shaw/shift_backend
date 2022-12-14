import userAccount from '../model/userAccountSchema.js'
import leaveRequestModel from '../model/LeaveRequestSchema.js'
import specialRequestModel from '../model/specialRequestSchema.js'
import availabilityScheduleModel from '../model/AvailabilityScheduleSchema.js'
import shiftReplaceModel from '../model/ShiftReplaceSchema.js'
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
    const checkEmail = await userAccount.findOne({ email: email })
    if (!isEmpty(checkEmail)) {
        const token = generateToken(checkEmail._id)
        const resetLink = `http://localhost:3000/reset-password/${token}`
        res.json({
            resetLink
        })
    } else {
        res.status(404).json({
            success: false,
            message: "User not found!"
        })
    }
}

//@route: POST /auth/:id/reset-password
//@purpose: : post routes for  user to reset password
export const resetPassword = async (req, res) => {
    const { password } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    const id = req.params.id
    const updateUser = await userAccount.findByIdAndUpdate
        (
            id,
            {
                password: hashedPassword
            },
            {
                new: true
            }
        )
    res.json({
        success: true,
        message: "Password updated successfully!"
    })
}

//@route: POST /auth/:id/request-leave
//@purpose: : post routes for  user to request leave
export const requestLeave = async (req, res) => {
    const { leaveType, startDate, endDate, reason } = req.body
    const id = req.params.id
    const newLeaveRequest = new leaveRequestModel({
        leaveType,
        leaveDuration,
        startDate,
        endDate,
        leaveReason,
        user: id
    })
    const saveLeaveRequest = await newLeaveRequest.save()
    res.json({
        success: true,
        message: "Leave request sent successfully!"
    })
}

//@route: GET /auth/:id/get-leaves
//@purpose: : get routes for  user to get all leave request
export const getLeaves = async (req, res) => {
    try {
        const id = req.params.id
        const getLeaves = await leaveRequestModel
            .find({ user: id })
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
            user: id
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
            .populate('user', 'name email mobile')
        res.status(200).json(getSpecialRequests)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}


//@route: POST /auth/:id/shift-replace
//@purpose: : post routes for  user to request shift replace
export const ShiftReplace = async (req, res) => {
    const { name, replacement, date, start, end } = req.body
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
        const newShiftReplaceRequest = new shiftReplaceModel({
            name,
            replacement,
            date,
            start,
            end,
            user: id
        })
        const saveShiftReplaceRequest = await newShiftReplaceRequest.save()
        res.json({
            success: true,
            message: "Shift replace request sent successfully!",
            saveShiftReplaceRequest
        })
    }
}

//@route: POST /auth/:id/add-availability
//@purpose: : post routes for  user to add availability
export const addAvailability = async (req, res) => {
    const { schedule } = req.body
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
// if user is already in the availability model then edit it according to the input else create a new
        const checkAvailability = await availabilityScheduleModel
            .findOne({ user: id })
        if (isEmpty(checkAvailability)) {
            const newAvailability = new availabilityScheduleModel({
                schedule,
                user: id
            })
            const saveAvailability = await newAvailability.save()
            res.json({
                success: true,
                message: "Availability added successfully!",
                saveAvailability
            })
        }
        else {
            const editAvailability = await availabilityScheduleModel
                .findOneAndUpdate(
                    { user: id },
                    {
                        schedule
                    },
                    {
                        new: true
                    }
                )
            res.json({
                success: true,
                message: "Availability edited successfully!",
                editAvailability
            })
        }
    }
}
