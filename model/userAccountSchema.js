import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
const schema = mongoose.Schema

const userAcSchema = new schema({
    name: {
        type: String,
        require: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mobile:{
        type: Number
    },
    password: {
        type: String,
    },
    department:{
        type: String
    },
    designation:{
        type: String
    },
    type:{
        type: String,
        default: 'permanent',
        enum: ['permanent', 'contractual']
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
