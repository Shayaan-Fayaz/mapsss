const mongoose = require('mongoose');
const slugify = require('slugify');

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Room has to have a name']
    },
    passcode: {
        type: String,
        required: [true, 'Room needs to have a passcode']
    },
    slug: String,
    users: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }]
});


roomSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lowercase: true});
    next();
})

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;