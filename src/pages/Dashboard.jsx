import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { stockApi, movementsApi, productsApi } from '../services/api'

export default function Dashboard() {
  const [stock, setStock]         = useState([])
  const [lowStock, setLowStock]   = useState([])
  const [movements, setMovements] = useState([])
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      stockApi.list(),
      stockApi.lowStock(),
      movementsApi.list(),
      productsApi.list(),
    ]).then(([s, l, m, p]) => {
      setStock(s.data || [])
      setLowStock(l.data || [])
      setMovements(m.data || [])
      setProducts(p.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Carregando...</div>

  const exitMovements = movements.filter(m => m.movement_type === 'exit')
  const soldMap = {}
  exitMovements.forEach(m => {
    soldMap[m.product_name] = (soldMap[m.product_name] || 0) + m.quantity
  })
  const sorted = Object.entries(soldMap).sort((a, b) => b[1] - a[1])
  const mostSold  = sorted[0]?.[0] || (products[0]?.name || '—')
  const leastSold = sorted[sorted.length - 1]?.[0] || (products[products.length - 1]?.name || '—')
  const recentMoves = movements.slice(0, 5)

  return (
    <div>
      <div className="dashboard-graph-container">
        <iframe 
          src="http://localhost:8050/" 
          style={{
            width: '100%',
            height: '700px',
            border: 'none',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow)'
          }}
          title="Gráfico de Vendas"
        />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-left">
          <div className="info-card">
            <div className="info-card-header">
              <div className="info-card-icon">
                <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
              </div>
              <span className="info-card-label">Quantidade total de produtos</span>
            </div>
            <div className="info-card-value">{products.length} produtos cadastrados</div>
          </div>

          <div className="info-card">
            <div className="info-card-header">
              <div className="info-card-icon">
                <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
              </div>
              <span className="info-card-label">Produtos com estoque baixo</span>
            </div>
            <div className="info-card-value">
              {lowStock.length < 10 ? `0${lowStock.length}` : lowStock.length} produtos com Baixo estoque
            </div>
          </div>
        </div>

        <div className="dashboard-right">
          <button className="action-btn" onClick={() => navigate('/products')}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Buscar produto
          </button>
          <button className="action-btn" onClick={() => navigate('/products')}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Adicionar produtos
          </button>
        </div>

        <div className="dashboard-bottom">
          <div className="bottom-card">
            <div className="bottom-card-header">
              <div className="info-card-icon">
                <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="6"/>
                  <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                </svg>
              </div>
              <span className="bottom-card-label">Produtos mais vendidos e menos vendidos</span>
            </div>
            <div className="ranking-item">
              <svg width="18" height="18" fill="none" stroke="#00e676" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="12" y1="19" x2="12" y2="5"/>
                <polyline points="5 12 12 5 19 12"/>
              </svg>
              {mostSold}
            </div>
            <div className="ranking-item">
              <svg width="18" height="18" fill="none" stroke="#ef5350" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <polyline points="19 12 12 19 5 12"/>
              </svg>
              {leastSold}
            </div>
          </div>

          <div className="bottom-card">
            <div className="bottom-card-header">
              <div className="info-card-icon">
                <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <span className="bottom-card-label">Ultimas movimentações</span>
            </div>
            {recentMoves.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Nenhuma movimentação</div>
            ) : (
              recentMoves.map((m, i) => (
                <span key={i} className="move-tag">
                  {m.product_name} {m.movement_type === 'entry' ? `+${m.quantity} (entrada)` : `-${m.quantity} (saída)`}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
