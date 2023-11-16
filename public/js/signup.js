import { showAlert } from './alert.js'

document.querySelector('.form__signup').addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.querySelector('#name').value;
    const email = document.querySelector('#email').value.trim().toLowerCase();
    const password = document.querySelector('#password').value;
    const passwordConfirm = document.querySelector('#passwordConfirm').value;
    // console.log(name, email, password, passwordConfirm)

    try{
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/signup',
            data: {
                name: name,
                email: email,
                password: password,
                passwordConfirm: passwordConfirm
            }
        });

        // console.log(res);
        if(res.data.status === 'success'){
            showAlert('success', 'You are signed in successfully');
            window.setTimeout(() => {
                location.assign('/me');
            }, 3000);
        }
    }catch(err){
        // console.log(err)
        showAlert('error', err.response.data.message)
    }   
})