import express from 'express'
import env from 'dotenv'

// IMPORT DB CONNECTION
import mongodbConnection from './config/db.js'

import cors from 'cors'

//IMPORT ALL ROUTES
import homeRoute from './routes/homeRoute.js'
import privateRoute from './routes/private/index.js'
import publicRoute from './routes/public/index.js'
import morgan from 'morgan'

const app = express()
app.set('view engine','ejs')
env.config()

// parse urlencoded request body
app.use(express.urlencoded({ limit: '69mb' }))
app.use(express.urlencoded({ extended: true }))
// parse json request body
app.use(express.json())

// enable cors
app.use(cors())
app.use(morgan('dev'))
app.options('*', cors())

// Mongodb connection
mongodbConnection()


// HOME ROUTE
app.use('/', homeRoute)
app.use('/private', privateRoute)
app.use('/public', publicRoute)

// Server Listen
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})