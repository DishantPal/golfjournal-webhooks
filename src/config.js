const dotenv = require('dotenv')
dotenv.config();

module.exports = {
    app: {
        port: process.env.PORT,
        env: process.env.NODE_ENV,
        name: process.env.APP_NAME,
        log_location: "../logs/app.log"
    },
    db: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    },
    twilio: {
        account_sid: process.env.TWILIO_ACCOUNT_SID,
        auth_token: process.env.TWILIO_AUTH_TOKEN,
        phone_no: process.env.TWILIO_PHONE_NO,
        message_template: "",
    },
    stripe: {
        secret_key: process.env.STRIPE_SECRET_KEY,
        webhook_secret_key: process.env.STRIPE_WEBHOOK_SECRET_KEY
    },
    chatbot: {
        webhook_secret: process.env.CHATBOT_WEBHOOK_SECRET
    },
}