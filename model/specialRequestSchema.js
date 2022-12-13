import mongoose from 'mongoose'
const schema = mongoose.Schema

const specialRequestSchema = new schema({
//   user account
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserAccount'
    },
//   request 
    request: {
        type: String,
        required: true
    },
//   request status
    requestStatus: {
        type: String,
        required: true,
        enum: ["awaiting", "approved", "declined"]
    },
//   request date
    requestDate: {
        type: Date,
        default: Date.now
    }
})

const specialRequestModel = mongoose.model('SpecialRequest', specialRequestSchema)

export default specialRequestModel