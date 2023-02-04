
// import slot model
import SlotModel from '../model/slotSchema.js'
import isEmpty from '../utils/isEmpty.js'


// @route: POST /shift/add-slot
// @purpose: : post routes to add slot
export const addSlot = async (req, res) => {
    const { slotTime, isNight } = req.body
    try {
        var newSlot = new SlotModel({
            slotTime,
            isNight
        })
        // save slot
        var saveSlot = await newSlot.save()
        // send slot
        res.status(200).json({
            success: true,
            message: "Slot added successfully!",
            saveSlot
        })
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}

// @route: PUT /shift/update-slot
// @purpose: : put routes to update slot
export const updateSlot = async (req, res) => {
    const {
        Allotment,
        slotTime
    } = req.body
    try {
        var getSlot = await SlotModel
            .findOne({
                slotTime
            })
        if (!getSlot) {
            res.status(400).json({
                success: false,
                message: "Slot not found!"
            })
        }
        else {
            // if date is already present then edit the data eeelse create new
            if (!isEmpty(getSlot.Allotment)) {
                // check if current date is already in allotment
                var Present = false
                for (let i = 0; i < getSlot.Allotment.length; i++) {
                    if (getSlot.Allotment[i].date === Allotment[0].date) {
                        Present = true
                        break
                    }
                }
                if (Present) {
                    // find by date and update doctorNeeded
                    var getSlotUpdate = await SlotModel
                        .findOneAndUpdate({
                            slotTime,
                            Allotment: {
                                $elemMatch: {
                                    date: Allotment[0].date
                                }
                            },
                        }, {
                            $set: {
                                "Allotment.$.DoctorsNeeded": Allotment[0].DoctorsNeeded,
                                "Allotment.$.SeniorNeeded": Allotment[0].SeniorNeeded,
                                // "Allotment.$.DoctorsAlloted": Allotment[0].DoctorsAlloted,
                                // "Allotment.$.SeniorAlloted": Allotment[0].SeniorAlloted,
                                // "Allotment.$.isFulfilled": Allotment[0].isFulfilled
                            }
                        }, {
                            new: true
                        })

                    // save
                    var saveSlot = await getSlotUpdate.save()
                    // send slot
                    res.status(200).json({
                        success: true,
                        message: "Slot updated successfully!",
                        saveSlot
                    })
                }
                else {
                    var getSlotUpdate = await SlotModel
                        .findOneAndUpdate({
                            slotTime
                        }, {
                            $push: {
                                Allotment
                            }
                        }, {
                            new: true
                        })
                    // save
                    await getSlotUpdate.save()
                    // send slot
                    res.status(200).json({
                        success: true,
                        message: "Slot updated successfully!",
                        getSlotUpdate
                    })
                }
            }
            else {
                // add data in allotment
                getSlot.Allotment = Allotment
                var saveSlot = await getSlot.save()
                // send slot
                res.status(200).json({
                    success: true,
                    message: "Slot updated successfully!",
                    saveSlot
                })
            }
            // save slot

        }

    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}

// @route: PUT /shift/update-all-slots
// @purpose: : put routes to update all slot
export const updateAllSlot = async (req, res) => {
    const {
        Allotment
    } = req.body
    try {

        // update doctoralloted and isfulfilled in all slots
        const getSlotUpdate = await SlotModel
            .updateMany(
                {
                    Allotment: {
                        $elemMatch: {
                            date: Allotment[0].date
                        }
                    }
                },
                {
                    $set: {
                        "Allotment.$.DoctorsAlloted": Allotment[0].DoctorsAlloted,
                        "Allotment.$.isFulfilled": Allotment[0].isFulfilled,
                    }
                }, {
                new: true
            }
            )

        // save
        // var saveSlot = await getSlotUpdate.save()
        // send slot
        res.status(200).json({
            success: true,
            message: "Slot updated successfully!",
            // saveSlot
        })
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}

// @route: /shift/get-all-slots
// @purpose: : get routes to get all slots
export const getAllSlots = async (req, res) => {
    try {
        var getAllSlots = await SlotModel.find()
        if (getAllSlots) {
            res.status(200).json({
                success: true,
                message: "Slots found!",
                getAllSlots
            })
        } else {
            res.status(404).json({
                success: false,
                message: "Slots not found!"
            })
        }
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}

// @route: /shift/replace-date
// @purpose: : get routes to replace date
export const replaceDate = async (req, res) => {
    const {
        // slotTime,
        oldDate,
        newDate
    } = req.body
    try {
        // find by date and update doctorNeeded
        var getSlotUpdate = await SlotModel
            .findOneAndUpdate({
                // slotTime,
                Allotment: {
                    $elemMatch: {
                        date: oldDate
                    }
                },
            }, {
                $set: {
                    "Allotment.$.date": newDate
                }
            }, {
                new: true
            })

        // save
        var saveSlot = await getSlotUpdate.save()
        // send slot
        res.status(200).json({
            success: true,
            message: "Slot updated successfully!",
            saveSlot
        })
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}