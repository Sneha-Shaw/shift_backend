import mongoose from "mongoose";
const schema = mongoose.Schema;

const availabilityScheduleSchema = new schema({
    //   user account
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserAccount",
    },
    //    schedule contains a day and time which contains array of start and end time
    schedule: [
        {
            day: {
                type: String,
            },

            start: {
                type: String,
            },
            end: {
                type: String,
            }
        }
    ],
    //   date created
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const availabilityScheduleModel = mongoose.model("AvailabilitySchedule", availabilityScheduleSchema);

export default availabilityScheduleModel;