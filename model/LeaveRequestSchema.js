import mongoose from 'mongoose'
const schema = mongoose.Schema

const leaveRequestSchema = new schema({
    leaveType: {
        type: String,
        required: true,
        enum: ["casual", "sick"]
    },
    leaveReason: {
        type: String,
        required: true
    },
    startDate:{
        type: String,
        required: true
    },
    endDate:{
        type: String,
        required: true
    },
    leaveStatus:{
        type: String,
        enum: ["awaiting", "approved", "declined"],
        default: "awaiting"
    },
    leaveAppliedDate:{
        type: Date,
        default: Date.now
    },
    // user account 
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserAccount'
    },
    username:{
        type: String,
        required: true
    }
})

const leaveRequestModel = mongoose.model('LeaveRequest', leaveRequestSchema)

export default leaveRequestModel
