import express from 'express'
import shiftRoute from './shiftRoutes.js'
import availabilityRoute from './availabilityRoutes.js'
import slotRoute from './slotRoutes.js'
import calendarRoute from './calendarRoutes.js'

const router = express.Router()

router.use('/shift', shiftRoute)
router.use('/availability', availabilityRoute)
router.use('/slot', slotRoute)
router.use('/calendar', calendarRoute)

export default router
