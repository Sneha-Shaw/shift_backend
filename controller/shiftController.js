import ShiftModel from "../model/ShiftSchema.js";
import adminAccount from '../model/adminAccountSchema.js'
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
        console.log(getDoctor);
        // get doctor id
        const getDoctorId = getDoctor.map((doctor) => doctor._id)
        console.log(getDoctorId);
        // get doctor names
        const getDoctorName = getDoctor.map((doctor) => doctor.name)
        console.log(getDoctorName);
        // getBreaks
        const getBreaks = await breakModel.find({})
        console.log(getBreaks);
        // get breaks whose break status is true
        const getBreaksTrue = getBreaks.filter((breaks) => breaks.breakStatus === true)
        console.log(getBreaksTrue);
        // slot array with 1 hr diff start from 12 am and in 12 hour format
        const slot = ["12:00 AM", "01:00 AM", "02:00 AM", "03:00 AM", "04:00 AM",
            "05:00 AM", "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM",
            "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM",
            "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM",
            "08:00 PM", "09:00 PM", "10:00 PM", "11:00 PM"]
        console.log(slot);
        // night duty
        const nightDuty = ["12:00 AM", "01:00 AM", "02:00 AM", "03:00 AM", "04:00 AM",
            "05:00 AM"]
        console.log(nightDuty);
        //day duty
        const dayDuty = [ "05:00 AM","06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM",
            "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM",
            "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM",
            "08:00 PM", "09:00 PM", "10:00 PM", "11:00 PM","12:00 AM"]
        console.log(dayDuty);
        
        // check if doctor is in availabilityScheduleModel for loop
        // for (let i = 0; i < getDoctorId.length; i++) {
        //     const checkDoctor = await availabilityScheduleModel.findOne({ user: getDoctorId[i] })
        //     console.log(checkDoctor);
        //     if (checkDoctor) {
        //         // get schedule day
        //         const getScheduleDay = getSchedule.map((schedule) => checkDoctor.schedule.day)
        //         // get schedule start time
        //         const getScheduleStartTime = getSchedule.map((schedule) => checkDoctor.schedule.startTime)
        //         // get schedule end time
        //         const getScheduleEndTime = getSchedule.map((schedule) => checkDoctor.schedule.endTime)
        //         // create shift for every day in month by checking dioctor availability
        //         for (let j = 0; j < getScheduleDay.length; j++) {
        //             // get day
        //             const getDay = getScheduleDay[j]
        //             // get start time
        //             const getStartTime = getScheduleStartTime[j]
        //             // get end time
        //             const getEndTime = getScheduleEndTime[j]
        //             // get duration
        //             const getDuration = getEndTime - getStartTime
        //             // get start date
        //             const getStartDate = new Date(2021, 0, getDay)
        //             // get end date
        //             const getEndDate = new Date(2021, 0, getDay)
        //             // create shift
        //             const newShift = new ShiftModel({
        //                 shiftName: getDoctorName[i],
        //                 shiftStartTime: getStartTime,
        //                 shiftEndTime: getEndTime,
        //                 shiftDuration: getDuration,
        //                 shiftStartDate: getStartDate,
        //                 shiftEndDate: getEndDate,
        //                 shiftBreaks: getBreaks,
        //                 doctors: getDoctorId[i],
        //                 shiftStatus: "Approved"
        //             })
        //             // save shift
        //             const saveShift = await newShift.save()
        //             res.json({
        //                 success: true,
        //                 message: "Shift generated successfully!",
        //                 saveShift
        //             })
        //         }
        //     } 
        //     else {
        //         res.status(404).json({
        //             success: false,
        //             message: "Doctor not found!"
        //         })
        //     }
        // }

    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}