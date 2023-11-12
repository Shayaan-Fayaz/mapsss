const crypto = require('crypto');
const mongoose =require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        lowercase: true,
        unique: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'Please provide your password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function(el){
                return el === this.password
            },
            message: 'Passwords are not the same!'
        }
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    rooms: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Room'
        }
    ]
});

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    this.passwordConfirm = undefined;

    next();
});

// userSchema.pre(/^find/, function(next){
//     this.populate({
//         path: 'rooms',
//         select: '-__v'
//     });
//     next();
// })

userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // console.log(resetToken);
    // console.log(this.passwordResetToken);
    this.passwordResetExpires = Date.now() + 10 * 60 *1000;

    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;