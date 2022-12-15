import express from 'express'
import {
    generateShift,
    generateCalendar,
    addSlot
} from '../../controller/shiftController.js'


const route = express.Router()

route.post('/generate-shift', generateShift);
route.post('/generate-calendar', generateCalendar);
route.post('/add-slot', addSlot);

export default route