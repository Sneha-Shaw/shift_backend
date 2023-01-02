import express from 'express'
import {
    generateShift,
    createShift,
    getShifts,
    getShiftsByDate,
    getShiftsByDoctor,
    updateShift,
    approveOrDecline,
    deleteShiftByDate,
    deleteAllShifts,
    generateCalendar,
    getCalendar,
    addSlot,
    updateSlot,
    updateAllSlot,
    getAllSlots,
    ShiftReplace,
    getShiftReplaceRequests,
    addAvailability,
    getAvailability,
    getAllAvailability,
    deleteAvailability,
    getAvailabilityByDate,
    deleteAvailabilityByDate
} from '../../controller/shiftController.js'


const route = express.Router()

// shifts
route.post('/generate-shift', generateShift);
route.post('/create-shift', createShift);

route.get('/get-shifts', getShifts);
route.get('/get-shifts-by-date', getShiftsByDate);
route.get('/get-shifts-by-doctor', getShiftsByDoctor);

route.put('/update-shift', updateShift);
route.put('/approve-or-decline', approveOrDecline);

route.delete('/delete-shift-by-date', deleteShiftByDate);
route.delete('/delete-all-shifts', deleteAllShifts);
route.delete('/delete-all-shifts', deleteAllShifts);

// calendar
route.post('/generate-calendar', generateCalendar);
route.get('/get-calendar', getCalendar);

// slots
route.post('/add-slot', addSlot);
route.put('/update-slot', updateSlot);
route.put('/update-all-slots', updateAllSlot);
route.get('/get-all-slots', getAllSlots);

// shift replace
route.post('/shift-replace', ShiftReplace);
route.get('/get-shift-replace-requests', getShiftReplaceRequests);

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
// delete availability by date
route.put('/delete-availability-by-date', deleteAvailabilityByDate)

export default route