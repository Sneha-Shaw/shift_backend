import express from 'express'
import {
    generateShift,
    createShift,
    getShifts,
    getShiftsByMonth,
    getShiftsByDoctor,
    getShiftsByDomain,
    getShiftsByDoctorId,
    updateShift,
    approveOrDecline,
    deleteShift,
    deleteAllShifts,
    ShiftReplace,
    getShiftReplaceRequests
} from '../../controller/shiftController.js'


const route = express.Router()

// shifts
route.post('/generate-shift', generateShift);
route.post('/create-shift', createShift);

route.get('/get-shifts', getShifts);
route.get('/get-shifts-by-month', getShiftsByMonth);
route.get('/get-shifts-by-doctor', getShiftsByDoctor);
route.get('/get-shifts-by-domain', getShiftsByDomain);
route.get('/get-shifts-by-doctor/:id', getShiftsByDoctorId);

route.put('/update-shift/:id', updateShift);
route.put('/approve-or-decline', approveOrDecline);

route.delete('/delete-shift/:id', deleteShift);
route.delete('/delete-all-shifts', deleteAllShifts);

// shift replace
route.post('/shift-replace', ShiftReplace);
route.get('/get-shift-replace-requests', getShiftReplaceRequests);


export default route