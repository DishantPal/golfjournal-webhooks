const dotenv = require('dotenv')
dotenv.config();

module.exports = {
    app: {
        port: process.env.PORT,
        env: process.env.NODE_ENV,
        name: process.env.APP_NAME,
        journal_dashboard_url: process.env.JOURNAL_DASHBOARD_URL,
        log_location: "../logs/app.log"
    },
    messages: {
        user_notfound: `We do not recognize you in our system. If you have an account, please confirm your number in your account settings. If not, please sign up for one here: ${process.env.JOURNAL_DASHBOARD_URL}`,
        user_subscription_notfound: `User subscription not found.`,
        message_key_invaild: `SMS "PLAY" to get journal entry link.`,
        journal_entry_message: `Here's your link to make entry: ${process.env.CHATBOT_ENTRY_LINK}`,

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