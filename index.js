const express = require('express');
const product = require('./product');
const wishlist = require('./wishlist');
const user = require('./user');
const router = express.Router();

const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json());

app.use('/', product)
app.use('/', wishlist);
app.use('/',user)


app.listen(3001, () => { console.log('Server is running') })