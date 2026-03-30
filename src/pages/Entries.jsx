import { useState, useEffect } from 'react'
import { entriesApi, suppliersApi, productsApi } from '../services/api'
import Modal from '../components/Modal'

const emptyItem = { product_id: '', quantity: '', unit_price: '' }

export default function Entries() {
  const [items, setItems]       = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [modal, setModal]       = useState(null) 
  const [viewing, setViewing]   = useState(null)
  const [form, setForm]         = useState({ supplier_id: '', items: [{ ...emptyItem }] })
  const [saving, setSaving]     = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([entriesApi.list(), suppliersApi.list(), productsApi.list()])
      .then(([e, s, p]) => { setItems(e.data || []); setSuppliers(s.data || []); setProducts(p.data || []) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openView = async (entry) => {
    try {
      const r = await entriesApi.find(entry.entry_id)
      setViewing(r.data)
      setModal('view')
    } catch (e) { setError(e.message) }
  }

  const addItem    = () => setForm(f => ({ ...f, items: [...f.items, { ...emptyItem }] }))
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))
  const setItem    = (i, field) => (e) => setForm(f => {
    const items = [...f.items]
    items[i] = { ...items[i], [field]: e.target.value }
    return { ...f, items }
  })

  const total = form.items.reduce((sum, item) => {
    const q = parseFloat(item.quantity) || 0
    const p = parseFloat(item.unit_price) || 0
    return sum + q * p
  }, 0)

  const handleSave = async () => {
    if (!form.supplier_id) { setError('Selecione um fornecedor'); return }
    const validItems = form.items.filter(i => i.product_id && i.quantity && i.unit_price)
    if (validItems.length === 0) { setError('Adicione ao menos um item válido'); return }

    setSaving(true); setError('')
    try {
      await entriesApi.create({
        supplier_id: parseInt(form.supplier_id),
        items: validItems.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity), unit_price: parseFloat(i.unit_price) }))
      })
      setModal(null)
      setForm({ supplier_id: '', items: [{ ...emptyItem }] })
      setSuccess('Entrada registrada! Estoque atualizado automaticamente.')
      setTimeout(() => setSuccess(''), 4000)
      load()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div>
      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={() => { setError(''); setModal('create') }}>+ Nova entrada de compra</button>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Entradas ({items.length})</span>
        </div>
        {loading ? <div className="loading">carregando...</div> : items.length === 0 ? (
          <div className="empty"><div className="empty-icon">↓</div><p>Nenhuma entrada registrada</p></div>
        ) : (
          <table className="table">
            <thead><tr><th>#</th><th>Fornecedor</th><th>Data</th><th>Valor total</th><th>Ações</th></tr></thead>
            <tbody>
              {items.map(item => (
                <tr key={item.entry_id}>
                  <td className="mono" style={{ color: 'var(--muted)' }}>{item.entry_id}</td>
                  <td style={{ fontWeight: 500 }}>{item.supplier_name}</td>
                  <td className="mono" style={{ color: 'var(--muted)', fontSize: 11 }}>
                    {new Date(item.entry_date).toLocaleString('pt-BR')}
                  </td>
                  <td className="mono" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                    R$ {parseFloat(item.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => openView(item)}>ver itens</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal, criar entrada */}
      {modal === 'create' && (
        <Modal
          title="Nova entrada de compra"
          onClose={() => setModal(null)}
          footer={<>
            <div style={{ marginRight: 'auto', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--accent)' }}>
              Total: R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'salvando...' : 'Registrar entrada'}</button>
          </>}
        >
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Fornecedor *</label>
            <select className="form-select" value={form.supplier_id} onChange={e => setForm(f => ({ ...f, supplier_id: e.target.value }))}>
              <option value="">Selecionar fornecedor...</option>
              {suppliers.map(s => <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Itens</div>
          <div className="items-list">
            {form.items.map((item, i) => (
              <div className="item-row" key={i}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Produto</label>
                  <select className="form-select" value={item.product_id} onChange={setItem(i, 'product_id')}>
                    <option value="">Selecionar...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Qtd</label>
                  <input className="form-input" type="number" min="1" value={item.quantity} onChange={setItem(i, 'quantity')} placeholder="0" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Preço unit.</label>
                  <input className="form-input" type="number" step="0.01" value={item.unit_price} onChange={setItem(i, 'unit_price')} placeholder="0.00" />
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => removeItem(i)} style={{ marginTop: 20 }} disabled={form.items.length === 1}>×</button>
              </div>
            ))}
          </div>
          <button className="add-item-btn" onClick={addItem}>+ Adicionar produto</button>
        </Modal>
      )}

      {/* Modal, ver itens da entrada */}
      {modal === 'view' && viewing && (
        <Modal title={`Entrada #${viewing.entry_id} — ${viewing.supplier_name}`} onClose={() => setModal(null)}>
          <div style={{ marginBottom: 16, display: 'flex', gap: 16, fontSize: 12, color: 'var(--muted)' }}>
            <span>Data: <strong style={{ color: 'var(--text)' }}>{new Date(viewing.entry_date).toLocaleString('pt-BR')}</strong></span>
            <span>Total: <strong style={{ color: 'var(--accent)', fontFamily: 'var(--mono)' }}>R$ {parseFloat(viewing.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
          </div>
          <table className="table">
            <thead><tr><th>Produto</th><th>Quantidade</th><th>Preço unit.</th><th>Subtotal</th></tr></thead>
            <tbody>
              {(viewing.items || []).map(item => (
                <tr key={item.item_id}>
                  <td>{item.product_name}</td>
                  <td className="mono">{item.quantity}</td>
                  <td className="mono">R$ {parseFloat(item.unit_price).toFixed(2)}</td>
                  <td className="mono" style={{ color: 'var(--accent)' }}>
                    R$ {(item.quantity * parseFloat(item.unit_price)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      )}
    </div>
  )
}
