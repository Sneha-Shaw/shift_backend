import mongoose from 'mongoose'
const schema = mongoose.Schema

const domainSchema = new schema({
    domainName: {
        type: String,
        required: true,
        unique: true
    },
    domainDescription: {
        type: String,
    },
    domainStatus: {
        type: String,
        enum: ["active", "inactive"],
    }
})

const domainModel = mongoose.model('Domain', domainSchema)

export default domainModel