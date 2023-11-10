const Location = require('../models/locationModel');
const catchAsync = require('./../utils/catchAsync');

exports.createLocation = catchAsync(async (req, res, next) => {
    const user = req.body.user;
    const room = req.body.room;
    const name = req.body.name;
    // const time = req.body.time;
    const longitude = req.body.longitude;
    const latitude = req.body.latitude;
    const location = {
        type: 'Point',
        coordinates: [longitude, latitude]
    }

    const newLocation = await Location.create({
        name: name,
        user: user,
        room: room,
        location: location,
        // time: time
    });

    res.status(201).json({
        message: 'success',
        data:{
            data: newLocation
        }
    })
});

exports.getAllLocation = catchAsync(async (req, res, next) => {
    const data = await Location.find();

    res.status(200).json({
        message: 'success',
        data:{
            data
        }
    })
});