import mongoose from 'mongoose'
const schema = mongoose.Schema

const breakSchema = new schema({
    breakName: {
        type: String,
        required: true
    },
    startTime:{
        type: String,
        required: true
    },
    endTime:{
        type: String,
        required: true
    },
    breakDuration:{
        type: String,
        required: true
    },
    breakType:{
        type: String,
        required: true
    },
    breakStatus:{
        type: Boolean,
        default: false
    }
})

const breakModel = mongoose.model('Break', breakSchema)

export default breakModel