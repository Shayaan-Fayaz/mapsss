const mongoose = require('mongoose');
const slugify = require('slugify');

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Room has to have a name']
    },
    passcode: {
        type: String,
        required: [true, 'Room needs to have a passcode'],
        unique: true
    },
    slug: String,
    users: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }]
});


roomSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower: true});
    next();
})

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;