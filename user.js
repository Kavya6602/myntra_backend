const express = require('express');
const router = express.Router();
const connection = require('./db')

const getUser = async (req, res) => {
    try {
        const { limit, offset } = req.query;

        if (!limit && !offset) {
            throw new Error(`Both limit and offset must be provided.`);
        } else if (!limit) {
            throw new Error(`Limit must be provided.`);
        } else if (!offset) {
            throw new Error(`Offset must be provided.`);
        }

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

        const query = `select email,password from users where email = ? and password = ?;`;

        const [value] = await connection
            .promise()
            .execute(query, [email, password])
        //check pssword and email
        if (value.length === 0) {
            throw new Error('User not found')
        }

        res.status(200).send({ message: "Successful login", result: value })
    } catch (e) {
        console.log(e);
        res.status(500).send({ message: e.message });
    }
}

const register = async (req, res) => {
    try {
        const { name, is_active, email, password } = req.body;

        if (!name || !is_active || !email || !password) {
            res.status(400).json({ message: 'Name, Active status, Email and Password are all required' })
        }

        const query = `insert into users (name,is_active,email,password) values (?, ?, ?, ?)`;
        const [result] = await connection
            .promise()
            .execute(query, [name, is_active, email, password]);

        res.status(201).json({ message: 'User registered successfully', result: result })
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

            res.status(200).send({message:"Password changed successfully",value:value})

    } catch (e) {
        console.log(e);
        res.status(500).send({ message: e.message });
    }
}

//User
router.get('/user', getUser)
//login
router.post('/login', login)
router.post('/register', register);
router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword', resetPassword);

module.exports = router