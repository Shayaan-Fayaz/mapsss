import { showAlert } from './alert.js'

document.querySelector('.form__login').addEventListener('submit', async e => {
    e.preventDefault();

    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    console.log(email, password)

    try{
        const res = await axios({
            method: 'POST', 
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data: {
                email: email,
                password: password
            }
        });
        
        if(res.data.status === 'success'){
            showAlert('success', 'You are logged in successfully!!');
            window.setTimeout(() => {
                location.assign('/me');
            }, 3000);
        }
    }catch(err){
        // showAlert('error', err.response.message);
        console.log(err.response.data.message)
        showAlert('error', err.response.data.message);
    }

   
})