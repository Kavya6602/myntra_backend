const express = require('express');
const router = express.Router();
const connection = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const { logRequest,validateQueryParams} = require('./middleware')
// const crypto = require('crypto');

// function secret(){

//     const secretKey = crypto.randomBytes(32).toString('hex');
//     console.log(secretKey)
// }

// secret();

const secretKey = process.env.JWT_SECRET_KEY

const getUser = async (req, res) => {
    try {
        const { limit, offset } = req.query;

        const query = `select name,is_active,email,password from users limit ? offset ?`;

        const [result] = await connection
            .promise()
            .execute(query, [limit, offset])

        res.status(200).send({ message: "All data returned", result: result });

    } catch (e) {
        console.error(e.message);
        res.status(500).send(e.message);
    }
}

const register = async (req, res) => {
    try {
        const { name, is_active, email, password } = req.body;

        if (!name || !is_active || !email || !password) {
            res.status(400).json({ message: 'Name, Active status, Email and Password are all required' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const query = `insert into users (name,is_active,email,password) values ( ?, ?, ?, ?)`;
        const [result] = await connection
            .promise()
            .execute(query, [name, is_active, email, hashedPassword]);

        res.status(201).json({ message: 'User registered successfully', result: result })
    } catch (e) {
        console.log(e);
        res.status(500).send({ message: e.message });
    }
}

const login = async (req, res) => {
    try {
        // let { id } = req.params
        let { email, password } = req.body;

        // Validate the fields
        if (!email && !password) {
            res.status(400).json({ message: "Email and Password are required" })
        } else if (!email) {
            res.status(400).send({ message: "Email is required" })
        } else if (!password) {
            res.status(400).send({ message: "Password is required" })
        }

        const query = `select user_id,email,password from users where email = ?;`;

        const [value] = await connection
            .promise()
            .execute(query, [email])
        console.log(value)

        if (value.length === 0) {
            throw new Error('User not found')
        }

        const storedHashedPassword = value[0].password;

        const match = await bcrypt.compare(password, storedHashedPassword);
        console.log(password.length, storedHashedPassword.length)

        if (match) {
            const token = jwt.sign({ user_id: value[0].user_id }, secretKey, { expiresIn: '1h' });

            const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

            // Log the decoded token to the console
            console.log("Decoded Token:", decodedToken);
            
            res.status(200).json({
                message: "Successful login",
                user_id: value[0].user_id,
                token:token
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }

        // res.status(200).send({ message: "Successful login", result: value })
    } catch (e) {
        console.log(e);
        res.status(500).send({ message: e.message });
    }
}

const forgotPassword = async (req, res) => {
    try {
        const otp = () => Math.floor(1000 + Math.random() * 9000);
        const otpCall = otp();

        const { email } = req.body;

        if (!email) {
            res.status(404).send({ message: 'Email field is required' })
        }
        // console.log(email)
        const emailQuery = `SELECT email FROM users WHERE email = ?`;
        let userExists = await connection.promise().execute(emailQuery, [email]);
        // console.log(userExists)
        if (!userExists[0].length) {
            res.status(404).send({ message: "No account found with this email" });
        }

        const otpQuery = `update users set otp = ? where email = ?`;
        let userotp = await connection.promise().query(otpQuery, [otpCall, email]);
        console.log(userotp);

        res.status(200).send({ message: `A one time password has been sent to your email address ${email}` })

    } catch (e) {
        console.log(e.message);
        res.status(500).send({ message: e.message });
    }
}

const resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        if (!email || !otp || !password) {
            res.status(400).send({ message: "Please provide all the details" })
        }

        const otpCheck = `select otp from users where email = ?`;

        const [result] = await connection
            .promise()
            .execute(otpCheck, [email]);

        console.log(result)
        if (result[0].otp !== otp) {
            return res.status(401).json({ message: "Invalid OTP" });
        }

        const passwordUpdate = `update users set password= ?, otp = null where email = ?`;

        const [value] = await connection
            .promise()
            .execute(passwordUpdate, [password, email]);

        console.log(value);

        res.status(200).send({ message: "Password changed successfully", value: value })

    } catch (e) {
        console.log(e);
        res.status(500).send({ message: e.message });
    }
}

//User
router.get('/user', logRequest,validateQueryParams,getUser)
//login
router.post('/login',logRequest, login)
router.post('/register',logRequest, register);
router.post('/forgotpassword', logRequest,forgotPassword);
router.post('/resetpassword',logRequest, resetPassword);

module.exports = router