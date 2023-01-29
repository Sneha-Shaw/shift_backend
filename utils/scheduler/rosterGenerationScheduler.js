
import schedule from 'node-schedule';
import {
    generateShift
} from '../../controller/shiftController.js'
import domainModel from '../../model/DomainSchema.js'

export const rosterGenerationScheduler = async () => {
    // schedule.scheduleJob('0 0 1 * *', async () => {

    // schedule job to run at 12:00 AM of last day of every month
    schedule.scheduleJob('0 0 1 * *', async () => {
        console.log('Roster Generation Scheduler Started');
        // get all domains
        const domains = await domainModel.find()
        // get start Date of current month in format YYYY-MM-DD
        const startDate = new Date().toISOString().slice(0, 7) + '-01'
        // get end Date of current month in format YYYY-MM-DD
        const endDate = new Date().toISOString().slice(0, 7) + '-31'
        // for each domain
        domains.forEach(async (domain) => {
            // send start and end and domain.domainName in req.body
            const req = {
                body: {
                    startDate,
                    endDate,
                    domain: domain.domainName
                }
            }
            // res
            const res = {
                status: (code) => {
                    return {
                        json: (data) => {
                            console.log(data);
                        }
                    }
                }
            }

            // generate shift for that domain
            await generateShift(
                req,
                res
            )
        })
    })

}