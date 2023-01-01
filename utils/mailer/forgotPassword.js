import nodemailer from 'nodemailer'
import { google } from 'googleapis'
import env from 'dotenv'

env.config()

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const REFRESH_TOKEN = process.env.REFRESH_TOKEN

const oAuth2Clint = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
oAuth2Clint.setCredentials({ refresh_token: REFRESH_TOKEN })

export default async function sendmail(checkEmail) {
    try {
        const accessToken = await oAuth2Clint.getAccessToken()

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL,
                pass: process.env.PASS,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken
            }
        })

        const mailOptions = {
            from: 'Tricog <joe@gmail.com>',
            to: checkEmail.email,
            subject: `Tricog - Forgot Password`,
            html: `<div style="width:100%; height:100vh; display:flex; aligh-item:center; justify-content:center; background:#f9f9f9;">
                        <div style="width:90%; height:90%; background:#fff; text-align:left; padding-left:20px;">
                          <h1 style="color:#23AFDB"> Tricog </h1>
                          <h2>Hi ${checkEmail?.name}, </h2>
                          <p>We received a request to reset the password on your <span style="color:#7D7D7D;">Tricog</span> <span style="color:#23AFDB;">user</span> Account.</p>
                          <p> Click on the link to complete the reset.</p>
                          <p><a href="http://localhost:3000/reset-password/${checkEmail._id}"> http://localhost:3000/reset-password/${checkEmail._id} </a></p>
                          <p> If you did not request a password reset, please ignore this email.</p>
                        </div>
                    </div>`
        }

        const result = await transporter.sendMail(mailOptions)
        return result
    } catch (error) {
        return error
    }
}
