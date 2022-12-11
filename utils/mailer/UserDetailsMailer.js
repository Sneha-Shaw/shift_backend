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

export default async function sendmail(createUserAccount) {
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
            from: 'Tricog <snehashaw122@gmail.com>',
            to: email,
            subject: 'Account credentials',
            html: `<div><h2>Hi ${createUserAccount.name}!</h2>
            <p> Your account has been created successfully. </p>
            <p> Your account credentials are as follows: </p>
            <p> Email: ${createUserAccount.email} </p>
            <p> Password: ${createUserAccount.password} </p>
            <p> Please login to your account and change your password. </p>
            <p> We are glad you are here!</p>
            <p><b> Team Tricog</b></p></div>`
        }

        const result = await transporter.sendMail(mailOptions)
        return result
    } catch (error) {
        return error
    }
}
