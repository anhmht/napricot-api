"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get createPaymentIntent () {
        return createPaymentIntent;
    },
    get handleWebhook () {
        return handleWebhook;
    }
});
const _stripe = /*#__PURE__*/ _interop_require_default(require("stripe"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const stripe = new _stripe.default(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
const calculateOrderAmount = (items)=>{
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    return 1099;
};
const createPaymentIntent = async (req, res, next)=>{
    const { items, confirmationTokenId } = req.body;
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
        });
        res.status(200).json({
            ...paymentIntent
        });
    } catch (error) {
        return next(error);
    }
};
const handleWebhook = async (req, res)=>{
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        if (!endpointSecret) {
            throw new Error('Stripe webhook endpoint secret is not set');
        }
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        return;
    }
    // Handle the event
    switch(event.type){
        case 'payment_intent.succeeded':
            {
                const paymentIntent = event.data.object;
                // Then define and call a method to handle the successful payment intent.
                // handlePaymentIntentSucceeded(paymentIntent);
                console.log(paymentIntent);
                break;
            }
        case 'payment_intent.payment_failed':
            {
                const paymentMethod = event.data.object;
                // Then define and call a method to handle the successful attachment of a PaymentMethod.
                // handlePaymentMethodAttached(paymentMethod);
                console.log(paymentMethod);
                break;
            // ... handle other event types
            }
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    // Return a response to acknowledge receipt of the event
    res.json({
        received: true
    });
};

//# sourceMappingURL=stripe.js.map