const StripeClass = require("stripe");

const config = require('../config');

const db  = require('../services/db')

// create the customer
// then create the stripe checkout
// then redirect to stripe checkout

module.exports = async (req, res) => {
    const secretKey = config.stripe.secret_key;
    const webhookSecretKey = config.stripe.webhook_secret_key;

    const stripe = StripeClass(secretKey)

    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecretKey);
    }
    catch (err) {
        throw err
    }

    // Log incomming stripe webhook to database

    switch (event.type) {
        case 'customer.subscription.created':
            const customerSubscriptionCreated = event.data.object;
            await createCustomerSubscription(customerSubscriptionCreated);
            break;
        case 'customer.subscription.deleted':
            const customerSubscriptionDeleted = event.data.object;
            await deletedCustomerSubscription(customerSubscriptionDeleted);
            break;
        case 'customer.subscription.updated':
            const customerSubscriptionUpdated = event.data.object;
            await updateCustomerSubscription(customerSubscriptionUpdated);
            break;
        case 'checkout.session.completed':
            const checkoutSessionCompleted = event.data.object;
            await handleCompletedCheckout(checkoutSessionCompleted);
            break;
        default:
            throw new Error(`Unhandled stripe subscription event. ${event.type}`);
    }

    return res.send();
}

const createCustomerSubscription = async (eventData) => {
    if(eventData.object != 'subscription') throw new Error("Unknown event object from stripe");
    
    const user = await db('users').where('stripe_customer_id', eventData.customer).first();
    if(!user) return

    const subscriptionObj = {
        'user_id': user.id,
        'price_id': eventData.items.data[0].price.id,
        'status': eventData.status,
        'currency': eventData.currency,
        'interval': 'monthly',
        'subscription_start_date': new Date(eventData.start_date * 1000),
        'subscription_trial_start_date': new Date(eventData.trial_start * 1000),
        'subscription_trial_end_date': new Date(eventData.trial_end * 1000),
        'subscription_status': eventData.status,
    }

    await db('subscriptions').insert(subscriptionObj);
}
const updateCustomerSubscription = async (eventData) => {
    if(eventData.object != 'subscription') throw new Error("Unknown event object from stripe");
    
    const user = await db('users').where('stripe_customer_id', eventData.customer).first();
    if(!user) return

    const subscriptionObj = {
        'user_id': user.id,
        'price_id': eventData.items.data[0].price.id,
        'status': eventData.status,
        'currency': eventData.currency,
        'interval': 'monthly',
        'subscription_start_date': new Date(eventData.start_date * 1000),
        'subscription_trial_start_date': new Date(eventData.trial_start * 1000),
        'subscription_trial_end_date': new Date(eventData.trial_end * 1000),
        'subscription_status': eventData.status,
    }

    await db('subscriptions').where({
        'user_id': user.id
    }).update(subscriptionObj);
}
const deletedCustomerSubscription = async (eventData) => {
    if(eventData.object != 'subscription') throw new Error("Unknown event object from stripe");
    
    const user = await db('users').where('stripe_customer_id', eventData.customer).first();
    if(!user) return

    await db('subscriptions').where({
        'user_id': user.id
    }).del();
}
const handleCompletedCheckout = async (eventData) => {
    // console.log({ eventData })
    // get the customer from the customer id
    // update the subscription in database
}