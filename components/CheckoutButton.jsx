import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutButton({ cartItems }) {
  const handleCheckout = async () => {
    const stripe = await stripePromise;

    if (!stripe) {
      return;
    }

    // Create a new checkout session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cartItems }),
    });

    const session = await response.json();

    // Redirect to the checkout page
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      console.error(result.error.message);
    }
  };

  return (
    <button onClick={handleCheckout} disabled={cartItems.length === 0}>
      Checkout
    </button>
  );
}