const express = require('express');
const viewController = require('./../controller/viewController');
const authController = require('./../controller/authController')

router = express.Router();

router.route('/signup').get(viewController.getSignUpPage);
router.route('/').get(viewController.getLoginPage);
router.route('/me').get(authController.protect, viewController.getUserRooms);
router.route('/rooms/:slug').get(authController.protect, viewController.getRoomPage);

module.exports = router