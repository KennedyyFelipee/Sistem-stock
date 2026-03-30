import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard  from './pages/Dashboard'
import Stock      from './pages/Stock'
import Movements  from './pages/Movements'
import Entries    from './pages/Entries'
import Products   from './pages/Products'
import Categories from './pages/Categories'
import Suppliers  from './pages/Suppliers'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/"           element={<Dashboard />} />
        <Route path="/stock"      element={<Stock />} />
        <Route path="/movements"  element={<Movements />} />
        <Route path="/entries"    element={<Entries />} />
        <Route path="/products"   element={<Products />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/suppliers"  element={<Suppliers />} />
      </Routes>
    </Layout>
  )
}
