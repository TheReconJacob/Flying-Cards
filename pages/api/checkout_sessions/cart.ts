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

function calculate_shipping(quantity: number) {
  // Calculate shipping cost based on quantity
  let shipping_cost = 0;
  if(quantity <= 21)
  {
    shipping_cost = 100;
  }
  if (quantity > 22 && quantity <= 55) {
    shipping_cost = 210;
  }
  else if(quantity > 55 && quantity <= 108)
  {
    shipping_cost = 265;
  }
  else if(quantity > 108 && quantity < 159)
  {
    shipping_cost = 295;
  }
  else {
    shipping_cost = 375;
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
      // Validate the cart details that were sent from the client.
      const line_items = validateCartItems(inventory as any, req.body)

      // Add a line item for the shipping cost
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
          },
          unit_amount: calculate_shipping(req.body.quantity) * 100,
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
          allowed_countries: [ 'GB', "CA", "AE", "IL", "SB", "AF", "IN", "SC", "AG", "IQ", "AO", "JM", "SG", "SH", "AR", "JO", "SI", "AU", "JP", "SL", "AW", "KE", "SN", "MX", "AZ", "KG", "SO", "BB", "KH", "SR", "BD", "KI", "ST", "BF", "KM", "SV", "BH", "KN", "SX", "BI", "KR", "TC","BJ","KW","TD", 'AD', 'BM', 'KY', 'TG', 'AI', 'BN', 'KZ', 'TH', 'AL', 'BO', 'LB', 'TJ', 'AM', 'BQ', 'LC', 'TL', 'AT', 'BR', 'LK', 'TM', 'BA', 'BS', 'LR', 'TN', 'BE', 'BT', 'LS', 'TO','BG','BW','LY','TR','BY','BZ', 'MA','TT','CH','CD','MG','TV','CY','CF','ML','TW','CZ','CG','MM', 'TZ','DE','CI','MN','UG','DK','CL','MO','UY','EE','CM','MQ', 'UZ','ES','CN','MR','VC','FI','CO','MS','VE','FO', 'CR','MU','VG','FR','CV','MV', 'VN','CW' ,'MW' ,'VU' ,'GI' ,'DJ' ,'MY' ,'WF' ,'GL' ,'DM' , 'MZ' ,'WS' ,'GR' ,'DO' ,'NA' ,'YE' ,'HR' ,'DZ' ,'NC' ,'ZA' , 'HU' ,'EC' ,'NE' ,'ZM' ,'IE' ,'EG' ,'NG' ,'ZW' , 'IS' ,'ER' ,'NI' ,  'IT' ,  'ET' ,  'NP', 'LI',  'FJ',  'NR', 'LT',  'FK',  'NZ', 'LU',  'GA',  'OM', 'LV',  'GD',  'PA', 'MD',  'GE',  'PE', 'ME',  'GF',  'PF', 'MK',  'GH',  'PG', 'MT',  'GM',  'PH', 'NL',  'GN', 'PK', 'NO', 'GP', 'PM', 'PL', 'GQ', 'PN', 'PT', 'GT', 'PY', 'RO', 'GW', 'QA', 'SE', 'GY', 'RE', 'SI', 'HK', 'RS', 'SK', 'HN', 'RU', 'SM', 'HT', 'RW', 'VA', 'ID', 'SA' ],
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
      const errorMessage =
        err instanceof Error ? err.message : 'Internal server error'
      res.status(500).json({ statusCode: 500, message: errorMessage })
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}
