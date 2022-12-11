import adminAccount from '../model/adminAccountSchema.js'
import userAccount from '../model/userAccountSchema.js'
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
            success:false,
            message:"Admin with this same email already exist!"
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
                success:false,
                message:"Invalid data!"
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
                success:false,
                message:"Invalid password!"
            })
        }
    }
    else {
        res.status(400).json({
            success:false,
            message:"Invalid email!"
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
        type
    } = req.body
    // const doctorexists
    const doctorexists = await userAccount.findOne({email:email})
    if (doctorexists) {
        res.status(400).json({
            success:false,
            message:"Doctor with this email already exist!"
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
            type
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
                success:false,
                message:"Invalid data!"
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
            success:false,
            message:"Doctor not found!"
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
        type
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
        updateDoctor.save()
        res.json({
            success: true,
            message: "Doctor updated successfully!"
        })
    }
    else {
        res.status(404).json({
            success:false,
            message:"Doctor not found!"
        })
    }
}

// @route: POST /admin/get-doctor/all
// @purpose: : post routes for  admin to get all doctors
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
            success:false,
            message:"No doctor found!"
        })
    }
}

// @route: POST /admin/get-doctor/:id
// @purpose: : post routes for  admin to get doctor by id
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
            success:false,
            message:"Doctor not found!"
        })
    }
}

