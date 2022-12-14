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
        type: Number,
        required: true
    },
    shiftStartDate:{
        type: Date,
        required: true
    },
    shiftEndDate:{
        type: Date,
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
    shiftStatus:{
        type: String,
        default: "Approved",
        enum: ["Approved", "Pending", "Rejected"]
    }
});

const ShiftModel = mongoose.model("Shift", shiftSchema);

export default ShiftModel;
