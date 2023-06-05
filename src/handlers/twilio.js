const twilio = require('twilio')
const { MessagingResponse } = require('twilio').twiml;

module.exports = async (req,res) => {

    // Get the number
    // Check if he have active or trial subscription
    // if not return response message
    // if yes, create a link
    // send the link to the customer
    
    const twiml = new MessagingResponse();

    const reqBody = req.body;

    const message = twiml.message();
    if(reqBody && Object.keys(reqBody).length > 0)
        message.body(`Hello 🤗🤗 from ${reqBody.From}. I'm ${reqBody.To}. I have recieved your message: ${reqBody.Body}. See ya soon. Bye 👋👋👋`);  
    else
        message.body(`Hello 🤗🤗. See ya soon. Bye 👋👋👋`);  
    
    res.type('text/xml').send(twiml.toString());
}

