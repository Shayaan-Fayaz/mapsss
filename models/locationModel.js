const mongoose =require('mongoose');
const moment = require('moment');

const locationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    room: {
        type: mongoose.Schema.ObjectId,
        ref: 'Room'
    },
    name: String,
    location: {
        type:{
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    time: 'String'

});

locationSchema.pre('save', function(next) {
    this.time = moment().format('h:mm a');
    next();
});


locationSchema.pre(/^find/, function(next){
    this.populate({
        path: 'user room',
        select: '-__v -users'
    });
    next();
})

const Location = mongoose.model('Locationss', locationSchema);

module.exports = Location;