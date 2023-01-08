import mongoose from "mongoose";
const schema = mongoose.Schema;

const slotSchema = new schema({
    slotTime: {
        type: String,
        required: true
    },
//    store doctorneeded and doctor alloted and isfulfilled for a date in an array
    Allotment:[
        {
            DoctorsNeeded: {
                type: Number,
                default:0
            },
            SeniorNeeded: {
                type: Number,
                default: 0
            },
            DoctorsAlloted:{
                type: Number,
                default: 0
            },
            SeniorAlloted:{
                type: Number,
                default: 0
            },
            isFulfilled: {
                type: Boolean,
                default: false
            },
           date:{
                type: String,
                required: true,
           }
        }
    ],
    isNight: {
        type: Boolean,
        required: true
    }

})

const SlotModel = mongoose.model("Slot", slotSchema);

export default SlotModel;