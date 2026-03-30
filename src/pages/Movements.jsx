import { useState, useEffect } from 'react'
import { movementsApi, productsApi } from '../services/api'
import Modal from '../components/Modal'

export default function Movements() {
  const [items, setItems]       = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState({ product_id: '', movement_type: 'entry', quantity: '', observation: '' })
  const [saving, setSaving]     = useState(false)
  const [filter, setFilter]     = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([movementsApi.list(), productsApi.list()])
      .then(([m, p]) => { setItems(m.data || []); setProducts(p.data || []) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!form.product_id || !form.quantity || parseInt(form.quantity) <= 0) {
      setError('Preencha produto e quantidade'); return
    }
    setSaving(true); setError('')
    try {
      await movementsApi.create({ ...form, product_id: parseInt(form.product_id), quantity: parseInt(form.quantity) })
      setModal(false)
      setForm({ product_id: '', movement_type: 'entry', quantity: '', observation: '' })
      setSuccess('Movimentação registrada com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
      load()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))
  const displayed = filter ? items.filter(i => i.movement_type === filter) : items

  return (
    <div>
      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="filter-tabs">
        <button className={`btn ${filter === '' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('')}>Todos</button>
        <button className={`btn ${filter === 'entry' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('entry')}>Entradas</button>
        <button className={`btn ${filter === 'exit' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('exit')}>Saídas</button>
        <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => { setError(''); setModal(true) }}>
          + Registrar movimentação
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Histórico de Movimentações ({displayed.length})</span>
        </div>
        {loading ? <div className="loading">Carregando...</div> : displayed.length === 0 ? (
          <div className="empty"><div className="empty-icon">↕️</div><p>Nenhuma movimentação encontrada</p></div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Produto</th><th>Tipo</th><th>Quantidade</th><th>Data</th><th>Responsável</th><th>Observação</th></tr>
            </thead>
            <tbody>
              {displayed.map(item => (
                <tr key={item.movement_id}>
                  <td style={{ fontWeight: 600 }}>{item.product_name}</td>
                  <td>
                    <span className={`badge ${item.movement_type === 'entry' ? 'badge-green' : 'badge-red'}`}>
                      {item.movement_type === 'entry' ? '↑ Entrada' : '↓ Saída'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{item.quantity}</td>
                  <td style={{ color: '#888', fontSize: 12 }}>
                    {new Date(item.movement_date).toLocaleString('pt-BR')}
                  </td>
                  <td style={{ color: '#888' }}>{item.responsible_name || '—'}</td>
                  <td style={{ color: '#888' }}>{item.observation || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal
          title="Registrar movimentação"
          onClose={() => setModal(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Registrar'}</button>
          </>}
        >
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Produto *</label>
            <select className="form-select" value={form.product_id} onChange={set('product_id')} autoFocus>
              <option value="">Selecionar produto...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tipo *</label>
              <select className="form-select" value={form.movement_type} onChange={set('movement_type')}>
                <option value="entry">Entrada</option>
                <option value="exit">Saída</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantidade *</label>
              <input className="form-input" type="number" min="1" value={form.quantity} onChange={set('quantity')} placeholder="0" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Observação</label>
            <input className="form-input" value={form.observation} onChange={set('observation')} placeholder="Ex: Venda, reposição, ajuste..." />
          </div>
        </Modal>
      )}
    </div>
  )
}
