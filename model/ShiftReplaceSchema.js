import mongoose from "mongoose";
const schema = mongoose.Schema;

const shiftReplaceSchema = new schema({
   
    //name of person who cant work
    name: {
        type: String,
        required: "true"
    },
    // name of person who will work
    replacement: {
        type: String,
        required: "true"
    },
    // date of shift
    date: {
        type: String,
        required: "true"
    },
    // time of shift
    start:{
        type: String,
        required: "true"
    },
    end:{
        type: String,
        required: "true"
    },
    //   date created
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const shiftReplaceModel = mongoose.model("ShiftReplace", shiftReplaceSchema);

export default shiftReplaceModel;