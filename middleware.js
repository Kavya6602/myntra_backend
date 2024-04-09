const express = require('express');
const uuid = require('uuid')

const generateUUID = () => {
  return uuid.v4();
};

const addRequestId = (req, res, next) => {
  req.headers["request_id"] = generateUUID();
  next();
};

const logRequest = (req,res,next) => {
    console.log(`[${new Date().toISOString()}]  Method: ${req.method}, URL: ${req.url}`);
    next(); 
}

const validateQueryParams = (req,res,next) => {
    const { limit, offset } = req.query;
    if (!limit || !offset || limit < 0 || offset < 0) {
      return res.status(400).send({ message: 'Invalid limit or offset values' });
    }
    next();
}

module.exports = { addRequestId, logRequest,validateQueryParams}