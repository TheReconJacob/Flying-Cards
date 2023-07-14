import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Cart({ cartItems, onCheckout }) {
  return (
    <div>
      <h2>Cart</h2>
      <ul>
        {cartItems.map((item) => (
          <li key={item.id}>
            {item.id} - Quantity: {item.quantity}
          </li>
        ))}
      </ul>
      <button onClick={onCheckout} disabled={cartItems.length === 0}>
        Checkout
      </button>
    </div>
  );
}