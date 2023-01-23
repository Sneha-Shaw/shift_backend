import ShiftModel from "../model/ShiftSchema.js";
import SlotModel from '../model/slotSchema.js'
import CalendarModel from "../model/calendarSchema.js";
import userAccount from '../model/userAccountSchema.js'
import availabilityScheduleModel from '../model/AvailabilityScheduleSchema.js'
import shiftReplaceModel from '../model/ShiftReplaceSchema.js'
import isEmpty from '../utils/isEmpty.js'
import moment from "moment/moment.js";

import env from 'dotenv'

env.config()

//@route: POST /shift/generate-shift
//@purpose: : post routes to generate shift of a month with respective days by checking in doctors schedule and available slot time
export const generateShift = async (req, res) => {
    const { domain, startDate, endDate } = req.body

    try {

        // get date from start Date which is in format YYYY-MM-DD
        var startDateNumber = moment(startDate).date()

        // get date from end Date which is in format YYYY-MM-DD
        var endDateNumber = moment(endDate).date()

        // get month from start Date which is in format YYYY-MM-DD
        var currentMonth = moment(startDate).month()

        // get year from start Date which is in format YYYY-MM-DD
        var currentYear = moment(startDate).year()

        // get calender of current month
        var getCalendar = await CalendarModel.findOne({
            calendarArray: {
                $elemMatch: {
                    dayMonth: currentMonth + 1,
                    dayYear: currentYear
                }
            }
        })
        //  filter getcalendar calendarArray by startdate to end date
        var getCalendarArray = getCalendar.calendarArray.filter((date) => date.dayNumber >= parseInt(startDate.split('-')[2]) && date.dayNumber <= parseInt(endDate.split('-')[2]))

        // get all slots
        var getSlot = await SlotModel.find({})

        // get all doctors
        var getAllDoctor = await userAccount.find({})
        // get all doctors whose domain array contains user given domain
        var getAllDoctor = getAllDoctor.filter((doctor) => doctor.domain.includes(domain))
        // get doctor id
        var getAllDoctorIds = getAllDoctor.map((doctor) => doctor._id)


        // traverse through all the days
        for (let i = startDateNumber; i < endDateNumber; i++) {
            // traverse through all slots
            for (let j = 0; j < 24; j++) {
                // traverse through all doctors
                for (let k = 0; k < getAllDoctorIds.length; k++) {
                    //    if i is less than 10 then add 0 before it
                    var currentDate = i < 10 ? `0${i}` : i
                    // if currentmonth is less than 10 then add 0 before it
                    var currentMonthWith0 = (currentMonth + 1) < 10 ? `0${currentMonth + 1}` : currentMonth + 1

                    // get current date in format YYYY-MM-DD
                    var currentDate = `${currentYear}-${currentMonthWith0}-${currentDate}`

                    // filter currentdate in getSLot[j]
                    var getSlotArray = getSlot[j]?.Allotment.filter((date) => date.date === currentDate)
                    console.log(getSlotArray, 'getSlotArray');

                    var getSlotArrayIndex = null
                    !isEmpty(getSlotArray) && (getSlotArrayIndex = getSlot[j]?.Allotment.indexOf(getSlotArray[0]))

                    console.log(getSlot[j].slotTime, "getslot");
                    if (getSlotArrayIndex > -1 && getSlotArrayIndex !== null) {
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
                                        var currentDay = getCalendarArray.filter((day) => day.dayNumber === i + 1)[0].dayName
                                        // console.log(i + 1, currentMonth + 1, currentYear);
                                        // if current date is in getDoctorScheduleArrayDate and current month is ingetDoctorScheduleArrayMonthDate
                                        if (getDoctorScheduleArrayDayDate?.includes(i + 1) && getDoctorScheduleArrayMonthDate?.includes(currentMonth + 1) && getDoctorScheduleArrayYearDate?.includes(currentYear)) {
                                            // get current slot
                                            console.log("current slot Senior");
                                            var currentSlot = getSlot[j].slotTime
                                            // check if currentSlot is night
                                            if (getSlot[j].isNight === true) {

                                                // check if current doctor has opt for nightDuty
                                                if (getAllDoctor[k].nightDuty === true) {
                                                    console.log(currentDate, 'currentDate');

                                                    var createShift = new ShiftModel({
                                                        doctors: doctorId,
                                                        shiftDate: currentYear + '-' + (currentMonth + 1) + '-' + (i + 1),
                                                        shiftDay: currentDay,
                                                        shiftDomain: domain,
                                                        shiftTime: currentSlot,
                                                        slot: getSlot[j]._id
                                                    })

                                                    await createShift.save()

                                                    // add 1 to DoctorsAlloted
                                                    if (getSlot[j] && getSlot[j].Allotment[getSlotArrayIndex] && getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted != undefined) {
                                                        getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted = getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted + 1
                                                        getSlot[j].Allotment[getSlotArrayIndex].SeniorAlloted = getSlot[j].Allotment[getSlotArrayIndex].SeniorAlloted + 1

                                                    }
                                                    await getSlot[j].save()

                                                    // if getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted===getSlot[j].Allotment[getSlotArrayIndex].DoctorsNeeded
                                                    // if (getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted === getSlot[j].Allotment[getSlotArrayIndex].DoctorsNeeded) {
                                                    //     getSlot[j].Allotment[getSlotArrayIndex].isFulfilled = true
                                                    //     await getSlot[j].save()

                                                    // }

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
                                                        console.log(currentDate, 'currentDate');

                                                        var createShift = new ShiftModel({
                                                            // push doctorId in doctors array
                                                            doctors: doctorId,
                                                            shiftDate: currentYear + '-' + (currentMonth + 1) + '-' + (i + 1),
                                                            shiftDay: currentDay,
                                                            shiftDomain: domain,
                                                            shiftTime: currentSlot,
                                                            slot: getSlot[j]._id
                                                        })

                                                        await createShift.save()
                                                        // add 1 to DoctorsAlloted
                                                        if (getSlot[j] && getSlot[j].Allotment[getSlotArrayIndex] && getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted != undefined) {
                                                            getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted = getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted + 1
                                                            getSlot[j].Allotment[getSlotArrayIndex].SeniorAlloted = getSlot[j].Allotment[getSlotArrayIndex].SeniorAlloted + 1

                                                        }
                                                        await getSlot[j].save()

                                                        // if getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted===getSlot[j].Allotment[getSlotArrayIndex].DoctorsNeeded
                                                        // if (getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted === getSlot[j].Allotment[getSlotArrayIndex].DoctorsNeeded) {
                                                        //     getSlot[j].Allotment[getSlotArrayIndex].isFulfilled = true
                                                        //     await getSlot[j].save()

                                                        // }
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
                                // var dutyHoursAlloted = getAllDoctor[k].AllotmentPerDay.filter((date) => date.date === i + 1)
                                // console.log(dutyHoursAlloted, 'dutyHoursAlloted');
                                if (getAllDoctor[k].dutyHoursAllotedPerMonth < getAllDoctor[k].dutyHoursPerMonth) {
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

                                        // get current day by filtering i frommdaynumber
                                        var currentDay = getCalendarArray.filter((day) => day.dayNumber === i + 1)[0].dayName
                                        console.log(currentDay, 'currentDay');
                                        console.log(i + 1, currentMonth + 1, currentYear);
                                        // if current date is in getDoctorScheduleArrayDate and current month is ingetDoctorScheduleArrayMonthDate
                                        if (getDoctorScheduleArrayDayDate?.includes(i + 1) && getDoctorScheduleArrayMonthDate?.includes(currentMonth + 1) && getDoctorScheduleArrayYearDate?.includes(currentYear)) {
                                            console.log("current slot,junior");

                                            // get current slot
                                            var currentSlot = getSlot[j].slotTime
                                            // check if currentSlot is night
                                            if (getSlot[j].isNight === true) {
                                                console.log("current slot is night");

                                                // check if current doctor has opt for nightDuty
                                                if (getAllDoctor[k].nightDuty === true) {
                                                    console.log("current doctor has opt for nightDuty");
                                                    console.log(currentDate, 'currentDate');

                                                    var createShift = new ShiftModel({
                                                        // push doctorId in doctors array
                                                        doctors: doctorId,
                                                        shiftDate: currentYear + '-' + (currentMonth + 1) + '-' + (i + 1),
                                                        shiftDay: currentDay,
                                                        shiftDomain: domain,
                                                        shiftTime: currentSlot,
                                                        slot: getSlot[j]._id
                                                    })

                                                    await createShift.save()

                                                    // add 1 to DoctorsAlloted
                                                    if (getSlot[j] && getSlot[j].Allotment[getSlotArrayIndex] && getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted != undefined) {
                                                        getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted = getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted + 1
                                                    }
                                                    await getSlot[j].save()

                                                    // if getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted===getSlot[j].Allotment[getSlotArrayIndex].DoctorsNeeded
                                                    // if (getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted === getSlot[j].Allotment[getSlotArrayIndex].DoctorsNeeded) {
                                                    //     getSlot[j].Allotment[getSlotArrayIndex].isFulfilled = true
                                                    //     await getSlot[j].save()

                                                    // }
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
                                                        console.log(currentDate, 'currentDate');

                                                        var createShift = new ShiftModel({
                                                            // push doctorId in doctors array
                                                            doctors: doctorId,
                                                            shiftDate: currentYear + '-' + (currentMonth + 1) + '-' + (i + 1),
                                                            shiftDay: currentDay,
                                                            shiftDomain: domain,
                                                            shiftTime: currentSlot,
                                                            slot: getSlot[j]._id
                                                        })

                                                        await createShift.save()
                                                        // filter currentday in getSLot[j] and add 1 to DoctorsAlloted
                                                        var getSlotArray = getSlot[j]?.Allotment?.filter((day) => day.day === currentDay)
                                                        var getSlotArrayIndex = getSlot[j]?.Allotment?.indexOf(getSlotArray[0])
                                                        if (getSlot[j] && getSlot[j].Allotment[getSlotArrayIndex] && getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted != undefined) {
                                                            getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted = getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted + 1
                                                        }
                                                        await getSlot[j].save()

                                                        // if getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted===getSlot[j].Allotment[getSlotArrayIndex].DoctorsNeeded
                                                        // if (getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted === getSlot[j].Allotment[getSlotArrayIndex].DoctorsNeeded) {
                                                        //     getSlot[j].Allotment[getSlotArrayIndex].isFulfilled = true
                                                        //     await getSlot[j].save()

                                                        // }
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


// @route: GET /shift/get-shifts-by-domain
// @purpose: : get routes to get all shifts by shiftDomain
export const getShiftsByDomain = async (req, res) => {
    const { domain } = req.query
    try {
        var getShifts = await ShiftModel.find({
            shiftDomain: domain
        })
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

