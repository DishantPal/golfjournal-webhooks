const express = require('express');

const {chatbotHandler,stripeHandler,twilioHandler} = require('./handlers');

const router = express.Router();

router.get('/ping', (req,res) => res.json({"status": 200}));

router.use(express.raw()).post('/webhook/stripe', stripeHandler);
router.use(express.urlencoded({extended: false})).post('/webhook/twilio', twilioHandler);
router.use(express.json()).post('/webhook/chatbot', chatbotHandler);

module.exports = router;