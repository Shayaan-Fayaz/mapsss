const moment = require('moment');

exports.formatMarker = (name, latitude, longitude) => {
    // console.log(name)
    return {
        name,
        latitude,
        longitude,
        time: moment().format('h:mm a')
    }
}


// the below function takes the arguments and data of the user and room and format to our need to use it to show the hsitory of messages and plot it on the marker
exports.formatMessageMarker = (name, latitude, longitude, userdata, roomdata, time) =>{
    return {
        name: name,
        latitude: latitude,
        longitude: longitude,
        username: userdata.name,
        roomname: roomdata.name,
        time: time
    }
}