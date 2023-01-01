import adminAccount from '../model/adminAccountSchema.js'
import userAccount from '../model/userAccountSchema.js'
import env from 'dotenv'
import forgotPassword from '../utils/mailer/forgotPassword.js'

env.config()

// @route: /password/send-email
// @desc: send email to user/admin
export const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body
        const checkadmin = await adminAccount.findOne({
            email: email
        })
        const checkuser = await userAccount.findOne({
            email: email
        })
        if (checkadmin) {
            const result = await forgotPassword(checkadmin)
            return res.status(200).json({
                message: 'Email sent successfully',
                result
            })
        }
        else if (checkuser) {
            const result = await forgotPassword(checkuser)
            return res.status(200).json({
                message: 'Email sent successfully',
                result
            })
        }
        else {
            return res.status(404).json({
                message: 'User not found'
            })
        }

    } catch (error) {
        return res.status(500).json({
            message: 'Something went wrong',
            error
        })
    }
}

// @route: /password/reset-password/:id
// @desc: reset password
export const resetPassword = async (req, res) => {
    try {
        const id = req.params.id
        const { password } = req.body
        const checkadmin = await adminAccount.findById(id)
        const checkuser = await userAccount.findById(id)

        if (checkadmin) {
            checkadmin.password = password
            await checkadmin.save()
            return res.status(200).json({
                message: 'Password reset successfully'
            })
        }
        else if (checkuser) {
            checkuser.password = password
            await checkuser.save()
            return res.status(200).json({
                message: 'Password reset successfully'
            })
        }
        else {
            return res.status(404).json({
                message: 'User not found'
            })
        }

    } catch (error) {
        return res.status(500).json({
            message: 'Something went wrong',
            error
        })
    }
}