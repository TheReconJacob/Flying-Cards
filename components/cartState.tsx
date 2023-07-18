import { useState, useEffect } from 'react'
import { db } from '../src/firebase'
import { ref, onValue, set } from 'firebase/database'

type CartState = {
  [productId: string]: number
}

type StockState = {
  [productId: string]: number
}

export const useCartState = () => {
  const [cartState, setCartState] = useState<CartState>({})
  const [stockState, setStockState] = useState<StockState>({})

  useEffect(() => {
    // Get the cart state from the database when the component mounts
    const cartStateRef = ref(db, 'cartState')
    onValue(cartStateRef, (snapshot) => {
      const state = snapshot.val()
      if (state) {
        setCartState(state)
      }
    })

    // Get the stock state from the database when the component mounts
    const stockStateRef = ref(db, 'stockState')
    onValue(stockStateRef, (snapshot) => {
      const state = snapshot.val()
      if (state) {
        setStockState(state)
      }
    })
  }, [])

  const updateCartState = (productId: string, quantity: number) => {
    // Check if the requested quantity is available in stock
    const availableQuantity = stockState[productId] || 0
    if (quantity > availableQuantity) {
      alert('The requested quantity is not available in stock')
      return
    }

    // Update the cart state in the database
    set(ref(db, `cartState/${productId}`), quantity)
    setCartState((prevState) => ({
      ...prevState,
      [productId]: quantity,
    }))
  }

  return { cartState, stockState, setCartState: updateCartState }
}
