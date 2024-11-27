const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/users', userController.createUser);
router.post('/login', userController.loginUser);
router.get('/users/:email', userController.getUserByEmail);
router.put('/users/password', userController.updatePassword);
router.post('/users/send-otp', userController.sendOtp);
router.post('/users/verify-otp', userController.verifyOtp);

module.exports = router;