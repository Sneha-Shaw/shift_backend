import express from 'express'
import {
    addAvailability,
    getAvailability,
    getAllAvailability,
    deleteAvailability,
    getAvailabilityByDate,
    deleteAvailabilityById
} from '../../controller/availabilityController.js'

const route = express.Router()


// add availability
route.post('/add-availability', addAvailability)
// get availability
route.get('/:id/get-availability', getAvailability)
// get all availability
route.get('/get-all-availability', getAllAvailability)
// delete availability
route.post('/delete-availability', deleteAvailability)
// get availability by date
route.get('/get-availability-by-date', getAvailabilityByDate)
// delete availability by id
route.post('/delete-availability-by-id/:id', deleteAvailabilityById)


export default route