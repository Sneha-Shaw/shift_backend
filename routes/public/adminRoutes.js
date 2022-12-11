import express from 'express'
import {
    registerAdmin,
    loginAdmin,
    addDoctor,
    deleteDoctor,
    updateDoctor,
    getAllDoctors,
    getDoctorById
} from '../../controller/adminController.js'
const route = express.Router()

route.post('/register', registerAdmin)
route.post('/login', loginAdmin)
route.post('/add-doctor', addDoctor)
route.post('/delete-doctor/:id', deleteDoctor)
route.put('/update-doctor/:id', updateDoctor)
route.get('/get-all-doctors', getAllDoctors)
route.get('/get-doctor/:id', getDoctorById)

export default route