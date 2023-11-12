const express = require('express');
const multer = require('multer');
const authController = require('./../controller/authController');
const userController = require('./../controller/userController');

const upload = multer({ dest: 'public/img/users'})

router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
// router.route('/signup').post(authController.signup);
// router.get('/logout', authController)

router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword);

router.get('/logout', authController.logout);
// router.patch('/updateMe', upload.single('photo'), userController.updateMe);
router.patch('/', userController.updateUserRoom);

module.exports = router;