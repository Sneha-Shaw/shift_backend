import express from 'express'
import {
    addSlot,
    updateSlot,
    updateAllSlot,
    replaceDate,
    getAllSlots
} from '../../controller/slotController.js'

const route = express.Router()


// slots
route.post('/add-slot', addSlot);
route.put('/update-slot', updateSlot);
route.put('/update-all-slots', updateAllSlot);
route.get('/get-all-slots', getAllSlots);
route.put('/replace-date', replaceDate);

export default route