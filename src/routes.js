const express = require('express');
const asyncHanlder = require('express-async-handler');

const { chatbotHandler, stripeHandler, twilioHandler, twilioFailedHandler } = require('./handlers');

const router = express.Router();

router.get('/ping', (req, res) => res.json({ "status": 200 }));
router.get('/ping-aerr', asyncHanlder(async () => {
    throw new Error('Async Hello');
}));
router.get('/ping-err', () => {
    throw new Error('Hello');
});

router
    .use(express.raw({ type: 'application/json' }))
    .post('/webhook/stripe', asyncHanlder(stripeHandler));

router
    .use(express.urlencoded({ extended: false }))
    .post('/webhook/twilio', asyncHanlder(twilioHandler));

router
    .use(express.urlencoded({ extended: false }))
    .post('/webhook/twilio-failed', asyncHanlder(twilioFailedHandler));

router
    .use(express.json())
    .post('/webhook/chatbot', asyncHanlder(chatbotHandler));


module.exports = router;