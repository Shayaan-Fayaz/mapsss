const crypto = require('crypto');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('./../utils/email');
const { appendFile } = require('fs');


const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        // what will happen when the jwt expires (know more about it)
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };
    
    res.cookie('jwt', token, cookieOptions);

    user.password =undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data:{
            user
        }
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Check if email and password exists
    if(!email || !password){
        return res.status(400).json({
            status: 'fail',
            message: 'Please provide email and password'
        })
    }

    // Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');

    if(!user || !(await user.correctPassword(password, user.password))){
        return res.status(401).json({
            status: 'fail',
            message: 'Incorrect email or password'
        })
    }

    // If everything ok, send token to client
    createSendToken(user, 200, res);
});


exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success'
    })
}


exports.protect = catchAsync(async(req, res, next) => {
    // getting token and checking if it is there
    let token;

    // ask babith about this that i asked him the other dat
    if(req.cookies.jwt){
        token = req.cookies.jwt;
        // console.log(req.cookies)

    }

    if(!token){
        return res.status(401).json({
            status: 'fail', 
            message: 'You are not logged in to get access.'
        })
    }

    // verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // check if user still exists
    const currentUser = await User.findById(decoded.id);
    if(!currentUser){
        return res.status(401).json({
            status: 'fail',
            message: 'The user belonging to this token no longer exists.'
        })
    }

    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});


exports.forgotPassword =catchAsync(async(req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if(!user){
        return next(new AppError('There is no user with email address.', 400))
    }


    // 2) Generate random token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forgetyour password, please ignore this email.`

    try{
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10min)',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        })
    }catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the email. Try again later!'), 500);
    }
});

exports.resetPassword = async (req, res, next) => {
    // 1) get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() }});


    // 2) if token has not expired, and there is user, set the new password
    if(!user){
        return next(new AppError('Token is invalid or has expired', 400))
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    

    // 3) Update chagedPasswordAt property for the user

    // 4) Log the user in, send JWT
    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token
    })
}