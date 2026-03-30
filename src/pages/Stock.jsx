import { useState, useEffect } from 'react'
import { stockApi } from '../services/api'

export default function Stock() {
  const [items, setItems]       = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [tab, setTab]           = useState('all')
  const [search, setSearch]     = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([stockApi.list(), stockApi.lowStock()])
      .then(([all, low]) => { setItems(all.data || []); setLowStock(low.data || []) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const base = tab === 'low' ? lowStock : items
  const displayed = search ? base.filter(i => i.product_name?.toLowerCase().includes(search.toLowerCase())) : base

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="search-bar">
        <input
          className="search-input"
          placeholder="Buscar produto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="btn btn-secondary" onClick={load}>↻ Atualizar</button>
      </div>
      <div className="filter-tabs">
        <button className={`btn ${tab === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('all')}>
          Todos ({items.length})
        </button>
        <button className={`btn ${tab === 'low' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('low')}>
          ⚠ Baixo estoque ({lowStock.length})
        </button>
      </div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            {tab === 'low' ? 'Produtos com Baixo Estoque' : 'Controle de Estoque — Lista geral'}
          </span>
        </div>
        {loading ? <div className="loading">Carregando...</div> : displayed.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">{tab === 'low' ? '✅' : '📦'}</div>
            <p>{tab === 'low' ? 'Todos os produtos estão dentro do nível mínimo' : 'Nenhum produto em estoque'}</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Produto</th><th>Quantidade atual</th><th>Estoque mínimo</th><th>Preço de venda</th><th>Status</th></tr>
            </thead>
            <tbody>
              {displayed.map(item => {
                const isLow = item.current_quantity <= item.minimum_stock
                return (
                  <tr key={item.stock_id}>
                    <td style={{ fontWeight: 600 }}>{item.product_name}</td>
                    <td style={{ color: isLow ? 'var(--danger)' : 'var(--primary)', fontWeight: 600 }}>
                      {item.current_quantity}
                    </td>
                    <td style={{ color: '#888' }}>{item.minimum_stock}</td>
                    <td>{item.sale_price ? `R$ ${parseFloat(item.sale_price).toFixed(2)}` : '—'}</td>
                    <td>
                      {isLow
                        ? <span className="badge badge-red">Baixo</span>
                        : <span className="badge badge-green">Normal</span>
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
