const User = require('./../models/userModel');
const Room = require('./../models/roomModel');
const Location = require('./../models/locationModel');
const catchAsync = require('./../utils/catchAsync');

exports.getSignUpPage = (req, res, next) => {
    res.status(200).render('signup', {
        title: 'Sign Up'
    })
};

exports.getLoginPage = (req, res, next) => {
    res.status(200).render('login', {
        title: 'Log in'
    })
}

exports.getUserRooms = catchAsync(async (req, res, next) => {
    const user = req.user;
    const userRender = await User.findById(user._id).populate({
        path: 'rooms',
        fields: 'name passcode slug'
    })
    res.status(200).render('userRooms', {
        title: user.name,
        user: userRender
    })
});

exports.getRoomPage = catchAsync(async(req, res, next) => {
    const roomSlug = req.params.slug;
    const roomData = await Room.findOne({ slug: roomSlug }).populate({
        path: 'users',
        fields: 'name email'
    });
    // console.log((roomData));/

    const locationRoom = await Location.find({ room: roomData._id })
    // console.log(locationRoom);

    res.status(200).render('mapRooms', {
        title: roomData.name,
        room: roomData,
        locations: locationRoom
    })
});