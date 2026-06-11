import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard  from './pages/Dashboard'
import Stock      from './pages/Stock'
import Movements  from './pages/Movements'
import Entries    from './pages/Entries'
import Products   from './pages/Products'
import Categories from './pages/Categories'
import Suppliers  from './pages/Suppliers'
import Error      from './pages/Error'

export default function App() {
  const location = useLocation()
  const isErrorPage = location.pathname === '/error'

  return isErrorPage ? (
    <Error />
  ) : (
    <Layout>
      <Routes>
        <Route path="/"           element={<Dashboard />} />
        <Route path="/dashboard"  element={<Dashboard />} />
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
