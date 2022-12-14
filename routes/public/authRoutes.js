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
    ShiftReplace,
    addAvailability
} from '../../controller/userController.js'
const route = express.Router()

route.post('/login', loginUser)
route.get('/', getUser)
route.get('/get-single-user/:id', getSingleUser)
route.post('/forgot-password', forgotPassword)
route.post('/reset-password/:id', resetPassword)

// leaves
route.post('/:id/request-leave', requestLeave)
route.get('/:id/get-leaves', getLeaves)
// special reuest
route.post('/:id/special-request', requestSpecial)
route.get('/:id/get-special-requests', getSpecialRequests)
// shift replace
route.post('/:id/shift-replace', ShiftReplace)
// add availability
route.post('/:id/add-availability', addAvailability)

export default route
