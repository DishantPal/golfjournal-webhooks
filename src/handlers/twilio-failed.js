const twilio = require('twilio')
const { MessagingResponse } = require('twilio').twiml;

const db  = require('../services/db')
const generateNanoid  = require('../services/nanoid')

module.exports = async (req,res) => {

    const reqBody = req.body;

    const webhookObj = {
        event_id: reqBody?.MessageSid,
        payload: reqBody,
    }
    await db('twilio_webhooks').insert({...webhookObj, status: 'failed'});

    return res.json({"status": 200, "message": `failed webhook recoreded with id ${webhookObj.event_id}`});
}

