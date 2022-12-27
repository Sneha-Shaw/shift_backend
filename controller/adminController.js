import adminAccount from '../model/adminAccountSchema.js'
import userAccount from '../model/userAccountSchema.js'
import breakModel from '../model/breakSchema.js'
import leaveRequestModel from '../model/LeaveRequestSchema.js'
import specialRequestModel from '../model/specialRequestSchema.js'
import { generateToken } from '../utils/generateToken.js'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import env from 'dotenv'
import isEmpty from '../utils/isEmpty.js'
import AddUserMailer from '../utils/mailer/UserDetailsMailer.js'

env.config()

//@route: POST /admin/signup
//@purpose: : post routes for  admin to signup
export const registerAdmin = async (req, res) => {
    const { email, mobile, password } = req.body

    const adminExist = await adminAccount.findOne({ email: email })
    if (adminExist) {
        res.status(400).json({
            success: false,
            message: "Admin with this same email already exist!"
        })
    } else {
        const createadminAccount = await adminAccount.create({

            email,
            mobile,
            password
        })
        createadminAccount.save()
        if (createadminAccount) {
            res.json({
                _id: createadminAccount._id,
                email: createadminAccount.email
            })
        } else {
            res.status(404).json({
                success: false,
                message: "Invalid data!"
            })
        }
    }
}

//@route: POST /admin/login
//@purpose: : post routes for  admin to login
export const loginAdmin = async (req, res) => {
    const { email, password } = req.body

    const checkEmail = await adminAccount.findOne({ email: email })
    if (!isEmpty(checkEmail)) {
        const checkPassword = await bcrypt.compare(password, checkEmail.password)
        if (checkPassword) {
            res.json({
                _id: checkEmail._id,
                email: checkEmail.email,
                token: generateToken(checkEmail._id)
            })
        } else {
            res.status(400).json({
                success: false,
                message: "Invalid password!"
            })
        }
    }
    else {
        res.status(400).json({
            success: false,
            message: "Invalid email!"
        })
    }
}

// @route: GET /admin/get-admin/:id
// @purpose: : get routes for  admin to get their profile
export const getAdminProfile = async (req, res) => {
    const id= req.params.id
    const admin = await adminAccount.findById(id)
    console.log(admin,id);
    if (admin) {
        res.json({
            success: true,
            admin
        })
    } else {
        res.status(404).json({
            success: false,
            message: "Admin not found!"
        })
    }
}

// @route: POST /admin/add-doctor
// @purpose: : post routes for  admin to add doctor and send them email with their email and a random password
export const addDoctor = async (req, res) => {
    const {
        name,
        email,
        mobile,
        password,
        designation,
        type,
        dutyHoursPerMonth,
        dutyHoursPerDay,
        nightDuty
    } = req.body
    // const doctorexists
    const doctorexists = await userAccount.findOne({ email: email })
    if (doctorexists) {
        res.status(400).json({
            success: false,
            message: "Doctor with this email already exist!"
        })
    }
    else {
        const createDoctor = await userAccount.create({
            name,
            email,
            mobile,
            password,
            designation,
            type,
            dutyHoursPerMonth,
            dutyHoursPerDay,
            nightDuty
        })
        createDoctor.save()
        if (createDoctor) {
            AddUserMailer(createDoctor)
            .then((result) => console.log('email sent..', result))
            .catch((error) => console.log(error.message))
            
            res.json({
                success: true,
                createDoctor
            })
        } else {
            res.status(404).json({
                success: false,
                message: "Invalid data!"
            })
        }
    }
}

// @route: POST /admin/delete-doctor
// @purpose: : post routes for  admin to delete doctor
export const deleteDoctor = async (req, res) => {
    const { email } = req.body
    const deleteDoctor = await userAccount.findOne
        ({
            email: email
        })
    if (deleteDoctor) {
        deleteDoctor.remove()
        res.json({
            success: true,
            message: "Doctor deleted successfully!"
        })
    }
    else {
        res.status(404).json({
            success: false,
            message: "Doctor not found!"
        })
    }
}

// @route: PUT /admin/update-doctor
// @purpose: : post routes for  admin to update doctor
export const updateDoctor = async (req, res) => {
    const {
        name,
        email,
        mobile,
        designation,
        type,
        dutyHoursPerMonth,
        dutyHoursPerDay,
        nightDuty
    } = req.body
    const id = req.params.id
    const updateDoctor = await userAccount.findById
        ({
            _id: id
        })
    if (updateDoctor) {
        updateDoctor.name = name ||  updateDoctor.name
        updateDoctor.email = email || updateDoctor.email
        updateDoctor.mobile = mobile || updateDoctor.mobile
        updateDoctor.designation = designation || updateDoctor.designation
        updateDoctor.type = type || updateDoctor.type
        updateDoctor.dutyHoursPerMonth = dutyHoursPerMonth || updateDoctor.dutyHoursPerMonth
        updateDoctor.dutyHoursPerDay = dutyHoursPerDay || updateDoctor.dutyHoursPerDay
        updateDoctor.nightDuty = nightDuty || updateDoctor.nightDuty
        updateDoctor.save()
        res.json({
            success: true,
            message: "Doctor updated successfully!"
        })
    }
    else {
        res.status(404).json({
            success: false,
            message: "Doctor not found!"
        })
    }
}

// @route: GET /admin/get-doctor/all
// @purpose: : get routes for  admin to get all doctors
export const getAllDoctors = async (req, res) => {
    const getAllDoctors = await userAccount.find({})
    if (getAllDoctors) {
        res.json({
            success: true,
            getAllDoctors
        })
    }
    else {
        res.status(404).json({
            success: false,
            message: "No doctor found!"
        })
    }
}

// @route: GET /admin/get-doctor/:id
// @purpose: : get routes for  admin to get doctor by id
export const getDoctorById = async (req, res) => {
    const id = req.params.id
    const getDoctorById = await userAccount.findById(id)
    if (getDoctorById) {
        res.json({
            success: true,
            getDoctorById
        })
    }
    else {
        res.status(404).json({
            success: false,
            message: "Doctor not found!"
        })
    }
}

// @route: POST /admin/add-breaks
// @purpose: : post routes for  admin to add breaks
export const addBreaks = async (req, res) => {
    const {
        breakName,
        startTime,
        endTime,
        breakDuration,
        breakType,
        breakStatus
    } = req.body
    // check if name is alreafy in the database
    const breakExists = await breakModel.findOne({
        breakName
            : breakName
    })
    if (breakExists) {
        res.status(400).json({
            success: false,
            message: "Break with this name already exist!"
        })
    }
    else {
        const createBreak = await breakModel.create({
            breakName,
            startTime,
            endTime,
            breakDuration,
            breakType,
            breakStatus
        })
        createBreak.save()
        if (createBreak) {
            res.json({
                success: true,
                _id: createBreak._id,
                breakName: createBreak.breakName
            })
        } else {
            res.status(404).json({
                success: false,
                message: "Invalid data!"
            })
        }
    }
}

// @route: POST /admin/delete-break
// @purpose: : post routes for  admin to delete breaks
export const deleteBreaks = async (req, res) => {
    const id = req.params.id
    const deleteBreaks = await breakModel.findById(id)
    if (deleteBreaks) {
        deleteBreaks.remove()
        res.json({
            success: true,
            message: "Break deleted successfully!"
        })
    }
    else {
        res.status(404).json({
            success: false,
            message: "Break not found!"
        })
    }
}

// @route: GET /admin/get-all-breaks
// @purpose: : get routes for  admin to get all breaks
export const getAllBreaks = async (req, res) => {
    const getAllBreaks = await breakModel.find({})
    if (getAllBreaks) {
        res.json({
            success: true,
            getAllBreaks
        })
    }
    else {
        res.status(404).json({
            success: false,
            message: "No break found!"
        })
    }
}

// @route: GET /admin/get-break/:id
// @purpose: : get routes for  admin to get breaks by id
export const getBreaksById = async (req, res) => {
    const id = req.params.id
    const getBreaksById = await breakModel.findById(id)
    if (getBreaksById) {
        res.json({
            success: true,
            getBreaksById
        })
    }
    else {
        res.status(404).json({
            success: false,
            message: "Break not found!"
        })
    }
}

// @route: PUT /admin/update-break-status
// @purpose: : post routes for  admin to update break status
export const updateBreakStatus = async (req, res) => {
    const id = req.params.id
    const { breakStatus } = req.body
    const updateBreakStatus = await breakModel.findById(id)
    if (updateBreakStatus) {
        updateBreakStatus.breakStatus = breakStatus
        updateBreakStatus.save()
        res.json({
            success: true,
            message: "Break status updated successfully!"
        })
    }
    else {
        res.status(404).json({
            success: false,
            message: "Break not found!"
        })
    }
}

// @route: GET /admin/get-all-leaves
// @purpose: : get routes for  admin to get all leaves
export const getAllLeaves = async (req, res) => {
    const getAllLeaves = await leaveRequestModel.find({})
    if (getAllLeaves) {
        res.json({
            success: true,
            getAllLeaves
        })
    }
    else {
        res.status(404).json({
            success: false,
            message: "No leave found!"
        })
    }
}
// @route: PUT /admin/approve-deny-leave/:id
// @purpose: post routes for admin to approve or deny leave to a particular user
export const approveDenyLeave = async (req, res) => {
    const id = req.params.id
    const { leaveStatus } = req.body
    const approveDenyLeave = await leaveRequestModel.findById(id)
    if (approveDenyLeave) {
        approveDenyLeave.leaveStatus = leaveStatus
        approveDenyLeave.save()
        res.json({
            success: true,
            message: "Leave status updated successfully!"
        })
    }
    else {
        res.status(404).json({
            success: false,
            message: "Leave not found!"
        })
    }
}

// @route: POST /admin/get-all-special-requests
// @purpose: post routes for admin to get all special request
export const getSpecialRequests = async (req, res) => {
    const getSpecialRequests = await specialRequestModel.find({})
    if (getSpecialRequests) {
        res.json({
            success: true,
            getSpecialRequests
        })
    }
    else {
        res.status(404).json({
            success: false,
            message: "No special request found!"
        })
    }
}

// @route: PUT /admin/approve-deny-special-request/:id
// @purpose: post routes for admin to approve or deny special request to a particular user
export const approveDenySpecialRequest = async (req, res) => {
    const id = req.params.id
    const { requestStatus } = req.body
    const approveDenySpecialRequest = await specialRequestModel.findById(id)
    if (approveDenySpecialRequest) {
        approveDenySpecialRequest.requestStatus = requestStatus
        approveDenySpecialRequest.save()
        res.json({
            success: true,
            message: "Special request status updated successfully!"
        })
    }
    else {
        res.status(404).json({
            success: false,
            message: "Special request not found!"
        })
    }
}