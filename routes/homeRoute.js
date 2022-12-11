import express from 'express'

const route = express.Router()

route.get('/', function (req, res) {
    res.send('Welcome to Tricog - Roster Management System Backend')
})

export default route
