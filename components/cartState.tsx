import { useState } from 'react'

export const useCartState = () => {
  const [cartCount, setCartCount] = useState(0)

  return { cartCount, setCartCount }
}