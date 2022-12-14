import express from 'express'
import shiftRoute from './shiftRoutes.js'

const router = express.Router()

router.use('/shift', shiftRoute)

export default router
