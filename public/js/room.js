import { showAlert } from './alert.js'

document.querySelector('#add__room').addEventListener('click', async e => {
    // e.preventDefault();
    const userId = document.querySelector('#add__room').getAttribute('userid');
    
    const roomForm = document.querySelector('.form__add-room');
    roomForm.style.display = 'block';

    const close = document.querySelector('.close_symbol-add');
    close.style.display = 'block'

    close.addEventListener('click', () => {
        roomForm.style.display = 'none'
        close.style.display = 'none'
    })

    roomForm.addEventListener('submit', async(e) => {
        const roomName = document.querySelector('#room-name').value;
        const roomPasscode = document.querySelector('#room-passcode').value;

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

        
    })

});


document.querySelector('#join__room').addEventListener('click', e=> {
    const userId = document.querySelector('#join__room').getAttribute('userid');

    const joinForm = document.querySelector('.form__join-room');
    joinForm.style.display = 'block';

    const close = document.querySelector('.close_symbol-join');
    close.style.display = 'block'

    close.addEventListener('click', () => {
        joinForm.style.display = 'none';
        close.style.display = 'none';
    })

    joinForm.addEventListener('submit', async(e) => {
        const roomPasscode = document.querySelector('#join-passcode').value;
        
        const res = await axios({
            method: 'PATCH',
            url: 'http://127.0.0.1:3000/api/v1/rooms',
            data:{
                userId: userId,
                passcode: roomPasscode
            }
        });
        
        const roomId = res.data.data.room._id;
        
        const userupdate = await axios({
            method: 'PATCH',
            url: 'http://127.0.0.1:3000/api/v1/users',
            data:{
                roomId: roomId,
                userId: userId
            }
        })
    })
});

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