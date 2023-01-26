import mongoose from "mongoose";
const schema = mongoose.Schema;

const shiftSchema = new schema({
    shiftName: {
        type: String,
        required: true,
        default: "Untitled"
    },
    shiftStartTime: {
        type: String
    },
    shiftEndTime: {
        type: String
    },
    shiftDuration: {
        type: Number,
        default: 1
    },
    shiftDate: {
        type: String,
        required: true
    },
    shiftBreaks: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Break"
    },
    shiftDay: {
        type: String,
        // required: true
    },
    shiftTime: {
        type: String,
        required: true
    },
    shiftDomain: {
        type: String,
        required: true
    },
    doctors: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserAccount"
        }
    ],
    slot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Slot"
    },
    shiftStatus: {
        type: String,
        default: "Awaiting",
        enum: ["Approved", "Awaiting", "Declined"]
    }
});

const ShiftModel = mongoose.model("Shift", shiftSchema);

export default ShiftModel;
