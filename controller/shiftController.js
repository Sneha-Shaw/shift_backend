import ShiftModel from "../model/ShiftSchema.js";
import SlotModel from '../model/slotSchema.js'
import CalendarModel from "../model/calendarSchema.js";
import userAccount from '../model/userAccountSchema.js'
import breakModel from '../model/breakSchema.js'
import availabilityScheduleModel from '../model/AvailabilityScheduleSchema.js'
import shiftReplaceModel from '../model/ShiftReplaceSchema.js'
import isEmpty from '../utils/isEmpty.js'
import moment from "moment/moment.js";

import env from 'dotenv'

env.config()

//@route: POST /shift/generate-shift
//@purpose: : post routes to generate shift of a month with respective days by checking in doctors schedule and available slot time
export const generateShift = async (req, res) => {
    const { currentMonth, currentYear } = req.body

    try {
        // get calender of current month
        var getCalendar = await CalendarModel.findOne({
            calendarArray: {
                $elemMatch: {
                    dayMonth: currentMonth + 1,
                    dayYear: currentYear
                }
            }
        })
        // get calendar array
        var getCalendarArray = getCalendar.calendarArray
        // get the total no days in the month
        var totalDays = getCalendarArray.length
        // get all slots
        var getSlot = await SlotModel.find({})
        // get all doctors
        var getAllDoctor = await userAccount.find({})
        // get doctor id
        var getAllDoctorIds = getAllDoctor.map((doctor) => doctor._id)

        // traverse through all the days
        for (let i = 0; i < totalDays; i++) {
            // traverse through all slots
            for (let j = 0; j < 24; j++) {
                // traverse through all doctors
                for (let k = 0; k < getAllDoctorIds.length; k++) {
                    var currentDay = getCalendarArray[i].dayName
                    console.log(currentDay, 'currentDay');
                    // filter currentday in getSLot[j]
                    var getSlotArray = getSlot[j]?.Allotment.filter((day) => day.day === currentDay)
                    // console.log(getSlotArray, 'getSlotArray');
                    var getSlotArrayIndex = null
                    if (!isEmpty(getSlotArray)) {
                        getSlotArrayIndex = getSlot[j]?.Allotment.indexOf(getSlotArray[0])
                    }
                    if (getSlotArrayIndex > -1 && getSlotArrayIndex!==null) {
                    console.log(getSlotArrayIndex, 'getSlotArrayIndex');

                        if (getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted < getSlot[j].Allotment[getSlotArrayIndex].DoctorsNeeded) {
                            console.log(getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted, 'getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted ');
                            // get doctor id
                            var doctorId = getAllDoctorIds[k]


                            if (getSlot[j].Allotment[getSlotArrayIndex].SeniorAlloted < getSlot[j].Allotment[getSlotArrayIndex].SeniorNeeded) {
                                // check if dutyHoursAllotedPerMonth of current doctor<dutyHoursPerMonth
                                if (getAllDoctor[k].dutyHoursAllotedPerMonth < getAllDoctor[k].dutyHoursPerMonth) {
                                    // // filter current date in AllotmentPerDay and get dutyHoursAlloted
                                    // var dutyHoursAlloted = getAllDoctor[k].AllotmentPerDay.filter((date) => date.date === i + 1)
                                    // console.log(dutyHoursAlloted, 'dutyHoursAlloted');

                                    // check if designation of current doctor is senior
                                    if (getAllDoctor[k].designation === 'Senior') {
                                        var getDoctorSchedule = await availabilityScheduleModel.findOne({
                                            user: doctorId
                                        })

                                        // get current doctors schedule array 
                                        var getDoctorScheduleArrayDate = getDoctorSchedule?.schedule?.map((date) => date.date)
                                        //   extract date from 2023-01-02 and parse int
                                        var getDoctorScheduleArrayDayDate = getDoctorScheduleArrayDate?.map((date) => parseInt(date.split('-')[2]))
                                        // extract month from 2023-01-02 and parse int
                                        var getDoctorScheduleArrayMonthDate = getDoctorScheduleArrayDate?.map((date) => parseInt(date.split('-')[1]))
                                        // extract first four letters from 2023-01-02 and parse int
                                        var getDoctorScheduleArrayYearDate = getDoctorScheduleArrayDate?.map((date) => parseInt(date.slice(0, 4)))

                                        // get current day
                                        console.log(i + 1, currentMonth + 1, currentYear);
                                        // if current date is in getDoctorScheduleArrayDate and current month is ingetDoctorScheduleArrayMonthDate
                                        if (getDoctorScheduleArrayDayDate?.includes(i + 1) && getDoctorScheduleArrayMonthDate?.includes(currentMonth + 1) && getDoctorScheduleArrayYearDate?.includes(currentYear)) {
                                            // get current slot
                                            var currentSlot = getSlot[j].slotTime
                                            // check if currentSlot is night
                                            if (getSlot[j].isNight === true) {

                                                // check if current doctor has opt for nightDuty
                                                if (getAllDoctor[k].nightDuty === true) {

                                                    var createShift = new ShiftModel({
                                                        doctors: doctorId,
                                                        shiftDate: currentYear + '-' + (currentMonth + 1) + '-' + (i + 1),
                                                        shiftDay: currentDay,
                                                        shiftTime: currentSlot,
                                                        slot: getSlot[j]._id
                                                    })

                                                    await createShift.save()

                                                    // add 1 to DoctorsAlloted
                                                    if (getSlot[j] && getSlot[j].Allotment[getSlotArrayIndex] && getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted) {
                                                        getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted = getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted + 1
                                                        getSlot[j].Allotment[getSlotArrayIndex].SeniorAlloted = getSlot[j].Allotment[getSlotArrayIndex].SeniorAlloted + 1

                                                    }
                                                    await getSlot[j].save()

                                                    // if getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted===getSlot[j].Allotment[getSlotArrayIndex].DoctorsNeeded
                                                    if (getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted === getSlot[j].Allotment[getSlotArrayIndex].DoctorsNeeded) {
                                                        getSlot[j].Allotment[getSlotArrayIndex].isFulfilled = true
                                                        await getSlot[j].save()

                                                    }

                                                    // add 1 to getAllDoctor[k].dutyHoursAllotedPerMonth
                                                    getAllDoctor[k].dutyHoursAllotedPerMonth = getAllDoctor[k].dutyHoursAllotedPerMonth + 1
                                                    await getAllDoctor[k].save()



                                                }
                                            }
                                            else {


                                                //filter date in doctor schedule and get start tine
                                                var getDoctorScheduleArrayStartTime = getDoctorSchedule.schedule.map((day) => day.start)
                                                //filter date in doctor schedule and get end tine
                                                var getDoctorScheduleArrayEndTime = getDoctorSchedule.schedule.map((day) => day.end)

                                                // if date is single digit then add 0 
                                                var currentDate = i + 1 < 10 ? '0' + (i + 1) : i + 1
                                                // if month is single digit then add 0
                                                var currentMonthd = currentMonth + 1 < 10 ? '0' + (currentMonth + 1) : currentMonth + 1
                                                // get current date in format 2023-01-02
                                                var currentDate = currentYear + '-' + currentMonthd + '-' + currentDate
                                                // get index of current date in getDoctorScheduleArrayDate
                                                var index = getDoctorScheduleArrayDate.indexOf(currentDate)

                                                // get start time of current date
                                                var currentDoctorScheduleStartTime = getDoctorScheduleArrayStartTime[index]
                                                // get end time of current date
                                                var currentDoctorScheduleEndTime = getDoctorScheduleArrayEndTime[index]

                                                // extract start time from currentslot ex:09:00 PM - 10:00 PM
                                                var currentSlotStartTime = currentSlot.split('-')[0].trim()
                                                // extract end time from currentslot ex:09:00 PM - 10:00 PM
                                                var currentSlotEndTime = currentSlot.split('-')[1].trim()

                                                // convert currentSlotStartTime to 24 hour format
                                                var currentSlotStartTime = moment(currentSlotStartTime, ["h:mm A"]).format("HH:mm")
                                                // convert currentSlotEndTime to 24 hour format
                                                var currentSlotEndTime = moment(currentSlotEndTime, ["h:mm A"]).format("HH:mm")

                                                // convert currentDoctorScheduleStartTime to 24 hour format
                                                var currentDoctorScheduleStartTime = moment(currentDoctorScheduleStartTime, ["h:mm A"]).format("HH:mm")
                                                // convert currentDoctorScheduleEndTime to 24 hour format
                                                var currentDoctorScheduleEndTime = moment(currentDoctorScheduleEndTime, ["h:mm A"]).format("HH:mm")

                                                // check if currentSlotStartTime is greater than currentDoctorScheduleStartTime
                                                if (currentSlotStartTime >= currentDoctorScheduleStartTime) {
                                                    // check if currentSlotEndTime is less than currentDoctorScheduleEndTime
                                                    if (currentSlotEndTime <= currentDoctorScheduleEndTime) {

                                                        var createShift = new ShiftModel({
                                                            // push doctorId in doctors array
                                                            doctors: doctorId,
                                                            shiftDate: currentYear + '-' + (currentMonth + 1) + '-' + (i + 1),
                                                            shiftDay: currentDay,
                                                            shiftTime: currentSlot,
                                                            slot: getSlot[j]._id
                                                        })

                                                        await createShift.save()
                                                        // add 1 to DoctorsAlloted
                                                        if (getSlot[j] && getSlot[j].Allotment[getSlotArrayIndex] && getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted) {
                                                            getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted = getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted + 1
                                                            getSlot[j].Allotment[getSlotArrayIndex].SeniorAlloted = getSlot[j].Allotment[getSlotArrayIndex].SeniorAlloted + 1

                                                        }
                                                        await getSlot[j].save()

                                                        // if getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted===getSlot[j].Allotment[getSlotArrayIndex].DoctorsNeeded
                                                        if (getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted === getSlot[j].Allotment[getSlotArrayIndex].DoctorsNeeded) {
                                                            getSlot[j].Allotment[getSlotArrayIndex].isFulfilled = true
                                                            await getSlot[j].save()

                                                        }
                                                        // add 1 to getAllDoctor[k].dutyHoursAllotedPerMonth
                                                        getAllDoctor[k].dutyHoursAllotedPerMonth = getAllDoctor[k].dutyHoursAllotedPerMonth + 1
                                                        await getAllDoctor[k].save()

                                                    }
                                                }

                                            }

                                        }
                                    }
                                }

                            }
                            else {
                                // filter current date in AllotmentPerDay and get dutyHoursAlloted
                                var dutyHoursAlloted = getAllDoctor[k].AllotmentPerDay.filter((date) => date.date === i + 1)
                                console.log(dutyHoursAlloted, 'dutyHoursAlloted');
                                if (getAllDoctor[k].dutyHoursAllotedPerMonth < getAllDoctor[k].dutyHoursPerMonth ) {
                                    // check if designation of current doctor is regular
                                    if (getAllDoctor[k].designation === 'Regular') {
                                        // get doctor schedule
                                        var getDoctorSchedule = await availabilityScheduleModel.findOne({
                                            user: doctorId
                                        })

                                        // get current doctors schedule array 
                                        var getDoctorScheduleArrayDate = getDoctorSchedule?.schedule?.map((date) => date.date)
                                        //   extract date from 2023-01-02 and parse int
                                        var getDoctorScheduleArrayDayDate = getDoctorScheduleArrayDate?.map((date) => parseInt(date.split('-')[2]))
                                        // extract month from 2023-01-02 and parse int
                                        var getDoctorScheduleArrayMonthDate = getDoctorScheduleArrayDate?.map((date) => parseInt(date.split('-')[1]))
                                        // extract first four letters from 2023-01-02 and parse int
                                        var getDoctorScheduleArrayYearDate = getDoctorScheduleArrayDate?.map((date) => parseInt(date.slice(0, 4)))

                                        // get current day
                                        var currentDay = getCalendarArray[i].dayName
                                        console.log(i + 1, currentMonth + 1, currentYear);
                                        // if current date is in getDoctorScheduleArrayDate and current month is ingetDoctorScheduleArrayMonthDate
                                        if (getDoctorScheduleArrayDayDate?.includes(i + 1) && getDoctorScheduleArrayMonthDate?.includes(currentMonth + 1) && getDoctorScheduleArrayYearDate?.includes(currentYear)) {
                                            // get current slot
                                            var currentSlot = getSlot[j].slotTime
                                            // check if currentSlot is night
                                            if (getSlot[j].isNight === true) {

                                                // check if current doctor has opt for nightDuty
                                                if (getAllDoctor[k].nightDuty === true) {

                                                    var createShift = new ShiftModel({
                                                        // push doctorId in doctors array
                                                        doctors: doctorId,
                                                        shiftDate: currentYear + '-' + (currentMonth + 1) + '-' + (i + 1),
                                                        shiftDay: currentDay,
                                                        shiftTime: currentSlot,
                                                        slot: getSlot[j]._id
                                                    })

                                                    await createShift.save()

                                                    // add 1 to DoctorsAlloted
                                                    if (getSlot[j] && getSlot[j].Allotment[getSlotArrayIndex] && getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted) {
                                                        getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted = getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted + 1
                                                    }
                                                    await getSlot[j].save()

                                                    // if getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted===getSlot[j].Allotment[getSlotArrayIndex].DoctorsNeeded
                                                    if (getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted === getSlot[j].Allotment[getSlotArrayIndex].DoctorsNeeded) {
                                                        getSlot[j].Allotment[getSlotArrayIndex].isFulfilled = true
                                                        await getSlot[j].save()

                                                    }
                                                    // add 1 to getAllDoctor[k].dutyHoursAllotedPerMonth
                                                    getAllDoctor[k].dutyHoursAllotedPerMonth = getAllDoctor[k].dutyHoursAllotedPerMonth + 1
                                                    await getAllDoctor[k].save()

                                                }
                                            }
                                            else {


                                                //filter date in doctor schedule and get start tine
                                                var getDoctorScheduleArrayStartTime = getDoctorSchedule.schedule.map((day) => day.start)
                                                //filter date in doctor schedule and get end tine
                                                var getDoctorScheduleArrayEndTime = getDoctorSchedule.schedule.map((day) => day.end)

                                                // if date is single digit then add 0 
                                                var currentDate = i + 1 < 10 ? '0' + (i + 1) : i + 1
                                                // if month is single digit then add 0
                                                var currentMonthd = currentMonth + 1 < 10 ? '0' + (currentMonth + 1) : currentMonth + 1
                                                // get current date in format 2023-01-02
                                                var currentDate = currentYear + '-' + currentMonthd + '-' + currentDate
                                                // get index of current date in getDoctorScheduleArrayDate
                                                var index = getDoctorScheduleArrayDate.indexOf(currentDate)

                                                // get start time of current date
                                                var currentDoctorScheduleStartTime = getDoctorScheduleArrayStartTime[index]
                                                // get end time of current date
                                                var currentDoctorScheduleEndTime = getDoctorScheduleArrayEndTime[index]

                                                // extract start time from currentslot ex:09:00 PM - 10:00 PM
                                                var currentSlotStartTime = currentSlot.split('-')[0].trim()
                                                // extract end time from currentslot ex:09:00 PM - 10:00 PM
                                                var currentSlotEndTime = currentSlot.split('-')[1].trim()

                                                // convert currentSlotStartTime to 24 hour format
                                                var currentSlotStartTime = moment(currentSlotStartTime, ["h:mm A"]).format("HH:mm")
                                                // convert currentSlotEndTime to 24 hour format
                                                var currentSlotEndTime = moment(currentSlotEndTime, ["h:mm A"]).format("HH:mm")

                                                // convert currentDoctorScheduleStartTime to 24 hour format
                                                var currentDoctorScheduleStartTime = moment(currentDoctorScheduleStartTime, ["h:mm A"]).format("HH:mm")
                                                // convert currentDoctorScheduleEndTime to 24 hour format
                                                var currentDoctorScheduleEndTime = moment(currentDoctorScheduleEndTime, ["h:mm A"]).format("HH:mm")

                                                // check if currentSlotStartTime is greater than currentDoctorScheduleStartTime
                                                if (currentSlotStartTime >= currentDoctorScheduleStartTime) {
                                                    // check if currentSlotEndTime is less than currentDoctorScheduleEndTime
                                                    if (currentSlotEndTime <= currentDoctorScheduleEndTime) {

                                                        var createShift = new ShiftModel({
                                                            // push doctorId in doctors array
                                                            doctors: doctorId,
                                                            shiftDate: currentYear + '-' + (currentMonth + 1) + '-' + (i + 1),
                                                            shiftDay: currentDay,
                                                            shiftTime: currentSlot,
                                                            slot: getSlot[j]._id
                                                        })

                                                        await createShift.save()
                                                        // filter currentday in getSLot[j] and add 1 to DoctorsAlloted
                                                        var getSlotArray = getSlot[j]?.Allotment?.filter((day) => day.day === currentDay)
                                                        var getSlotArrayIndex = getSlot[j]?.Allotment?.indexOf(getSlotArray[0])
                                                        if (getSlot[j] && getSlot[j].Allotment[getSlotArrayIndex] && getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted) {
                                                            getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted = getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted + 1
                                                        }
                                                        await getSlot[j].save()

                                                        // if getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted===getSlot[j].Allotment[getSlotArrayIndex].DoctorsNeeded
                                                        if (getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted === getSlot[j].Allotment[getSlotArrayIndex].DoctorsNeeded) {
                                                            getSlot[j].Allotment[getSlotArrayIndex].isFulfilled = true
                                                            await getSlot[j].save()

                                                        }
                                                        // add 1 to getAllDoctor[k].dutyHoursAllotedPerMonth
                                                        getAllDoctor[k].dutyHoursAllotedPerMonth = getAllDoctor[k].dutyHoursAllotedPerMonth + 1
                                                        await getAllDoctor[k].save()

                                                    }
                                                }

                                            }

                                        }

                                    }
                                }
                            }
                        }
                    }
                }
            }
           
        }
        res.status(200).json({
            success: true,
            message: 'Shift created'
        })
    }
    catch (error) {
        console.log(error.message);
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// @route: POST /shift/create-shift
// @purpose: : post routes to create shift
export const createShift = async (req, res) => {
    const { doctors, shiftStartDate, shiftEndDate, shiftStartTime, shiftEndTime, slot } = req.body
    try {
        var newShift = new ShiftModel({
            doctors,
            shiftStartDate,
            shiftEndDate,
            shiftStartTime,
            shiftEndTime,
            slot
        })
        await newShift.save()
        res.status(200).json({ message: 'Shift created' })
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}

// @route: GET /shift/get-shifts
// @purpose: : get routes to get all shifts
export const getShifts = async (req, res) => {
    try {
        var getShifts = await ShiftModel.find({})
        res.status(200).json({ message: 'All shifts', data: getShifts })
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}

// @route: GET /shift/get-shifts-by-date
// @purpose: : get routes to get all shifts by date
export const getShiftsByDate = async (req, res) => {
    const { shiftStartDate, shiftEndDate } = req.body
    try {
        var getShifts = await ShiftModel.find({
            shiftStartDate: shiftStartDate,
            shiftEndDate: shiftEndDate
        })
        res.status(200).json({ message: 'All shifts', data: getShifts })
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}

// @route: GET /shift/get-shifts-by-doctor
// @purpose: : get routes to get all shifts by doctor
export const getShiftsByDoctor = async (req, res) => {
    const { doctors } = req.body
    try {
        var getShifts = await ShiftModel.find({
            doctors: doctors
        })
        res.status(200).json({ message: 'All shifts', data: getShifts })
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}

// @route: PUT /shift/update-shift
// @purpose: : put routes to update shift
export const updateShift = async (req, res) => {
    const { doctors, shiftStartDate, shiftEndDate, shiftStartTime, shiftEndTime, slot } = req.body
    try {
        var getShift = await ShiftModel.findOne({
            shiftStartDate: shiftStartDate,
            shiftEndDate: shiftEndDate,
            shiftStartTime: shiftStartTime,
            shiftEndTime: shiftEndTime,
            slot: slot
        })
        if (getShift === null) {
            res.status(400).json({ message: 'Shift not found' })
        }
        else {
            getShift.doctors = doctors
            await getShift.save()
            res.status(200).json({ message: 'Shift updated' })
        }
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}

// @route: PUT /shift/approve-or-decline
// @purpose: : put routes to approve or decline shift
export const approveOrDecline = async (req, res) => {
    const { shiftStartDate, shiftEndDate, shiftStartTime, shiftEndTime, slot, status } = req.body
    try {
        var getShift = await ShiftModel.findOne({
            shiftStartDate: shiftStartDate,
            shiftEndDate: shiftEndDate,
            shiftStartTime: shiftStartTime,
            shiftEndTime: shiftEndTime,
            slot: slot
        })
        if (getShift === null) {
            res.status(400).json({ message: 'Shift not found' })
        }
        else {
            getShift.status = status
            await getShift.save()
            res.status(200).json({ message: 'Shift updated' })
        }
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}

// @route: DELETE /shift/delete-shift-by-time
// @purpose: : delete routes to delete shift by date
export const deleteShiftByDate = async (req, res) => {
    const { shiftStartDate, shiftEndDate, shiftStartTime, shiftEndTime } = req.body
    try {
        var getShift = await ShiftModel.findOne({
            shiftStartDate: shiftStartDate,
            shiftEndDate: shiftEndDate,
            shiftStartTime: shiftStartTime,
            shiftEndTime: shiftEndTime
        })
        if (getShift === null) {
            res.status(400).json({ message: 'Shift not found' })
        }
        else {
            await getShift.remove()
            res.status(200).json({ message: 'Shift deleted' })
        }
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}

// @route: DELETE /shift/delete-all
// @purpose: : delete all shifts
export const deleteAllShifts = async (req, res) => {
    try {
        await ShiftModel.deleteMany({})
        res.status(200).json({ message: 'All shifts deleted' })
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
        var getCalendar = await CalendarModel.findOne({
            calendarArray: {
                $elemMatch: {
                    dayMonth: currentMonth + 1,
                    dayYear: new Date().getFullYear()
                }
            }
        })
        if (!getCalendar) {
            // get current year
            var currentYear = new Date().getFullYear()
            // get total number of days in a month
            var totalDays = new Date(currentYear, currentMonth + 1, 0).getDate()
            // create array of days
            var daysArray = [...Array(totalDays).keys()].map((i) => i + 1)
            // create calendar array
            var calendarArray = daysArray.map((day) => {
                var date = new Date(currentYear, currentMonth, day)
                var getDay = date.getDay()
                var dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][getDay]
                var dayNumber = day
                var dayMonth = currentMonth + 1
                var dayYear = currentYear
                return {
                    dayName,
                    dayNumber,
                    dayMonth,
                    dayYear
                }
            })
            var newCalendar = new CalendarModel({
                calendarArray: calendarArray
            })
            // save calendar array
            var saveCalendar = await newCalendar.save()
            // console.log(saveCalendar);
            // send calendar array
            res.status(200).json({
                success: true,
                message: "Calendar generated successfully!",
                saveCalendar
            })
        }
        else {
            res.status(200).json({
                success: true,
                message: "Calendar already generated!"
            })
        }
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}

// @route: GET /shift/get-calendar
// @purpose: : get routes to get calendar of a month for current year and month
export const getCalendar = async (req, res) => {
    let { currentMonth } = req.query

    try {
        // parseint currentmonth
        currentMonth = parseInt(currentMonth)
        var getCalendar = await CalendarModel.findOne({
            calendarArray: {
                $elemMatch: {
                    dayMonth: currentMonth + 1
                }
            }
        })
        if (!getCalendar) {
            res.status(404).json({
                success: false,
                message: "Calendar not found!"
            })
        }
        else {
            res.status(200).json({
                success: true,
                message: "Calendar found!",
                getCalendar
            })
        }
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
        var newSlot = new SlotModel({
            slotTime,
            isNight
        })
        // save slot
        var saveSlot = await newSlot.save()
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

// @route: PUT /shift/update-slot
// @purpose: : put routes to update slot
export const updateSlot = async (req, res) => {
    const {
        Allotment,
        slotTime
    } = req.body
    try {
        var getSlot = await SlotModel
            .findOne({
                slotTime
            })
        if (!getSlot) {
            res.status(400).json({
                success: false,
                message: "Slot not found!"
            })
        }
        else {
            // if date is already present then edit the data eeelse create new
            if (!isEmpty(getSlot.Allotment)) {
                // check if current date is already in allotment
                var Present = false
                for (let i = 0; i < getSlot.Allotment.length; i++) {
                    if (getSlot.Allotment[i].day === Allotment[0].day) {
                        Present = true
                        break
                    }
                }
                if (Present) {
                    // find by date and update doctorNeeded
                    var getSlotUpdate = await SlotModel
                        .findOneAndUpdate({
                            slotTime,
                            Allotment: {
                                $elemMatch: {
                                    day: Allotment[0].day
                                }
                            },
                        }, {
                            $set: {
                                "Allotment.$.DoctorsNeeded": Allotment[0].DoctorsNeeded,
                                "Allotment.$.SeniorNeeded": Allotment[0].SeniorNeeded,
                                "Allotment.$.DoctorsAlloted": Allotment[0].DoctorsAlloted,
                                "Allotment.$.SeniorAlloted": Allotment[0].SeniorAlloted,
                                "Allotment.$.isFulfilled": Allotment[0].isFulfilled
                            }
                        }, {
                            new: true
                        })

                    // save
                    var saveSlot = await getSlotUpdate.save()
                    // send slot
                    res.status(200).json({
                        success: true,
                        message: "Slot updated successfully!",
                        saveSlot
                    })
                }
                else {
                    var getSlotUpdate = await SlotModel
                        .findOneAndUpdate({
                            slotTime
                        }, {
                            $push: {
                                Allotment
                            }
                        }, {
                            new: true
                        })
                    // save
                    await getSlotUpdate.save()
                    // send slot
                    res.status(200).json({
                        success: true,
                        message: "Slot updated successfully!",
                        getSlotUpdate
                    })
                }
            }
            else {
                // add data in allotment
                getSlot.Allotment = Allotment
                var saveSlot = await getSlot.save()
                // send slot
                res.status(200).json({
                    success: true,
                    message: "Slot updated successfully!",
                    saveSlot
                })
            }
            // save slot

        }

    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}

// @route: PUT /shift/update-all-slots
// @purpose: : put routes to update all slot
export const updateAllSlot = async (req, res) => {
    const {
        Allotment
    } = req.body
    try {

        // update doctoralloted and isfulfilled in all slots
        const getSlotUpdate = await SlotModel
            .updateMany(
                {
                    Allotment: {
                        $elemMatch: {
                            day: Allotment[0].day
                        }
                    }
                },
                {
                    $set: {
                        "Allotment.$.DoctorsAlloted": Allotment[0].DoctorsAlloted,
                        "Allotment.$.isFulfilled": Allotment[0].isFulfilled,
                    }
                }, {
                new: true
            }
            )

        // save
        // var saveSlot = await getSlotUpdate.save()
        // send slot
        res.status(200).json({
            success: true,
            message: "Slot updated successfully!",
            // saveSlot
        })
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}

// @route: /shift/get-all-slots
// @purpose: : get routes to get all slots
export const getAllSlots = async (req, res) => {
    try {
        var getAllSlots = await SlotModel.find()
        if (getAllSlots) {
            res.status(200).json({
                success: true,
                message: "Slots found!",
                getAllSlots
            })
        } else {
            res.status(404).json({
                success: false,
                message: "Slots not found!"
            })
        }
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}

//@route: POST /shift/shift-replace
//@purpose: : post routes for  user to request shift replace
export const ShiftReplace = async (req, res) => {
    try {
        const { name, replacement, date, start, end } = req.body

        const newShiftReplaceRequest = new shiftReplaceModel({
            name,
            replacement,
            date,
            start,
            end
        })
        const saveShiftReplaceRequest = await newShiftReplaceRequest.save()
        res.json({
            success: true,
            message: "Shift replace request sent successfully!",
            saveShiftReplaceRequest
        })

    }
    catch (error) {
        res.status(404).json({ message: error.message })
    }
}

//@route: GET /shift/get-shift-replace-requests
//@purpose: : get routes for  user to get shift replace requests
export const getShiftReplaceRequests = async (req, res) => {
    try {
        const getShiftReplaceRequests = await shiftReplaceModel.find().sort({ $natural: -1 })
        res.json({
            success: true,
            message: "Shift replace requests found!",
            getShiftReplaceRequests
        })
    }
    catch (error) {
        res.status(404).json({ message: error.message })
    }
}


//@route: POST /shift/add-availability
//@purpose: : post routes for  user to add availability
export const addAvailability = async (req, res) => {
    const { id, schedule } = req.body
    // check if user exists
    const checkUser = await userAccount
        .findById(id)
    if (isEmpty(checkUser)) {
        res.status(404).json({
            success: false,
            message: "User not found!"
        })
    }
    else {
        // if user is already in the availability model then edit it according to the input else create a new
        const checkAvailability = await availabilityScheduleModel
            .findOne({ user: id })
        if (isEmpty(checkAvailability)) {
            const newAvailability = new availabilityScheduleModel({
                schedule,
                user: id
            })
            const saveAvailability = await newAvailability.save()
            res.json({
                success: true,
                message: "Availability added successfully!",
                saveAvailability
            })
        }
        else {
            const editAvailability = await availabilityScheduleModel
                .findOneAndUpdate(
                    { user: id },
                    {
                        //    get all elements from schedule then push in schedule
                        $push: {
                            schedule: {
                                $each: schedule
                            }
                        }
                    },
                    {
                        new: true
                    }
                )
            res.json({
                success: true,
                message: "Availability edited successfully!",
                editAvailability
            })
        }
    }
}

// @route: GET /shift/:id/get-availability   
// @purpose: : get routes for  user to get availability
export const getAvailability = async (req, res) => {
    try {
        const id = req.params.id
        const getAvailability = await availabilityScheduleModel
            .find({ user: id })
            .sort({ $natural: -1 })
            .populate('user', 'name email mobile')
        res.status(200).json(getAvailability)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

// @route: GET /shift/get-availability-by-date
// @purpose: : get routes for  user to get availability by date
export const getAvailabilityByDate = async (req, res) => {
    try {
        const { date } = req.query
        const getAvailabilityByDate = await availabilityScheduleModel
            .find({ schedule: { $elemMatch: { date: date } } })
            .sort({ $natural: -1 })
            .populate('user', 'name email mobile')
        res.status(200).json(getAvailabilityByDate)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

// @route: GET /shift/get-all-availability
// @purpose: : get routes for  user to get all availability
export const getAllAvailability = async (req, res) => {
    try {
    //    get availability.schedule
        const getAllAvailability = await availabilityScheduleModel
            .find()
            .populate('user', 'name email mobile')
        res.status(200).json(getAllAvailability)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

//@route: DELETE /shift/delete-availability
//@purpose: : post routes for  user to delete availability
export const deleteAvailability = async (req, res) => {
    const { id } = req.body
    // check if user exists
    const checkUser = await userAccount
        .findById(id)
    if (isEmpty(checkUser)) {
        res.status(404).json({
            success: false,
            message: "User not found!"
        })
    }
    else {
        const deleteAvailability = await availabilityScheduleModel
            .findOneAndDelete({ user: id })
        res.json({
            success: true,
            message: "Availability deleted successfully!",
            deleteAvailability
        })
    }
}

// @route: POST /shift/delete-availability-by-date
// @purpose: : post routes for  user to delete availability by date
export const deleteAvailabilityByDate = async (req, res) => {
    const { id, date } = req.body
    // check if user exists
    const checkUser = await userAccount
        .findById(id)
    if (isEmpty(checkUser)) {
        res.status(404).json({
            success: false,
            message: "User not found!"
        })
    }
    else {
        const deleteAvailability = await availabilityScheduleModel
            .findOneAndUpdate(
                { user: id },
                {
                    $pull: { schedule: { date } }
                },
                {
                    new: true
                }
            )
        res.json({
            success: true,
            message: "Availability deleted successfully!"
        })
    }
}