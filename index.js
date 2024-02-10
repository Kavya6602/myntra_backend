const express = require('express');
const product = require('./product');
const wishlist = require('./wishlist');
const user = require('./user');
const router = express.Router();

const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json());

app.use('/v1/products', product)
app.use('/v1/wishlists', wishlist);
app.use('/v1/users',user)


app.listen(3001, () => { console.log('Server is running') })