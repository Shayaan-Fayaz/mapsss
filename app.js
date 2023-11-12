const path = require('path')
const express = require('express');
const http = require('http');
const socketio =require('socket.io');
const mongoose = require('mongoose');
const mapRouter = require('./router/mapRouter');
const userRouter = require('./router/userRouter');
const roomRouter= require('./router/roomRouter');
const viewRouter = require('./router/viewRouter');
const bodyParser = require('body-parser');
const marker = require('./utils/marker');
const { getRoomUsers } = require('./utils/users');
const compression = require('compression');

const globalErrorHandler = require('./controller/errorController');

const cookieParser = require('cookie-parser')


const dotenv = require('dotenv');
const AppError = require('./utils/appError');

dotenv.config({ path: './config.env' });

const app = express();

mongoose.connect(`mongodb+srv://shayaanfayaz:${process.env.DB_PASSWORD}@cluster0.8lpva5k.mongodb.net/mapsss`).then(console.log('DB connection successful')).catch(err => console.log(err));

const server = http.createServer(app);

const io = socketio(server);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(cookieParser());

app.use(compression());


app.use(express.static(path.join(__dirname, 'public')));


io.on('connection', socket => {
    console.log('New WS connected....');

    // let username;
    socket.on('joinRoom', ({ roomData, userData }) => {
        socket.join(roomData.name);

        username = userData.name
        
        socket.broadcast.to(roomData.name).emit('message', `${userData.name} has joined the chat`);

        io.to(roomData.name).emit('roomUsers', getRoomUsers(roomData));

        // socket.on('disconnect', `${userData.name} has left the chat`)
    })

    socket.on('newMarker', ({locationName, latitude, longitude, userData, roomData, time}) => {
        const data = marker.formatMessageMarker(locationName, latitude, longitude, userData, roomData, time);
        // the formatted data is emitted using socket
        io.to(data.roomname).emit('putMarker', data)
    })

    // the below sockets checks whether the user joined a new room and then emit an event which will update the users list in that particular room so that it can be seen by other members currently present in the room
    socket.on('newUserJoined', ({ newUserRoom, newUsername }) => {
        // console.log(newUserRoom,newUsername);
        // console.log(newUsername);
        io.to(newUserRoom).emit('updateNewUser', newUsername);
    })
    
})


app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/rooms', roomRouter);
app.use('/api/v1/location', mapRouter);

app.get('/', (req, res) => {
    res.status(200).render('index', {
        title: 'Sockets'
    })
})

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
});

app.use(globalErrorHandler)

server.listen(3000, () => {
    console.log('App running on port 3000')
})

// make sure to put unhandled rejection and uncaught exception error handling