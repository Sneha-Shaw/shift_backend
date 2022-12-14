import express from 'express'
import {
    generateShift,
    generateCalendar
} from '../../controller/shiftController.js'


const route = express.Router()

route.post('/generate-shift', generateShift);
route.post('/generate-calendar', generateCalendar);

export default route