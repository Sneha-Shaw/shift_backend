import ShiftModel from "../model/ShiftSchema.js";
import SlotModel from '../model/slotSchema.js'
import CalendarModel from "../model/calendarSchema.js";
import userAccount from '../model/userAccountSchema.js'
import breakModel from '../model/breakSchema.js'
import availabilityScheduleModel from '../model/AvailabilityScheduleSchema.js'

import env from 'dotenv'

env.config()

//@route: POST /auth/generate-shift
//@purpose: : post routes to generate shift of a month with respective days by checking in doctors schedule and available slot time
export const generateShift = async (req, res) => {
    // const { date } = req.body

    try {

        // get all doctors
        const getDoctor = await userAccount.find({})
        // console.log(getDoctor);
        // get doctor id
        const getDoctorId = getDoctor.map((doctor) => doctor._id)

        // get doctor names
        const getDoctorName = getDoctor.map((doctor) => doctor.name)
        // console.log(getDoctorName);
        // getBreaks
        const getBreaks = await breakModel.find({})

        // get breaks whose break status is true
        const getBreaksTrue = getBreaks.filter((breaks) => breaks.breakStatus === true)
  
        // get slot
        const getSlot = await SlotModel.find({})
        // get all slots which night duty is true
        const getSlotTrue = getSlot.filter((slot) => slot.isNight === true)

        // get all slots which night duty is false
        const getSlotFalse = getSlot.filter((slot) => slot.isNight === false)

        
        // get all doctors schedule
        for (let i = 0; i < getDoctorId.length; i++) {
            const getDoctorSchedule = await availabilityScheduleModel.findOne({ user: getDoctorId[i] })

            if (getDoctorSchedule) {
                // get schedule day
                const getScheduleDay = getDoctorSchedule.schedule.map((schedule) => schedule.day)
                // console.log(getScheduleDay);
                // get schedule start time
                const getScheduleStartTime = getDoctorSchedule.schedule.map((schedule) => schedule.start)
                // console.log(getScheduleStartTime);
                // get schedule end time
                const getScheduleEndTime = getDoctorSchedule.schedule.map((schedule) => schedule.end)
                // console.log(getScheduleEndTime);
            }

        }
        const currentMonth = new Date().getMonth()

        // get calender of  current month
        const getCalendar = await CalendarModel.findOne({
            calendarArray: {
                $elemMatch: {
                    dayMonth: currentMonth + 1
                }
            }
        })
        // get calendar array
        const getCalendarArray = getCalendar.calendarArray
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}

// @route: POST /shift/generate-calendar
// @purpose: : post routes to generate calendar of a month for current year and month
export const generateCalendar = async (req, res) => {
    const { currentMonth } = req.body
    try {
        // get current year
        const currentYear = new Date().getFullYear()
        // get total number of days in a month
        const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate()
        // create array of days
        const daysArray = [...Array(totalDays).keys()].map((i) => i + 1)
        // create calendar array
        const calendarArray = daysArray.map((day) => {
            const date = new Date(currentYear, currentMonth, day)
            const getDay = date.getDay()
            const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][getDay]
            const dayNumber = day
            const dayMonth = currentMonth + 1
            const dayYear = currentYear
            return {
                dayName,
                dayNumber,
                dayMonth,
                dayYear
            }
        })
        const newCalendar = new CalendarModel({
            calendarArray: calendarArray
        })
        // save calendar array
        const saveCalendar = await newCalendar.save()
        // console.log(saveCalendar);
        // send calendar array
        res.status(200).json({
            success: true,
            message: "Calendar generated successfully!",
            saveCalendar
        })
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}



// @route: POST /shift/add-slot
// @purpose: : post routes to add slot
export const addSlot = async (req, res) => {
    const { slotTime, isNight } = req.body
    try {
        const newSlot = new SlotModel({
            slotTime,
            isNight
        })
        // save slot
        const saveSlot = await newSlot.save()
        // send slot
        res.status(200).json({
            success: true,
            message: "Slot added successfully!",
            saveSlot
        })
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}