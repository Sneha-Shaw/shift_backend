import userAccount from '../model/userAccountSchema.js'
import leaveRequestModel from '../model/LeaveRequestSchema.js'
import specialRequestModel from '../model/specialRequestSchema.js'
import availabilityScheduleModel from '../model/AvailabilityScheduleSchema.js'
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
                _id: checkEmail._id

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
            checkUser.nightDuty = nightDuty || checkUser.nightDuty
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
                        //    get all elements from schedule then push in schedule
                        $push: {
                            schedule: {
                                $each: schedule
                            }
                        }
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

// @route: GET /auth/:id/get-availability   
// @purpose: : get routes for  user to get availability
export const getAvailability = async (req, res) => {
    try {
        const id = req.params.id
        const getAvailability = await availabilityScheduleModel
            .find({ user: id })
            .sort({ $natural: -1 })
            .populate('user', 'name email mobile')
        res.status(200).json(getAvailability)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

//@route: DELETE /auth/:id/delete-availability
//@purpose: : post routes for  user to delete availability
export const deleteAvailability = async (req, res) => {
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
        const deleteAvailability = await availabilityScheduleModel
            .findOneAndDelete({ user: id })
        res.json({
            success: true,
            message: "Availability deleted successfully!",
            deleteAvailability
        })
    }
}

// @route: POST /auth/:id/delete-availability-by-day
// @purpose: : post routes for  user to delete availability by day ex: schedule[{day:monday,start:'12:00 pm,end: ''}] so del the object that has monday in it
export const deleteAvailabilityByDay = async (req, res) => {
    const { day } = req.body
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
        const deleteAvailability = await availabilityScheduleModel
            .findOneAndUpdate(
                { user: id },
                {
                    $pull: { schedule: { day } }
                },
                {
                    new: true
                }
            )
        res.json({
            success: true,
            message: "Availability deleted successfully!"
        })
    }
}