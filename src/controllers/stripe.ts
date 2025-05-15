import { Request, Response, NextFunction } from 'express'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET

interface PaymentItem {
  id: string
  amount: number
}

const calculateOrderAmount = (items: PaymentItem[]): number => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1099
}

const createPaymentIntent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { items, confirmationTokenId } = req.body

  try {
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      confirm: true,
      amount: calculateOrderAmount(items),
      currency: 'usd',
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true
      },
      confirmation_token: confirmationTokenId,
      return_url: 'http://localhost:3000/checkout/123/success'
    })

    res.status(200).json({
      ...paymentIntent
    })
  } catch (error) {
    return next(error)
  }
}

const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string

  let event

  try {
    if (!endpointSecret) {
      throw new Error('Stripe webhook endpoint secret is not set')
    }

    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  } catch (err) {
    res
      .status(400)
      .send(
        `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    return
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      console.log(paymentIntent)
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentMethod = event.data.object
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      console.log(paymentMethod)
      break
      // ... handle other event types
    }

    default:
      console.log(`Unhandled event type ${event.type}`)
  }
  // Return a response to acknowledge receipt of the event
  res.json({ received: true })
}

export { createPaymentIntent, handleWebhook }
