const express = require('express');
const mapController = require('../controller/locationController')

router = express.Router();

router.get('/', mapController.getAllLocation);

router.post('/', mapController.createLocation);

module.exports = router;