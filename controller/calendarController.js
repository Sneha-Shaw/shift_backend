import CalendarModel from "../model/calendarSchema.js";

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
        console.log(getCalendar);
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
    let { currentMonth,year } = req.query

    try {
        // parseint currentmonth

        currentMonth = parseInt(currentMonth)
        year = parseInt(year)
        var getCalendar = await CalendarModel.findOne({
            calendarArray: {
                $elemMatch: {
                    dayMonth: currentMonth + 1,
                    dayYear: year
                }
            }
        })
        if (!getCalendar) {
            res.status(200).json({
                success: true,
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

