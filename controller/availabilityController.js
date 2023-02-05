import availabilityScheduleModel from '../model/AvailabilityScheduleSchema.js'
import userAccount from '../model/userAccountSchema.js'
import isEmpty from '../utils/isEmpty.js'

//@route: POST /shift/add-availability
//@purpose: : post routes for  user to add availability
export const addAvailability = async (req, res) => {
    const { id, schedule } = req.body
    // check if user exists
    const checkUser = await userAccount
        .findById(id)
    if (isEmpty(checkUser)) {
        res.status(404).json({
            success: false,
            message: "User not found!"
        })
    }
    else {
        // if user is already in the availability model then edit it according to the input else create a new
        const checkAvailability = await availabilityScheduleModel
            .findOne({ user: id })
        if (isEmpty(checkAvailability)) {
            const newAvailability = new availabilityScheduleModel({
                schedule,
                user: id
            })
            const saveAvailability = await newAvailability.save()
            res.json({
                success: true,
                message: "Availability added successfully!",
                saveAvailability
            })
        }
        else {

            // add data in schedule
            const saveAvailability = await availabilityScheduleModel
                .findOneAndUpdate(
                    { user: id },
                    {
                        //    get all elements from schedule then push in schedule
                        $push: {
                            schedule: {
                                $each: schedule
                            }
                        }
                    },
                    {
                        new: true
                    }
                )

            // save
            await saveAvailability.save()

            // send availability
            res.status(200).json({
                success: true,
                message: "Availability added successfully!",
                saveAvailability
            })


        }
    }
}



// @route: GET /shift/:id/get-availability   
// @purpose: : get routes for  user to get availability
export const getAvailability = async (req, res) => {
    try {
        const id = req.params.id
        const getAvailability = await availabilityScheduleModel
            .find({ user: id })
            .sort({ $natural: -1 })
            .populate('user', 'name email mobile')
        res.status(200).json(getAvailability)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

// @route: GET /shift/get-availability-by-date
// @purpose: : get routes for  user to get availability by date
export const getAvailabilityByDate = async (req, res) => {
    try {
        const { date } = req.query
        const getAvailabilityByDate = await availabilityScheduleModel
            .find({ schedule: { $elemMatch: { date: date } } })
            .sort({ $natural: -1 })
            .populate('user', 'name email mobile')
        res.status(200).json(getAvailabilityByDate)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

// @route: GET /shift/get-all-availability
// @purpose: : get routes for  user to get all availability
export const getAllAvailability = async (req, res) => {
    try {
        //    get availability.schedule
        const getAllAvailability = await availabilityScheduleModel
            .find()
            .populate('user', 'name email mobile')
        res.status(200).json(getAllAvailability)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

//@route: DELETE /shift/delete-availability-by-user
//@purpose: : post routes for  user to delete availability
export const deleteAvailabilityByUser = async (req, res) => {
    const { id } = req.body
    // check if user exists
    const checkUser = await userAccount
        .findById(id)
    if (isEmpty(checkUser)) {
        res.status(404).json({
            success: false,
            message: "User not found!"
        })
    }
    else {
        const deleteAvailability = await availabilityScheduleModel
            .findOneAndDelete({ user: id })
        res.json({
            success: true,
            message: "Availability deleted successfully!",
            deleteAvailability
        })
    }
}

// @route: DELETE /shift/delete-availability-by-date
// @purpose: : delete routes for  user to delete availability by date
export const deleteAvailabilityByDate = async (req, res) => {
    const { id, date,start,end } = req.body
    // check if user exists
    const checkUser = await userAccount
        .findById(id)
    if (isEmpty(checkUser)) {
        res.status(404).json({
            success: false,
            message: "User not found!"
        })
    }
    else {
        const deleteAvailability = await availabilityScheduleModel
            .findOneAndUpdate(
                { user: id },
                {
                    //    get all elements from schedule then push in schedule
                    $pull: {
                        schedule: {
                            date: date,
                            start: start,
                            end: end
                        }
                    }
                },
                {
                    new: true
                }
            )
        res.json({
            success: true,
            message: "Availability deleted successfully!",
            deleteAvailability
        })
    }
}

