import express from 'express'
import {
    generateCalendar,
    getCalendar
} from '../../controller/calendarController.js'

const route = express.Router()

// calendar
route.post('/generate-calendar', generateCalendar);
route.get('/get-calendar', getCalendar);

export default route