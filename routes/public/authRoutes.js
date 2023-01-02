import express from 'express'
import {
    getSingleUser,
    loginUser,
    getUser,
    updateProfile,
    requestLeave,
    getLeaves,
    requestSpecial,
    getSpecialRequests,
} from '../../controller/userController.js'
const route = express.Router()

route.post('/login', loginUser)
route.get('/get-all-users', getUser)
route.get('/get-single-user/:id', getSingleUser)
route.put('/:id/update-profile', updateProfile)

// leaves
route.post('/:id/request-leave', requestLeave)
route.get('/:id/get-leaves', getLeaves)
// special reuest
route.post('/:id/special-request', requestSpecial)
route.get('/:id/get-special-requests', getSpecialRequests)

export default route
