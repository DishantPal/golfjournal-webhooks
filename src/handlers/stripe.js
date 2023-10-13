const StripeClass = require('stripe')

const config = require('../config')

const db = require('../services/db')

module.exports = async (req, res) => {
  const reqBody = JSON.parse(req.body)
  const webhookObj = {
    event_id: reqBody?.id,
    payload: reqBody
  }
  try {
    // Idempotent check
    const webhookInDb = await db('stripe_webhooks')
      .where('event_id', webhookObj?.event_id)
      .where('status', 'success')
      .first()
    if (!!webhookInDb) {
      return res.json({
        status: 200,
        message: `webhook processed already with id ${webhookObj.event_id}`
      })
    }
    await db('stripe_webhooks').insert({ ...webhookObj })

    const secretKey = config.stripe.secret_key
    const webhookSecretKey = config.stripe.webhook_secret_key

    const stripe = StripeClass(secretKey)

    const sig = req.headers['stripe-signature']

    let event

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecretKey)
    } catch (err) {
      throw err
    }

    // Log incomming stripe webhook to database

    switch (event.type) {
      case 'customer.subscription.created':
        const customerSubscriptionCreated = event.data.object
        await createCustomerSubscription(customerSubscriptionCreated)
        break
      case 'customer.subscription.deleted':
        const customerSubscriptionDeleted = event.data.object
        await updateCustomerSubscription(customerSubscriptionDeleted)
        break
      case 'customer.subscription.updated':
        const customerSubscriptionUpdated = event.data.object
        await updateCustomerSubscription(customerSubscriptionUpdated)
        break
      default:
        throw new Error(`Unhandled stripe subscription event. ${event.type}`)
    }

    await db('stripe_webhooks')
      .where('event_id', webhookObj.event_id)
      .update({ status: 'success' })
    return res.send()
  } catch (error) {
    console.log('🚀 ~ file: stripe.js:64 ~ module.exports= ~ error:', error)
    await db('stripe_webhooks')
      .where('event_id', webhookObj.event_id)
      .update({ status: 'failed' })
    throw error
  }
}

const createCustomerSubscription = async eventData => {
  if (eventData.object != 'subscription')
    throw new Error('Unknown event object from stripe')

  const user = await db('users')
    .where('stripe_customer_id', eventData.customer)
    .first()
  if (!user) return

  // const subscriptionObj = {
  //     'user_id': user.id,
  //     'price_id': eventData.items.data[0].price.id,
  //     'status': eventData.status,
  //     'currency': eventData.currency,
  //     'interval': 'monthly',
  //     'subscription_start_date': new Date(eventData.start_date * 1000),
  //     'subscription_trial_start_date': new Date(eventData.trial_start * 1000),
  //     'subscription_trial_end_date': new Date(eventData.trial_end * 1000),
  //     'subscription_status': eventData.status,
  // }
  const subscriptionObj = {
    user_id: user.id,
    subscription_id: eventData.id,
    subscription_customer_id: eventData.customer,
    subscription_status: eventData.status,
    subscription_currency: eventData.currency,
    subscription_current_period_end: eventData.current_period_end
      ? new Date(eventData.current_period_end * 1000)
      : null,
    subscription_current_period_start: eventData.current_period_start
      ? new Date(eventData.current_period_start * 1000)
      : null,
    subscription_billing_cycle_anchor: eventData.billing_cycle_anchor
      ? new Date(eventData.billing_cycle_anchor * 1000)
      : null,
    subscription_canceled_at: eventData.canceled_at
      ? new Date(eventData.canceled_at * 1000)
      : null,
    subscription_created: eventData.created
      ? new Date(eventData.created_at * 1000)
      : null,
    subscription_discount: null,
    subscription_ended_at: eventData.ended_at
      ? new Date(eventData.ended_at * 1000)
      : null,
    subscription_start_date: eventData.start_date
      ? new Date(eventData.start_date * 1000)
      : null,
    subscription_test_clock: eventData.test_clock,
    subscription_trial_end: eventData.trial_end
      ? new Date(eventData.trial_end * 1000)
      : null,
    subscription_trial_start: eventData.trial_start
      ? new Date(eventData.trial_start * 1000)
      : null,
    subscription_price_amount: eventData.items.data[0].price
      ? eventData.items.data[0].price.unit_amount / 100
      : null,
    subscription_discount_amount:
      eventData.discount != null
        ? eventData.discount?.coupon.amount_off
          ? eventData.discount?.coupon.amount_off / 100
          : eventData.items.data[0].price.unit_amount / 100 -
            (eventData.items.data[0].price.unit_amount / 100) *
              (eventData.discount?.coupon.percent_off / 100)
        : null
  }

  await db('subscriptions').insert(subscriptionObj)
}
const updateCustomerSubscription = async eventData => {
  try {
    if (eventData.object != 'subscription')
      throw new Error('Unknown event object from stripe')

    const user = await db('users')
      .where('stripe_customer_id', eventData.customer)
      .first()
    if (!user) return

    // const subscriptionObj = {
    //     'user_id': user.id,
    //     'price_id': eventData.items.data[0].price.id,
    //     'status': eventData.status,
    //     'currency': eventData.currency,
    //     'interval': 'monthly',
    //     'subscription_start_date': new Date(eventData.start_date * 1000),
    //     'subscription_trial_start_date': new Date(eventData.trial_start * 1000),
    //     'subscription_trial_end_date': new Date(eventData.trial_end * 1000),
    //     'subscription_status': eventData.status,
    // }

    const subscriptionObj = {
      user_id: user.id,
      subscription_id: eventData.id,
      subscription_customer_id: eventData.customer,
      subscription_status: eventData.status,
      subscription_currency: eventData.currency,
      subscription_current_period_end: eventData.current_period_end
        ? new Date(eventData.current_period_end * 1000)
        : null,
      subscription_current_period_start: eventData.current_period_start
        ? new Date(eventData.current_period_start * 1000)
        : null,
      subscription_billing_cycle_anchor: eventData.billing_cycle_anchor
        ? new Date(eventData.billing_cycle_anchor * 1000)
        : null,
      subscription_canceled_at: eventData.canceled_at
        ? new Date(eventData.canceled_at * 1000)
        : null,
      subscription_created: eventData.created
        ? new Date(eventData.created_at * 1000)
        : null,
      subscription_discount: null,
      subscription_ended_at: eventData.ended_at
        ? new Date(eventData.ended_at * 1000)
        : null,
      subscription_start_date: eventData.start_date
        ? new Date(eventData.start_date * 1000)
        : null,
      subscription_test_clock: eventData.test_clock,
      subscription_trial_end: eventData.trial_end
        ? new Date(eventData.trial_end * 1000)
        : null,
      subscription_trial_start: eventData.trial_start
        ? new Date(eventData.trial_start * 1000)
        : null,
      // 'subscription_trial_start_date': new Date(eventData.trial_start * 1000),
      // 'subscription_trial_end_date': new Date(eventData.trial_end * 1000),
      subscription_price_amount: eventData.items.data[0].price
        ? eventData.items.data[0].price.unit_amount / 100
        : null,
      subscription_discount_amount:
        eventData.discount != null
          ? eventData.discount?.coupon.amount_off
            ? eventData.discount?.coupon.amount_off / 100
            : eventData.items.data[0].price.unit_amount / 100 -
              (eventData.items.data[0].price.unit_amount / 100) *
                (eventData.discount?.coupon.percent_off / 100)
          : null,
      updated_at: new Date()
    }

    await db('subscriptions')
      .where({
        user_id: user.id,
        subscription_id: subscriptionObj.subscription_id
      })
      .update(subscriptionObj)
  } catch (error) {
    console.log('error in UpdateSubscription', error)
  }
}
// const deletedCustomerSubscription = async (eventData) => {
//     if(eventData.object != 'subscription') throw new Error("Unknown event object from stripe");

//     const user = await db('users').where('stripe_customer_id', eventData.customer).first();
//     if(!user) return

//     await db('subscriptions').where({
//         'user_id': user.id
//     }).del();
// }
const handleCompletedCheckout = async eventData => {
  // console.log({ eventData })
  // get the customer from the customer id
  // update the subscription in database
}
