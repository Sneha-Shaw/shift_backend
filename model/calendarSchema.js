import mongoose from 'mongoose';
const schema = mongoose.Schema;

const calendarSchema = new schema({
    // dayName
    // dayNumber
    // dayMonth
    // dayYear
    calendarArray:[
        {
            dayName: {
                type: String,
                required: true
            },
            dayNumber: {
                type: Number,
                required: true
            },
            dayMonth: {
                type: Number,
                required: true
            },
            dayYear: {
                type: Number,
                required: true
            }
        }
    ]
});

const CalendarModel = mongoose.model("Calendar", calendarSchema);

export default CalendarModel;