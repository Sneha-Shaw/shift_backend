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
                type: Number
            },
            SeniorNeeded: {
                type: Number
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
                type: Number,
                default: 1
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