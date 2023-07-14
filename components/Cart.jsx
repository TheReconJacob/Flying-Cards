import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);

export default function Cart({ cartItems }) {
  const handleCheckout = async () => {
    const stripe = await stripePromise;
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ cartItems })
    });
    const session = await response.json();
    const result = await stripe.redirectToCheckout({
      sessionId: session.id
    });
    if (result.error) {
      console.error(result.error.message);
    }
  };

  return (
    <div>
      {/* Display cart items here */}
      <button onClick={handleCheckout}>Checkout</button>
    </div>
  );
}