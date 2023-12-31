import { NextPage } from 'next'
import Link from 'next/link'
import Layout from '../components/Layout'

const IndexPage: NextPage = () => {
  return (
    <Layout title="Home | Next.js + TypeScript Example">
      <ul className="card-list">
        <li>
          <Link
            href="/use-shopping-cart"
            className="card cart-style-background"
          >
            <h2 className="bottom">Use Shopping Cart</h2>
            <img src="/use-shopping-cart.png" />
          </Link>
        </li>
      </ul>
    </Layout>
  )
}

export default IndexPage
