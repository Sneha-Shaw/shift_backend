import express from 'express'
import {
    generateShift
} from '../../controller/shiftController.js'


const route = express.Router()

route.post('/generate-shift', generateShift);

export default route