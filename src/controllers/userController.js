const prisma = require('../prisma/client');
const AWS = require('aws-sdk');

// Configurar AWS SNS
AWS.config.update({ region: 'us-east-1' }); // Verifique se esta é a região correta para sua conta
const sns = new AWS.SNS();

exports.createUser = async (req, res) => {
	try {
		const { email, password, name, phone } = req.body;
		const user = await prisma.user.create({
			data: { email, password, name, phone },
		});
		res.status(201).json({ message: 'User created successfully' });
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

exports.loginUser = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await prisma.user.findUnique({ where: { email } });
		if (user && user.password === password) {
			res.status(200).json({ message: 'Login successful' });
		} else {
			res.status(401).json({ error: 'Invalid email or password' });
		}
	} catch (error) {
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

exports.getUserByEmail = async (req, res) => {
	try {
		const { email } = req.params;
		const user = await prisma.user.findUnique({ where: { email } });
		if (user) {
			res.status(200).json(user);
		} else {
			res.status(404).json({ error: 'User not found' });
		}
	} catch (error) {
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

exports.sendOtp = async (req, res) => {
	try {
		const { email } = req.body;
		const user = await prisma.user.findUnique({ where: { email } });
		if (user) {
			const otp = Math.floor(1000 + Math.random() * 9000).toString(); // Gera um código OTP de 4 dígitos

			// Enviar SMS usando AWS SNS
			if (user.phone) {
				const params = {
					Message: `Your OTP code is ${otp}`,
					PhoneNumber: "+5527995141413",
				};
				sns.publish(params, (err, data) => {
					if (err) {
						console.error('Error sending SMS:', err);
						res.status(500).json({ error: 'Error sending SMS' });
					} else {
						console.log('SMS sent:', data);
						res.status(200).json({ message: 'OTP sent successfully' });
					}
				});
			} else {
				res.status(400).json({ error: 'Phone number not found' });
			}
		} else {
			res.status(404).json({ error: 'User not found' });
		}
	} catch (error) {
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

exports.verifyOtp = async (req, res) => {
	try {
		const { email, otp } = req.body;
		if (otpStore[email] === otp) {
			delete otpStore[email]; // Remove o OTP após a verificação
			res.status(200).json({ message: 'OTP verified successfully' });
		} else {
			res.status(400).json({ error: 'Invalid OTP' });
		}
	} catch (error) {
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

exports.updatePassword = async (req, res) => {
	try {
		const { email, newPassword } = req.body;
		const user = await prisma.user.findUnique({ where: { email } });
		if (user) {
			await prisma.user.update({
				where: { email },
				data: { password: newPassword },
			});

			res.status(200).json({ message: 'Password updated successfully' });
		} else {
			res.status(404).json({ error: 'User not found' });
		}
	} catch (error) {
		res.status(500).json({ error: 'Internal Server Error' });
	}
};