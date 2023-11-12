import { showAlert } from './alert.js'

const socket = io();


document.querySelector('#add__room').addEventListener('click', async e => {
    // e.preventDefault();
    // const userId = document.querySelector('#add__room').getAttribute('userid');
    
    const roomForm = document.querySelector('.form__add-room');
    roomForm.style.display = 'block';

    const close = document.querySelector('.close_symbol-add');
    close.style.display = 'block'

    close.addEventListener('click', () => {
        roomForm.style.display = 'none'
        close.style.display = 'none'
    })



});


const roomForm = document.querySelector('.form__add-room');
roomForm.addEventListener('submit', async(e) => {
    e.preventDefault();
    const userId = document.querySelector('#add__room').getAttribute('userid');
    const roomName = document.querySelector('#room-name').value;
    const roomPasscode = document.querySelector('#room-passcode').value;

    try{
        const room = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/rooms',
            data:{
                name: roomName,
                passcode: roomPasscode,
                userId: userId
            }
        });

        const roomId = room.data.data.data._id
        
        const updatedUser = await axios({
            method: 'PATCH',
            url: 'http://127.0.0.1:3000/api/v1/users',
            data:{
                roomId: roomId,
                userId: userId
            }
        });
        location.reload(true);
    }catch(err){
        console.log(err.response.data.message === 'Duplicate field value: "1212". Please use another value.')
        if(err.response.data.message === 'Duplicate field value: "1212". Please use another value.'){
            showAlert('error', 'The passcode is already taken');
        }else{
            showAlert('error', err.response.data.message);
        }
    }
})

document.querySelector('#join__room').addEventListener('click', e=> {
    // const userId = document.querySelector('#join__room').getAttribute('userid');

    const joinForm = document.querySelector('.form__join-room');
    joinForm.style.display = 'block';

    const close = document.querySelector('.close_symbol-join');
    close.style.display = 'block'

    close.addEventListener('click', () => {
        joinForm.style.display = 'none';
        close.style.display = 'none';
    })


});

const joinForm = document.querySelector('.form__join-room');
joinForm.addEventListener('submit', async(e) => {
    e.preventDefault();
    const roomPasscode = document.querySelector('#join-passcode').value;
    const userId = document.querySelector('#join__room').getAttribute('userid');

    try{
        const res = await axios({
            method: 'PATCH',
            url: 'http://127.0.0.1:3000/api/v1/rooms',
            data:{
                userId: userId,
                passcode: roomPasscode
            }
        });

        const newUserRoom = res.data.data.room.name;
        // console.log(res.data.data.room.name)

        
        const roomId = res.data.data.room._id;
        
        const userupdate = await axios({
            method: 'PATCH',
            url: 'http://127.0.0.1:3000/api/v1/users',
            data:{
                roomId: roomId,
                userId: userId
            }
        })

        // console.log(userupdate.data.data.user.name);
        const newUsername = userupdate.data.data.user.name;

        socket.emit('newUserJoined', { newUserRoom, newUsername});

        location.reload(true);
    }catch(err){
        showAlert('error', err.response.data.message);
    }
})


document.querySelector('.nav__logout').addEventListener('click', async () => {
    try{
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:3000/api/v1/users/logout'
        });

        if(res.data.status === 'success'){
            showAlert('success', 'You are logged out');
            window.setTimeout(() => {
                location.assign('/login');
            }, 3000)
        }
    }catch(err){
        showAlert('error', 'Error in logging out. Try again later')
    }
})


document.querySelector('.close_symbol-join').addEventListener('click', () => {
    const form = document.querySelector('.form__join-room');
    form.style.display = 'none';
})