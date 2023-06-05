const twilio = require('twilio')
const { MessagingResponse } = require('twilio').twiml;

const db  = require('../services/db')
const generateNanoid  = require('../services/nanoid')

module.exports = async (req,res) => {

    const reqBody = req.body;
    const data = JSON.parse(req.body);
    console.log("🚀 ~ file: twilio-failed.js:10 ~ module.exports= ~ req.body:", data)

    return res.json({"status": 200, "from": "twilio-failed"});
}

