import express from 'express'
import {
    registerAdmin,
    loginAdmin,
    addDoctor,
    deleteDoctor,
    updateDoctor,
    getAllDoctors,
    getDoctorById,
    addBreaks,
    deleteBreaks,
    getAllBreaks,
    getBreaksById,
    updateBreakStatus,
    getAllLeaves,
    approveDenyLeave,
    getSpecialRequests
} from '../../controller/adminController.js'
const route = express.Router()

// admin auth
route.post('/register', registerAdmin)
route.post('/login', loginAdmin)
// doctor
route.post('/add-doctor', addDoctor)
route.post('/delete-doctor/:id', deleteDoctor)
route.put('/update-doctor/:id', updateDoctor)
route.get('/get-all-doctors', getAllDoctors)
route.get('/get-doctor/:id', getDoctorById)
// break
route.post('/add-breaks', addBreaks)
route.post('/delete-break', deleteBreaks)
route.get('/get-all-breaks', getAllBreaks)
route.get('/get-break/:id', getBreaksById)
route.put('/update-break-status', updateBreakStatus)
// leave
route.get('/get-all-leaves', getAllLeaves)
route.put('/approve-deny-leave', approveDenyLeave)
// special requests
route.get('/get-special-requests', getSpecialRequests)

export default route