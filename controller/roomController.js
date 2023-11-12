const AppError = require('../utils/appError');
const Room = require('./../models/roomModel');
const catchAsync = require('./../utils/catchAsync');

exports.createRoom = catchAsync(async (req, res, next) => {
    const name = req.body.name;
    const passcode = req.body.passcode;
    const userId = req.body.userId;

    const data = await Room.create({
        name: name,
        passcode: passcode,
        users: userId 
    });

    res.status(201).json({
        status: 'success',
        data: {
            data
        }
    })
});

exports.getAllRooms = catchAsync(async (req, res, next) => {
    const data = await Room.find();
    res.status(200).json({
        status: 'success',
        data:{
            data
        }
    })
});

exports.addUserToRoom = catchAsync(async (req, res, next) => {
    const userId = req.body.userId;
    const passcode = req.body.passcode;
    const room = await Room.findOneAndUpdate({ passcode: passcode }, {
        $push:{
            users: userId
        }
    })


    if(!room){
        console.log('room not found')
        return next(new AppError('There is no room with that passcode', 400));
    }

    res.status(200).json({
        status: 'success',
        message: 'User joined the room',
        data:{
            room
        }
    })
});