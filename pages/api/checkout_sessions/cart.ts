import { NextApiRequest, NextApiResponse } from 'next'

import Stripe from 'stripe'
// @ts-ignore
import { validateCartItems } from 'use-shopping-cart/utilities'

/*
 * Product data can be loaded from anywhere. In this case, we’re loading it from
 * a local JSON file, but this could also come from an async call to your
 * inventory management service, a database query, or some other API call.
 *
 * The important thing is that the product info is loaded from somewhere trusted
 * so you know the pricing information is accurate.
 */
import inventory from '../../../data/products'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: '2022-08-01',
})

function calculate_shipping(quantity: number, country: string) {
  // Calculate shipping cost based on quantity and country
  let shipping_cost = 0;
  if (country === 'GB') {
    if(quantity <= 21)
    {
      shipping_cost = 1.00;
    }
    else if (quantity >= 22 && quantity <= 55) {
      shipping_cost = 2.10;
    }
    else if(quantity > 55 && quantity <= 108)
    {
      shipping_cost = 2.65;
    }
    else if(quantity > 108 && quantity <= 159)
    {
      shipping_cost = 2.95;
    }
    else {
      shipping_cost = 3.75;
    }
  } else {
    if(quantity <= 21)
    {
      shipping_cost = 5.00;
    }
    else if (quantity >= 22 && quantity <= 55) {
      shipping_cost = 7.00;
    }
    else if(quantity > 55 && quantity <= 108)
    {
      shipping_cost = 9.00;
    }
    else if(quantity > 108 && quantity <= 159)
    {
      shipping_cost = 11.00;
    }
    else {
      shipping_cost = 13.00;
    }
  }
  return shipping_cost;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      // Validate the cart details that were sent from the client.
      const line_items = validateCartItems(inventory as any, req.body.cartDetails)

      // Calculate shipping cost based on quantity and country
      const shipping_cost = calculate_shipping(req.body.quantity, req.body.country)

      // Add a line item for the shipping cost
      line_items.push({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: 'Shipping',
          },
          unit_amount: shipping_cost * 100,
        },
        quantity: 1,
      })

      const hasSubscription = line_items.find((item: any) => {
        return !!item.price_data.recurring
      })
      // Create Checkout Sessions from body params.
      const params: Stripe.Checkout.SessionCreateParams = {
        submit_type: 'pay',
        payment_method_types: ['card'],
        billing_address_collection: 'auto',
        shipping_address_collection: {
          allowed_countries: [req.body.country],
        },
        line_items,
        success_url: `${req.headers.origin}/result?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/use-shopping-cart`,
        mode: hasSubscription ? 'subscription' : 'payment',
      }

      const checkoutSession: Stripe.Checkout.Session =
        await stripe.checkout.sessions.create(params)

      res.status(200).json(checkoutSession)
    } catch (err) {
      console.log(err)
      res.status(500).json({ statusCode: 500, message: (err as Error).message })
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}