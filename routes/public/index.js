import express from 'express'
import authRoute from './authRoutes.js'
import adminRoute from './adminRoutes.js'
import passwordRoute from './passwordRoutes.js'

const router = express.Router()

router.use('/auth', authRoute);
router.use('/admin', adminRoute);
router.use('/password', passwordRoute);


export default router
