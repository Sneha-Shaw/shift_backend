import mongoose from "mongoose";
const schema = mongoose.Schema;

const slotSchema = new schema({
    slotTime: {
        type: String,
        required: true
    },
    DoctorsNeeded:{
        type: Number
    },
    SeniorNeeded:{
        type: Number
    },
    // get date by ref Calendar
    calendarId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Calendar"
    },
    // ref Doctor
    doctorId: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor"
        }
    ],
    isNight:{
        type: Boolean,
        required: true
    }

})

const SlotModel = mongoose.model("Slot", slotSchema);

export default SlotModel;