import ShiftModel from "../model/ShiftSchema.js";
import SlotModel from '../model/slotSchema.js'
import CalendarModel from "../model/calendarSchema.js";
import userAccount from '../model/userAccountSchema.js'
import availabilityScheduleModel from '../model/AvailabilityScheduleSchema.js'
import shiftReplaceModel from '../model/ShiftReplaceSchema.js'
import isEmpty from '../utils/isEmpty.js'
import moment from "moment/moment.js";
import { rosterGenerationScheduler } from '../utils/scheduler/rosterGenerationScheduler.js'

import env from 'dotenv'

env.config()
// calling roster Generation Scheduler to schedule shift generation
rosterGenerationScheduler()
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

            //    if i is less than 10 then add 0 before it
            var currentDate = i < 10 ? `0${i}` : i

            // if currentmonth is less than 10 then add 0 before it
            var currentMonthWith0 = (currentMonth + 1) < 10 ? `0${currentMonth + 1}` : currentMonth + 1

            // get current date in format YYYY-MM-DD
            var currentDate = `${currentYear}-${currentMonthWith0}-${currentDate}`

            // traverse through all slots
            for (let j = 0; j < 24; j++) {

                var getSlotArrayIndex = null
                getSlotArrayIndex = getSlot[j]?.Allotment.indexOf((getSlot[j]?.Allotment.filter((date) => parseInt(date.date) === i)[0]))

                if (getSlotArrayIndex > -1 && getSlotArrayIndex !== null) {
                    if (getSlot[j]?.Allotment[getSlotArrayIndex]?.isFulfilled) {
                        continue;
                    }
                    else {
                        // traverse through all doctors
                        for (let k = 0; k < getAllDoctorIds.length; k++) {

                            if (getAllDoctor[k]?.AllotmentPerDay?.length === 0) {
                                getAllDoctor[k].AllotmentPerDay.push({
                                    date: currentDate,
                                    dutyHoursAlloted: 0
                                })
                                await getAllDoctor[k].save()
                            }

                            if (getSlot[j]?.Allotment[getSlotArrayIndex].DoctorsAlloted < getSlot[j]?.Allotment[getSlotArrayIndex].DoctorsNeeded) {

                                // get doctor id
                                var doctorId = getAllDoctorIds[k]
                                var dutyHoursAlloted = getAllDoctor[k]?.AllotmentPerDay?.filter((date) => date.date === currentDate)[0]?.dutyHoursAlloted
                                dutyHoursAlloted === undefined ? dutyHoursAlloted = 0 : dutyHoursAlloted = dutyHoursAlloted

                                if (getSlot[j]?.Allotment[getSlotArrayIndex].SeniorAlloted < getSlot[j]?.Allotment[getSlotArrayIndex].SeniorNeeded) {

                                    // check if dutyHoursAllotedPerMonth of current doctor<dutyHoursPerMonth
                                    if (getAllDoctor[k].dutyHoursAllotedPerMonth < getAllDoctor[k].dutyHoursPerMonth) {

                                        // check if dutyHoursAlloted<dutyHoursPerDay
                                        if (dutyHoursAlloted < getAllDoctor[k].dutyHoursPerDay) {

                                            // check if designation of current doctor is senior
                                            if (getAllDoctor[k].designation === 'Senior') {

                                                var getDoctorSchedule = await availabilityScheduleModel.findOne({
                                                    user: doctorId,
                                                    schedule: {
                                                        $elemMatch: {
                                                            title: "Available"
                                                        }
                                                    }
                                                })



                                                if (!getDoctorSchedule) {
                                                    continue
                                                }
                                                else {

                                                    // get current doctors schedule array 
                                                    var getDoctorScheduleArrayDate = getDoctorSchedule?.schedule?.map((date) => date.date)

                                                    // get current day
                                                    var currentDay = getCalendarArray.filter((day) => day.dayNumber === i && day.dayMonth === currentMonth + 1)[0].dayName

                                                    // if current date is in getDoctorScheduleArrayDate then create shift
                                                    if (getDoctorScheduleArrayDate?.includes(i.toString())) {


                                                        // get current slot
                                                        var currentSlot = getSlot[j].slotTime
                                                        // check if currentSlot is night
                                                        if (getSlot[j].isNight === true) {

                                                            // check if current doctor has opt for nightDuty
                                                            if (getAllDoctor[k].nightDuty === true) {


                                                                // check if shift is already in database
                                                                var checkShift = await ShiftModel.findOne({
                                                                    // doctors: doctorId,
                                                                    shiftDate: currentDate,
                                                                    shiftDomain: {
                                                                        $in: [domain.toLowerCase(), domain.toUpperCase()]
                                                                    },
                                                                    shiftTime: currentSlot
                                                                })

                                                                console.log(checkShift, 'checkShift');
                                                                // if shift is not in database then create shift
                                                                if (!checkShift) {

                                                                    var createShift = new ShiftModel({
                                                                        doctors: doctorId,
                                                                        shiftDate: currentDate,
                                                                        shiftDay: currentDay,
                                                                        shiftDomain: domain,
                                                                        shiftTime: currentSlot,
                                                                        slot: getSlot[j]._id
                                                                    })

                                                                    console.log(createShift, 'createShift');

                                                                    await createShift.save()

                                                                    // add 1 to DoctorsAlloted
                                                                    if (getSlot[j] && getSlot[j]?.Allotment[getSlotArrayIndex] && getSlot[j]?.Allotment[getSlotArrayIndex].DoctorsAlloted != undefined) {
                                                                        getSlot[j].Allotment[getSlotArrayIndex] && (getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted = getSlot[j]?.Allotment[getSlotArrayIndex].DoctorsAlloted + 1)
                                                                        getSlot[j].Allotment[getSlotArrayIndex] && (getSlot[j].Allotment[getSlotArrayIndex].SeniorAlloted = getSlot[j]?.Allotment[getSlotArrayIndex].SeniorAlloted + 1)

                                                                    }
                                                                    await getSlot[j].save()

                                                                    // add 1 to getAllDoctor[k].dutyHoursAllotedPerMonth
                                                                    getAllDoctor[k].dutyHoursAllotedPerMonth = getAllDoctor[k].dutyHoursAllotedPerMonth + 1
                                                                    await getAllDoctor[k].save()

                                                                    // add 1 to dutyHoursAllotedPerDay
                                                                    if (getAllDoctor[k]?.AllotmentPerDay?.length > 0) {
                                                                        var getDoctorAllotmentPerDayIndex = getAllDoctor[k]?.AllotmentPerDay?.map((date) => date.date).indexOf(currentDate)
                                                                        if (getDoctorAllotmentPerDayIndex > -1) {
                                                                            getAllDoctor[k].AllotmentPerDay[getDoctorAllotmentPerDayIndex].dutyHoursAlloted = getAllDoctor[k].AllotmentPerDay[getDoctorAllotmentPerDayIndex].dutyHoursAlloted + 1
                                                                            await getAllDoctor[k].save()
                                                                        }
                                                                        else {
                                                                            getAllDoctor[k].AllotmentPerDay.push({
                                                                                date: currentDate,
                                                                                dutyHoursAlloted: 1
                                                                            })
                                                                            await getAllDoctor[k].save()
                                                                        }
                                                                    }
                                                                    else {
                                                                        getAllDoctor[k].AllotmentPerDay.push({
                                                                            date: currentDate,
                                                                            dutyHoursAlloted: 1
                                                                        })
                                                                        await getAllDoctor[k].save()
                                                                    }
                                                                }

                                                            }
                                                        }
                                                        else {


                                                            //filter date in doctor schedule and get start tine
                                                            var getDoctorScheduleArrayStartTime = getDoctorSchedule.schedule.map((day) => day.start)
                                                            //filter date in doctor schedule and get end tine
                                                            var getDoctorScheduleArrayEndTime = getDoctorSchedule.schedule.map((day) => day.end)


                                                            // get index of current date in getDoctorScheduleArrayDate
                                                            var index = getDoctorScheduleArrayDate.indexOf(i.toString())

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


                                                                    // check if shift is already in database
                                                                    var checkShift = await ShiftModel.findOne({
                                                                        doctors: doctorId,
                                                                        shiftDate: currentDate,
                                                                        // convert domain to lower case and upper case
                                                                        shiftDomain: {
                                                                            $in: [domain.toLowerCase(), domain.toUpperCase()]
                                                                        },
                                                                        shiftTime: currentSlot
                                                                    })

                                                                    // if shift is not in database then create shift
                                                                    if (!checkShift) {

                                                                        var createShift = new ShiftModel({
                                                                            doctors: doctorId,
                                                                            shiftDate: currentDate,
                                                                            shiftDay: currentDay,
                                                                            shiftDomain: domain,
                                                                            shiftTime: currentSlot,
                                                                            slot: getSlot[j]._id
                                                                        })
                                                                        console.log(createShift, 'createShift');
                                                                        await createShift.save()

                                                                        // add 1 to DoctorsAlloted
                                                                        if (getSlot[j] && getSlot[j]?.Allotment[getSlotArrayIndex] && getSlot[j]?.Allotment[getSlotArrayIndex].DoctorsAlloted != undefined) {
                                                                            getSlot[j].Allotment[getSlotArrayIndex] && (getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted = getSlot[j]?.Allotment[getSlotArrayIndex].DoctorsAlloted + 1)
                                                                            getSlot[j].Allotment[getSlotArrayIndex] && (getSlot[j].Allotment[getSlotArrayIndex].SeniorAlloted = getSlot[j]?.Allotment[getSlotArrayIndex].SeniorAlloted + 1)

                                                                        }
                                                                        await getSlot[j].save()

                                                                        // add 1 to getAllDoctor[k].dutyHoursAllotedPerMonth
                                                                        getAllDoctor[k].dutyHoursAllotedPerMonth = getAllDoctor[k].dutyHoursAllotedPerMonth + 1
                                                                        await getAllDoctor[k].save()

                                                                        // add 1 to dutyHoursAllotedPerDay
                                                                        if (getAllDoctor[k]?.AllotmentPerDay?.length > 0) {
                                                                            var getDoctorAllotmentPerDayIndex = getAllDoctor[k]?.AllotmentPerDay?.map((date) => date.date).indexOf(currentDate)
                                                                            if (getDoctorAllotmentPerDayIndex > -1) {
                                                                                getAllDoctor[k].AllotmentPerDay[getDoctorAllotmentPerDayIndex].dutyHoursAlloted = getAllDoctor[k].AllotmentPerDay[getDoctorAllotmentPerDayIndex].dutyHoursAlloted + 1
                                                                                await getAllDoctor[k].save()
                                                                            }
                                                                            else {
                                                                                getAllDoctor[k].AllotmentPerDay.push({
                                                                                    date: currentDate,
                                                                                    dutyHoursAlloted: 1
                                                                                })
                                                                                await getAllDoctor[k].save()
                                                                            }
                                                                        }
                                                                        else {
                                                                            getAllDoctor[k].AllotmentPerDay.push({
                                                                                date: currentDate,
                                                                                dutyHoursAlloted: 1
                                                                            })
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
                                        else {
                                            continue
                                        }
                                    }
                                    else {
                                        continue
                                    }

                                }

                                else {


                                    if (getAllDoctor[k].dutyHoursAllotedPerMonth < getAllDoctor[k].dutyHoursPerMonth) {

                                        if (dutyHoursAlloted < getAllDoctor[k].dutyHoursPerDay) {
                                            // check if designation of current doctor is regular
                                            if (getAllDoctor[k].designation === 'Regular') {
                                                // get doctor schedule
                                                var getDoctorSchedule = await availabilityScheduleModel.findOne({
                                                    user: doctorId,
                                                    schedule: {
                                                        $elemMatch: {
                                                            title: "Available"
                                                        }
                                                    }
                                                })

                                                if (!getDoctorSchedule) {
                                                    continue
                                                }
                                                else {

                                                    // get current doctors schedule array 
                                                    var getDoctorScheduleArrayDate = getDoctorSchedule?.schedule?.map((date) => date.date)

                                                    // get current day by filtering i frommdaynumber
                                                    var currentDay = getCalendarArray.filter((day) => day.dayNumber === i + 1)[0].dayName

                                                    // if current date is in getDoctorScheduleArrayDate and current month is ingetDoctorScheduleArrayMonthDate
                                                    if (getDoctorScheduleArrayDate?.includes(i)) {


                                                        // get current slot
                                                        var currentSlot = getSlot[j].slotTime
                                                        // check if currentSlot is night
                                                        if (getSlot[j].isNight === true) {


                                                            // check if current doctor has opt for nightDuty
                                                            if (getAllDoctor[k].nightDuty === true) {

                                                                console.log(currentDate, 'currentDate');
                                                                // check if shift is already in database
                                                                var checkShift = await ShiftModel.findOne({
                                                                    doctors: doctorId,
                                                                    shiftDate: currentDate,
                                                                    shiftDomain: {
                                                                        $in: [domain.toLowerCase(), domain.toUpperCase()]
                                                                    },
                                                                    shiftTime: currentSlot
                                                                })

                                                                // if shift is not in database then create shift
                                                                if (!checkShift) {

                                                                    var createShift = new ShiftModel({
                                                                        doctors: doctorId,
                                                                        shiftDate: currentDate,
                                                                        shiftDay: currentDay,
                                                                        shiftDomain: domain,
                                                                        shiftTime: currentSlot,
                                                                        slot: getSlot[j]._id
                                                                    })
                                                                    console.log(createShift, 'createShift');
                                                                    await createShift.save()

                                                                    // add 1 to DoctorsAlloted
                                                                    if (getSlot[j] && getSlot[j]?.Allotment[getSlotArrayIndex] && getSlot[j]?.Allotment[getSlotArrayIndex].DoctorsAlloted != undefined) {
                                                                        getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted = getSlot[j]?.Allotment[getSlotArrayIndex].DoctorsAlloted + 1


                                                                    }
                                                                    await getSlot[j].save()



                                                                    // add 1 to getAllDoctor[k].dutyHoursAllotedPerMonth
                                                                    getAllDoctor[k].dutyHoursAllotedPerMonth = getAllDoctor[k].dutyHoursAllotedPerMonth + 1
                                                                    await getAllDoctor[k].save()

                                                                    // add 1 to dutyHoursAllotedPerDay
                                                                    if (getAllDoctor[k]?.AllotmentPerDay?.length > 0) {
                                                                        var getDoctorAllotmentPerDayIndex = getAllDoctor[k]?.AllotmentPerDay?.map((date) => date.date).indexOf(currentDate)
                                                                        if (getDoctorAllotmentPerDayIndex > -1) {
                                                                            getAllDoctor[k].AllotmentPerDay[getDoctorAllotmentPerDayIndex].dutyHoursAlloted = getAllDoctor[k].AllotmentPerDay[getDoctorAllotmentPerDayIndex].dutyHoursAlloted + 1
                                                                            await getAllDoctor[k].save()
                                                                        }
                                                                        else {
                                                                            getAllDoctor[k].AllotmentPerDay.push({
                                                                                date: currentDate,
                                                                                dutyHoursAlloted: 1
                                                                            })
                                                                            await getAllDoctor[k].save()
                                                                        }
                                                                    }
                                                                    else {
                                                                        getAllDoctor[k].AllotmentPerDay.push({
                                                                            date: currentDate,
                                                                            dutyHoursAlloted: 1
                                                                        })
                                                                        await getAllDoctor[k].save()
                                                                    }
                                                                }


                                                            }
                                                        }
                                                        else {


                                                            //filter date in doctor schedule and get start tine
                                                            var getDoctorScheduleArrayStartTime = getDoctorSchedule.schedule.map((day) => day.start)
                                                            //filter date in doctor schedule and get end tine
                                                            var getDoctorScheduleArrayEndTime = getDoctorSchedule.schedule.map((day) => day.end)

                                                            // get index of current date in getDoctorScheduleArrayDate
                                                            var index = getDoctorScheduleArrayDate.indexOf(i.toString())

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

                                                                    // check if shift is already in database
                                                                    var checkShift = await ShiftModel.findOne({
                                                                        doctors: doctorId,
                                                                        shiftDate: currentDate,
                                                                        shiftDomain: {
                                                                            $in: [domain.toLowerCase(), domain.toUpperCase()]
                                                                        },
                                                                        shiftTime: currentSlot
                                                                    })
                                                                    console.log(createShift, 'createShift');
                                                                    // if shift is not in database then create shift
                                                                    if (!checkShift) {

                                                                        var createShift = new ShiftModel({
                                                                            doctors: doctorId,
                                                                            shiftDate: currentDate,
                                                                            shiftDay: currentDay,
                                                                            shiftDomain: domain,
                                                                            shiftTime: currentSlot,
                                                                            slot: getSlot[j]._id
                                                                        })

                                                                        await createShift.save()

                                                                        // add 1 to DoctorsAlloted
                                                                        if (getSlot[j] && getSlot[j]?.Allotment[getSlotArrayIndex] && getSlot[j]?.Allotment[getSlotArrayIndex].DoctorsAlloted != undefined) {
                                                                            getSlot[j].Allotment[getSlotArrayIndex].DoctorsAlloted = getSlot[j]?.Allotment[getSlotArrayIndex].DoctorsAlloted + 1


                                                                        }
                                                                        await getSlot[j].save()

                                                                        // add 1 to getAllDoctor[k].dutyHoursAllotedPerMonth
                                                                        getAllDoctor[k].dutyHoursAllotedPerMonth = getAllDoctor[k].dutyHoursAllotedPerMonth + 1
                                                                        await getAllDoctor[k].save()

                                                                        // add 1 to dutyHoursAllotedPerDay
                                                                        if (getAllDoctor[k]?.AllotmentPerDay?.length > 0) {
                                                                            var getDoctorAllotmentPerDayIndex = getAllDoctor[k]?.AllotmentPerDay?.map((date) => date.date).indexOf(currentDate)
                                                                            if (getDoctorAllotmentPerDayIndex > -1) {
                                                                                getAllDoctor[k].AllotmentPerDay[getDoctorAllotmentPerDayIndex].dutyHoursAlloted = getAllDoctor[k].AllotmentPerDay[getDoctorAllotmentPerDayIndex].dutyHoursAlloted + 1
                                                                                await getAllDoctor[k].save()
                                                                            }
                                                                            else {
                                                                                getAllDoctor[k].AllotmentPerDay.push({
                                                                                    date: currentDate,
                                                                                    dutyHoursAlloted: 1
                                                                                })
                                                                                await getAllDoctor[k].save()
                                                                            }
                                                                        }
                                                                        else {
                                                                            getAllDoctor[k].AllotmentPerDay.push({
                                                                                date: currentDate,
                                                                                dutyHoursAlloted: 1
                                                                            })
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
                                        else {
                                            continue;
                                        }
                                    }
                                    else {
                                        continue;
                                    }
                                }
                            }
                            else {
                                getSlot[j] && getSlot[j].Allotment[getSlotArrayIndex] &&
                                    (getSlot[j].Allotment[getSlotArrayIndex].isFulfilled = true)
                                await getSlot[j].save()
                            }

                        }
                    }
                }
                else {
                    continue;
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
    const { doctors, shiftDate, shiftDay, shiftTime, shiftDomain, slotId } = req.body
    try {
        //check if shift is already present then dont create
        var checkShift = await ShiftModel.findOne({
            shiftDate: shiftDate,
            shiftTime: shiftTime,
            shiftDomain: {
                $in: [shiftDomain.toLowerCase(), shiftDomain.toUpperCase()]
            },
            doctors: doctors
        })
        if (checkShift) {
            res.status(400).json({ message: 'Shift already present' })
        }
        else {
            var createShift = new ShiftModel({
                doctors: doctors,
                shiftDate: shiftDate,
                shiftDay: shiftDay,
                shiftTime: shiftTime,
                shiftDomain: shiftDomain,
                slot: slotId
            })
            await createShift.save()

            // get slot
            const getSlot = await SlotModel.findOne({
                _id: slotId
            })

            // get doctor
            const getDoctor = await userAccount.find({
                _id: doctors
            })



            // find index of getSlot.Allotment.filter((date) => parseInt(date.date) === new Date(shiftDate).getDate()) in Allotment array
            var getSlotArrayIndex = getSlot?.Allotment?.map((date) => parseInt(date.date)).indexOf(new Date(shiftDate).getDate())



            getDoctor.forEach(doctor => {
                // add 1 to getAllDoctor[k].dutyHoursAllotedPerMonth
                doctor.dutyHoursAllotedPerMonth = doctor.dutyHoursAllotedPerMonth + 1

                // add 1 to DoctorsAlloted
                getSlot.Allotment[getSlotArrayIndex].DoctorsAlloted = getSlot?.Allotment[getSlotArrayIndex].DoctorsAlloted + 1

                // add 1 to dutyHoursAllotedPerDay
                if (doctor?.AllotmentPerDay?.length > 0) {
                    var getDoctorAllotmentPerDayIndex = doctor?.AllotmentPerDay?.map((date) => date.date).indexOf(shiftDate)
                    if (getDoctorAllotmentPerDayIndex > -1) {
                        doctor.AllotmentPerDay[getDoctorAllotmentPerDayIndex].dutyHoursAlloted = doctor.AllotmentPerDay[getDoctorAllotmentPerDayIndex].dutyHoursAlloted + 1

                    }
                    else {
                        doctor.AllotmentPerDay.push({
                            date: shiftDate,
                            dutyHoursAlloted: 1
                        })

                    }
                }
            });

            await Promise.all(getDoctor.map(async (doctor) => {
                await doctor.save()
            }))
            await getSlot.save()

            res.status(200).json({ message: 'Shift created', data: createShift })
        }
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

// @route: GET /shift/get-shifts-by-month
// @purpose: : get routes to get all shifts by date
export const getShiftsByMonth = async (req, res) => {
    const { month, year, domain } = req.query
    try {
        var getShifts = await ShiftModel.find({
            shiftDomain: domain,
            shiftDate: {
                $gte: year + '-' + month + '-' + '01',
                $lte: year + '-' + month + '-' + '31'
            }
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

// @route: PUT /shift/update-shift/:id
// @purpose: : put routes to update shift
export const updateShift = async (req, res) => {
    const { doctors } = req.body
    // const id
    const id = req.params.id
    try {
        var getShift = await ShiftModel.findById(id)
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

// @route: DELETE /shift/delete-shift
// @purpose: : delete routes to delete shift by date
export const deleteShift = async (req, res) => {
    const id = req.params.id
    try {
        var getShift = await ShiftModel.findById(id)

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

// @route: GET /shift/get-shifts-by-doctor/:id
// @purpose: : get routes to get all shifts by doctor
export const getShiftsByDoctorId = async (req, res) => {
    const id = req.params.id
    const { domain } = req.query
    try {
        var getShifts = await ShiftModel.find({
            doctors: id,
            shiftDomain: domain.toLowerCase() || domain
        })
        res.status(200).json({ message: 'All shifts', data: getShifts })
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}
