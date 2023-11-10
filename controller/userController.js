const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}

exports.updateUserRoom = catchAsync(async (req, res, next) => {
    const roomId = req.body.roomId;
    const userId = req.body.userId;
    const user = await User.findByIdAndUpdate(userId, {$push: {rooms: roomId }}, {new: true})
    res.status(200).json({
        status: 'success',
        message: 'User Updated',
        data:{
            user
        }
    })
});


exports.updateMe = catchAsync(async (req, res, next) => {
    console.log(req.file);
    console.log(req.body);
    // Cannot change password or email using this route, throws an error if attempted
    if(req.body.password || req.body.passwordConfirm){
        return next(
            new AppError('This route is not for password updates.', 400)
        )
    };

    // Filter out unwated field names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');

    // Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data:{
            user: updatedUser
        }
    });
});