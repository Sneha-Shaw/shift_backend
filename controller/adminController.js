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

// @route: POST /admin/add-doctor
// @purpose: : post routes for  admin to add doctor and send them email with their email and a random password
export const addDoctor = async (req, res) => {
    const {
        name,
        email,
        mobile,
        password,
        department,
        designation,
        type,
        dutyHoursPerMonth,
        dutyHoursPerDay
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
            department,
            designation,
            type,
            dutyHoursPerMonth,
            dutyHoursPerDay
        })
        createDoctor.save()
        if (createDoctor) {
            res.json({
                success: true,
                _id: createDoctor._id,
                email: createDoctor.email
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
        password,
        department,
        designation,
        type,
        dutyHoursPerMonth,
        dutyHoursPerDay
    } = req.body
    const updateDoctor = await userAccount.findOne
        ({
            email: email
        })
    if (updateDoctor) {
        updateDoctor.name = name
        updateDoctor.email = email
        updateDoctor.mobile = mobile
        updateDoctor.password = password
        updateDoctor.department = department
        updateDoctor.designation = designation
        updateDoctor.type = type
        updateDoctor.dutyHoursPerMonth = dutyHoursPerMonth
        updateDoctor.dutyHoursPerDay = dutyHoursPerDay
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
    const { breakName } = req.body
    const deleteBreaks = await breakModel.findOne
        ({
            breakName: breakName
        })
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
    const { breakName, breakStatus } = req.body
    const updateBreakStatus = await breakModel.findOne
        ({
            breakName: breakName
        })
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
// @route: PUT /admin/approve-deny-leave
// @purpose: post routes for admin to approve or deny leave to a particular user
export const approveDenyLeave = async (req, res) => {
    const { leaveId, leaveStatus } = req.body
    const approveDenyLeave = await leaveRequestModel.findById(leaveId)
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

// @route: POST /admin/get-special-requests
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