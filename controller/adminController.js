import adminAccount from '../model/adminAccountSchema.js'
import userAccount from '../model/userAccountSchema.js'
import breakModel from '../model/breakSchema.js'
import leaveRequestModel from '../model/LeaveRequestSchema.js'
import specialRequestModel from '../model/specialRequestSchema.js'
import domainModel from '../model/DomainSchema.js'
import { generateToken } from '../utils/generateToken.js'
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
                name: checkEmail.name,
                token: generateToken(checkEmail._id)
            })
        } else {
            res.status(401).json({
                success: false,
                message: "Wrong password!"
            })
        }
    }
    else {
        res.status(404).json({
            success: false,
            message: "Admin not found!"
        })
    }
}

// @route: GET /admin/get-admin/:id
// @purpose: : get routes for  admin to get their profile
export const getAdminProfile = async (req, res) => {
    const id = req.params.id
    const admin = await adminAccount.findById(id)
    console.log(admin, id);
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

// @route: PUT /admin/update-admin/:id
// @purpose: : put routes for  admin to update their profile
export const updateAdminProfile = async (req, res) => {

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
            about
        } = req.body
        const admin = await adminAccount.findById(id)
        if (admin) {
            admin.name = admin.name || name
            admin.email = admin.email || email
            admin.mobile = admin.mobile || mobile
            admin.address = admin.address || address
            admin.city = admin.city || city
            admin.state = admin.state || state
            admin.pincode = admin.pincode || pincode
            admin.about = admin.about || about
            const updatedAdmin = await admin.save()
            res.status(200).json({
                success: true,
                updatedAdmin
            })
        } else {
            res.status(404).json({
                success: false,
                message: "Admin not found!"
            })
        }
    }
    catch (err) {
        res.status(400).json({
            message: error.message
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
        domain,
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
            domain,
            type,
            dutyHoursPerMonth,
            dutyHoursPerDay,
            nightDuty
        })
        createDoctor.save()
        if (createDoctor) {
            AddUserMailer(name,
                email,
                password)

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

// @route: GET /admin/search-doctor
// @purpose: : get routes for  admin to search doctor
export const searchDoctor = async (req, res) => {
    let { name } = req.query

    name = name ?
        {
            name: {
                $regex: name,
                $options: 'i'
            }
        }
        :
        {}
    const searchDoctor = await userAccount.find({
        ...name
    })
    if (searchDoctor) {
        res.json({
            success: true,
            searchDoctor
        })
    }
    else {
        res.status(404).json({
            success: false,
            message: "Doctor not found!"
        })
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
        domain,
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
        updateDoctor.name = name || updateDoctor.name
        updateDoctor.email = email || updateDoctor.email
        updateDoctor.mobile = mobile || updateDoctor.mobile
        updateDoctor.designation = designation || updateDoctor.designation
        updateDoctor.type = type || updateDoctor.type
        updateDoctor.dutyHoursPerMonth = dutyHoursPerMonth || updateDoctor.dutyHoursPerMonth
        updateDoctor.dutyHoursPerDay = dutyHoursPerDay || updateDoctor.dutyHoursPerDay
        // check if updateDoctor.nughtDuty is equal to nighduty
        if (updateDoctor.nightDuty === nightDuty) {
            updateDoctor.nightDuty = updateDoctor.nightDuty
        }
        else {
            updateDoctor.nightDuty = nightDuty
        }
        // check if domain is an array
        if (Array.isArray(domain)) {
            domain.forEach((element) => {
                //   check if element is already in user details
                if (!updateDoctor.domain.includes(element)) {
                    updateDoctor.domain.push(element)
                }
            })
        }
        else {
            if (!updateDoctor.domain.includes(domain)) {
                updateDoctor.domain.push(domain)
            }
        }

        updateDoctor.save()
        res.status(200).json({
            success: true,
            message: "Doctor updated successfully!",
            updateDoctor
        })
    }
    else {
        res.status(404).json({
            success: false,
            message: "Doctor not found!"
        })
    }
}

// @route PUT /admin/remove-domain
// @purpose: : post routes for  admin to update domain
export const removeDomain = async (req, res) => {
    const { domain } = req.body
    const id = req.params.id
    const removeDomain = await userAccount.findById({
        _id: id
    })
    if (removeDomain) {
        // check if domain is an array
        if (Array.isArray(domain)) {
            domain.forEach((element) => {
                removeDomain.domain = removeDomain.domain.filter((item) => item !== element)
            })
        }
        else {
            removeDomain.domain = removeDomain.domain.filter((item) => item !== domain)
        }
        console.log(removeDomain.domain);
        removeDomain.save()
        res.status(200).json({
            success: true,
            message: "Domain removed successfully!"
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
    const getAllBreaks = await breakModel.find({}).sort({ $natural: -1 })
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
    const getAllLeaves = await leaveRequestModel.find({}).sort({ $natural: -1 })
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
    const getSpecialRequests = await specialRequestModel.find({}).sort({ $natural: -1 })
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

// @route: POST /admin/add-domain
// @purpose: post routes for admin to add domain
export const addDomain = async (req, res) => {
    const { domainName } = req.body
    const domainExists = await domainModel.findOne({
        domainName
            : domainName
    })
    if (domainExists) {
        res.status(400).json({
            success: false,
            message: "Domain with this name already exist!"
        })
    }
    else {
        const createDomain = await domainModel.create({
            domainName
        })
        createDomain.save()
        if (createDomain) {
            res.json({
                success: true,
                _id: createDomain._id,
                domainName: createDomain.domainName
            })
        } else {
            res.status(404).json({
                success: false,
                message: "Invalid data!"
            })
        }
    }

}

// @route: GET /admin/get-all-domains
// @purpose: get routes for admin to get all domains
export const getAllDomains = async (req, res) => {
    const getAllDomains = await domainModel.find({})
    if (getAllDomains) {
        res.json({
            success: true,
            getAllDomains
        })
    }
    else {
        res.status(404).json({
            success: false,
            message: "No domain found!"
        })
    }
}

// @route: GET /admin/get-domain/:id
// @purpose: get routes for admin to get domain by id
export const getDomainById = async (req, res) => {
    const id = req.params.id
    const getDomainById = await domainModel.findById(id)
    if (getDomainById) {
        res.json({
            success: true,
            getDomainById
        })
    }
    else {
        res.status(404).json({
            success: false,
            message: "Domain not found!"
        })
    }
}

// @route: PUT /admin/update-domain/:id
// @purpose: put routes for admin to update domain

export const updateDomain = async (req, res) => {
    const id = req.params.id
    const { domainName } = req.body
    const domainExists = await domainModel
        .findOne({
            domainName
                : domainName
        })

    if (domainExists) {
        res.status(400).json({
            success: false,
            message: "Domain with this name already exist!"
        })
    }
    else {
        const updateDomain = await domainModel
            .findById(id)
        if (updateDomain) {
            updateDomain.domainName = domainName
            updateDomain.save()
            res.json({
                success: true,
                message: "Domain updated successfully!"
            })
        }

        else {
            res.status(404).json({
                success: false,
                message: "Domain not found!"
            })
        }

    }
}

// @route: DELETE /admin/delete-domain/:id
// @purpose: delete routes for admin to delete domain
export const deleteDomain = async (req, res) => {
    const id = req.params.id
    const deleteDomain = await domainModel.findById
        (id)
    if (deleteDomain) {
        await deleteDomain.remove()
        res.json({
            success: true,
            message: "Domain deleted successfully!"
        })
    }
    else {
        res.status(404).json({
            success: false,
            message: "Domain not found!"
        })
    }

}

