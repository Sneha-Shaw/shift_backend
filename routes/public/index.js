import express from 'express'
import authRoute from './authRoutes.js'
import adminRoute from './adminRoutes.js'

const router = express.Router()

router.use('/auth', authRoute);
router.use('/admin', adminRoute);

export default router
