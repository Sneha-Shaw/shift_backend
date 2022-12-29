import express from 'express'
import {
    getSingleUser,
    loginUser,
    getUser,
    forgotPassword,
    resetPassword,
    requestLeave,
    getLeaves,
    requestSpecial,
    getSpecialRequests,
    addAvailability,
    getAvailability,
    deleteAvailability,
    deleteAvailabilityByDay
} from '../../controller/userController.js'
const route = express.Router()

route.post('/login', loginUser)
route.get('/get-all-users', getUser)
route.get('/get-single-user/:id', getSingleUser)
route.post('/forgot-password', forgotPassword)
route.post('/:id/reset-password', resetPassword)

// leaves
route.post('/:id/request-leave', requestLeave)
route.get('/:id/get-leaves', getLeaves)
// special reuest
route.post('/:id/special-request', requestSpecial)
route.get('/:id/get-special-requests', getSpecialRequests)
// add availability
route.post('/:id/add-availability', addAvailability)
// get availability
route.get('/:id/get-availability', getAvailability)
// delete availability
route.delete('/:id/delete-availability', deleteAvailability)
// delete availability by day
route.put('/:id/delete-availability-by-day', deleteAvailabilityByDay)

export default route
