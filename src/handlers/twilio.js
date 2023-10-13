const twilio = require('twilio')
const { MessagingResponse } = require('twilio').twiml

const db = require('../services/db')
const generateNanoid = require('../services/nanoid')

const config = require('../config')

module.exports = async (req, res) => {
  const reqBody = req.body
  const webhookObj = {
    event_id: reqBody?.MessageSid,
    payload: reqBody
  }
  try {
    // Idempotent check
    const webhookInDb = await db('twilio_webhooks')
      .where('event_id', webhookObj?.event_id)
      .where('status', 'success')
      .first()
    if (!!webhookInDb) {
      return res.json({
        status: 200,
        message: `webhook processed already with id ${webhookObj.event_id}`
      })
    }
    await db('twilio_webhooks').insert({ ...webhookObj })

    const twiml = new MessagingResponse()
    const message = twiml.message()

    const userPhoneInDB = reqBody.From
    console.log("🚀 ~ file: twilio.js:33 ~ module.exports= ~ userPhoneInDB:", userPhoneInDB)

    const user = await db('users').where('phone_number', userPhoneInDB).first()
    if (!user) {
      message.body(
        config.messages.user_notfound
      )
      await db('twilio_webhooks')
        .where('event_id', webhookObj.event_id)
        .update({ status: 'success' })
      return res.type('text/xml').send(twiml.toString())
    }

    const userSubscription = await db('subscriptions')
      .where({
        user_id: user.id
      })
      .first()

    if (!userSubscription) {
      message.body(config.messages.user_subscription_notfound)
      await db('twilio_webhooks')
        .where('event_id', webhookObj.event_id)
        .update({ status: 'success' })
      return res.type('text/xml').send(twiml.toString())
    }

    if (reqBody.Body.toLowerCase() !== 'play') {
      message.body(config.messages.message_key_invaild)
      await db('twilio_webhooks')
        .where('event_id', webhookObj.event_id)
        .update({ status: 'success' })
      return res.type('text/xml').send(twiml.toString())
    }


    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + 1)

    const link = {
      user_id: user.id,
      code: generateNanoid(6),
      access_token: generateNanoid(16),
      expires_at: expirationDate,
      created_at: new Date()
    }
    await db('links').insert(link)

    const messageBody = config.messages.journal_entry_message.replace('#LINK_CODE',link.code);
    message.body(messageBody)

    await db('twilio_webhooks')
      .where('event_id', webhookObj.event_id)
      .update({ status: 'success' })

    return res.type('text/xml').send(twiml.toString())
  } catch (error) {
    console.log('🚀 ~ file: twilio.js:69 ~ module.exports= ~ error:', error)
    await db('twilio_webhooks')
      .where('event_id', webhookObj.event_id)
      .update({ status: 'failed' })
    throw error
  }
}
