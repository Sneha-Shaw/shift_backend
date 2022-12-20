import mongoose from "mongoose";
const schema = mongoose.Schema;

const shiftSchema = new schema({
    shiftName: {
        type: String,
        required: true,
        default: "Untitled"
    },
    shiftStartTime: {
        type: String,
        required: true
    },
    shiftEndTime: {
        type: String,
        required: true
    },
    shiftDuration: {
        type: Number
    },
    shiftStartDate:{
        type: String,
        required: true
    },
    shiftEndDate:{
        type: String,
        required: true
    },
    shiftBreaks:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Break"
    },
    doctors:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserAccount"
        }
    ],
    slot:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Slot"
    },
    shiftStatus:{
        type: String,
        default: "Awaiting",
        enum: ["Approved", "Awaiting", "Declined"]
    }
});

const ShiftModel = mongoose.model("Shift", shiftSchema);

export default ShiftModel;
