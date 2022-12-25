import mongoose from 'mongoose'
const schema = mongoose.Schema

const specialRequestSchema = new schema({
//   user account
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserAccount'
    },
    // user name
    username: {
        type: String,
        required: true
    },
//   request 
    request: {
        type: String,
        required: true
    },
//   request status
    requestStatus: {
        type: String,
        enum: ["awaiting", "approved", "declined"],
        default: "awaiting"
    },
//   request date
    requestDate: {
        type: Date,
        default: Date.now
    }
})

const specialRequestModel = mongoose.model('SpecialRequest', specialRequestSchema)

export default specialRequestModel