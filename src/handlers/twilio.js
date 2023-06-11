const twilio = require('twilio')
const { MessagingResponse } = require('twilio').twiml

const db = require('../services/db')
const generateNanoid = require('../services/nanoid')

module.exports = async (req, res) => {
  const reqBody = req.body

  const twiml = new MessagingResponse()
  const message = twiml.message()

  const userPhoneInDB = reqBody.From?.replace(/\D/g, '').slice(-10)

  const user = await db('users').where('phone_number', userPhoneInDB).first()
  if (!user) {
    message.body(`User doesn't exists.`)
    return res.type('text/xml').send(twiml.toString())
  }

  const userSubscription = await db('subscriptions')
    .where({
      user_id: user.id
    })
    .first()

  if (!userSubscription) {
    message.body(`User subscription doesn't exists.`)
    return res.type('text/xml').send(twiml.toString())
  }

  if (reqBody.Body.toLowerCase() !== 'journal') {
    message.body(`SMS "JOURNAL" to get journal entry link`)
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

  db('links').insert(link)

  const messageBody = `Here's your link to make entry: https://journal.thetournamentcode.com/link/${link.code}`

  message.body(messageBody)
  return res.type('text/xml').send(twiml.toString())
}
