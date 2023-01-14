import express from 'express'
import {
    addSlot,
    updateSlot,
    updateAllSlot,
    getAllSlots
} from '../../controller/slotController.js'

const route = express.Router()


// slots
route.post('/add-slot', addSlot);
route.put('/update-slot', updateSlot);
route.put('/update-all-slots', updateAllSlot);
route.get('/get-all-slots', getAllSlots);

export default route