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
        type: Date,
        required: true
    },
    endDate:{
        type: Date,
        required: true
    },
    leaveStatus:{
        type: String,
        required: true,
        enum: ["awaiting", "approved", "declined"]
    },
    leaveDuration:{
        type: String,
        required: true
    },
    leaveAppliedDate:{
        type: Date,
        default: Date.now
    },
    // user account 
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserAccount'
    }
})

const leaveRequestModel = mongoose.model('LeaveRequest', leaveRequestSchema)

export default leaveRequestModel
