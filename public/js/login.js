import { showAlert } from './alert.js'

document.querySelector('.form__login').addEventListener('submit', async e => {
    e.preventDefault();

    const email = document.querySelector('#email').value.trim().toLowerCase();
    console.log(email);
    const password = document.querySelector('#password').value;
    // console.log(email, password)

    try{
        const res = await axios({
            method: 'POST', 
            url: '/api/v1/users/login',
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
        showAlert('error', err.response.data.message);
    }

   
})