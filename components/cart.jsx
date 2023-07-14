import CheckoutButton from './CheckoutButton';

export default function Cart({ cartItems }) {
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
      <CheckoutButton cartItems={cartItems} />
    </div>
  );
}