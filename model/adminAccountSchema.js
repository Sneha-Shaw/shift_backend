import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
const schema = mongoose.Schema

const adminAcSchema = new schema({
    name: {
        type: String,
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
    RegisteredAt: {
        type: Date,
        default: Date.now
    }
})

//Encrypting the password before store into DB
adminAcSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})

const adminAccount = mongoose.model('AdminAccount', adminAcSchema)

export default adminAccount
