const express = require('express');
const product = require('./product');
const wishlist = require('./wishlist');
const user = require('./user');
const router = express.Router();
const { addRequestId } = require('./middleware')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json());
app.use(addRequestId)


// const options = {
//     origin: "*",
//     methods: "GET,PUT,PATCH,POST,DELETE",
//     preflightContinue: false,
//     optionsSuccessStatus: 204,
//   };
//   app.use(cors(options));
//   //application level middleware
//   app.use((req, res, next) => {
//     req.headers["request_id"] = uuid();
//     next();
//   });

app.use('/', product)
app.use('/', wishlist);
app.use('/',user)


app.listen(3001, () => { console.log('Server is running') })