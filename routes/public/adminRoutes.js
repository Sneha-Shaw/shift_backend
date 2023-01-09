import express from 'express'
import {
    registerAdmin,
    loginAdmin,
    getAdminProfile,
    updateAdminProfile,
    addDomain,
    getAllDomains,
    getDomainById,
    updateDomain,
    deleteDomain,
    addDoctor,
    searchDoctor,
    deleteDoctor,
    updateDoctor,
    removeDomain,
    getAllDoctors,
    getDoctorById,
    addBreaks,
    deleteBreaks,
    getAllBreaks,
    getBreaksById,
    updateBreakStatus,
    getAllLeaves,
    approveDenyLeave,
    getSpecialRequests,
    approveDenySpecialRequest
} from '../../controller/adminController.js'
const route = express.Router()

// admin auth
route.post('/register', registerAdmin)
route.post('/login', loginAdmin)
route.get('/get-profile/:id', getAdminProfile)
route.put('/update-profile/:id', updateAdminProfile)
// doctor
route.post('/add-doctor', addDoctor)
route.get('/search-doctor', searchDoctor)
route.post('/delete-doctor', deleteDoctor)
route.put('/update-doctor/:id', updateDoctor)
route.put('/remove-domain/:id', removeDomain)
route.get('/get-all-doctors', getAllDoctors)
route.get('/get-doctor/:id', getDoctorById)
// break
route.post('/add-breaks', addBreaks)
route.post('/delete-break/:id', deleteBreaks)
route.get('/get-all-breaks', getAllBreaks)
route.get('/get-break/:id', getBreaksById)
route.put('/update-break-status/:id', updateBreakStatus)
// leave
route.get('/get-all-leaves', getAllLeaves)
route.put('/approve-deny-leave/:id', approveDenyLeave)
// special requests
route.get('/get-all-special-requests', getSpecialRequests)
route.put('/approve-deny-special-request/:id', approveDenySpecialRequest)
// domain
route.post('/add-domain', addDomain)
route.get('/get-all-domains', getAllDomains)
route.get('/get-domain/:id', getDomainById)
route.put('/update-domain/:id', updateDomain)
route.post('/delete-domain/:id', deleteDomain)

export default route