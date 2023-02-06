import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
const schema = mongoose.Schema

const userAcSchema = new schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String
    },
    mobile: {
        type: Number
    },
    password: {
        type: String,
    },
    address: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    pincode: {
        type: Number
    },
    about: {
        type: String
    },
    designation: {
        type: String
    },
    domain :{
        type: Array,
        default: []
    },
    type: {
        type: String,
        default: 'permanent',
        enum: ['permanent', 'contractual']
    },
    dutyHoursPerMonth: {
        type: Number,
        default: 192
    },
    dutyHoursPerDay: {
        type: Number,
        default: 8
    },
    dutyHoursAllotedPerMonth: {
        type: Number,
        default: 0
    },
    AllotmentPerDay: [
        {
            dutyHoursAlloted: {
                type: Number,
                default: 0
            },
            date: {
                type: String
            }
        }
    ],
    nightDuty: {
        type: Boolean,
        default: false
    },
    RegisteredAt: {
        type: Date,
        default: Date.now
    }
})

//Encrypting the password before store into DB
userAcSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})

const userAccount = mongoose.model('UserAccount', userAcSchema)

export default userAccount
