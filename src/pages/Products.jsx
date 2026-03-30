import { useState, useEffect } from 'react'
import { productsApi, categoriesApi, suppliersApi } from '../services/api'
import Modal from '../components/Modal'

const empty = { name: '', description: '', cost_price: '', sale_price: '', minimum_stock: 0, category_id: '', supplier_id: '' }

export default function Products() {
  const [items, setItems]           = useState([])
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [modal, setModal]           = useState(null)
  const [form, setForm]             = useState(empty)
  const [editing, setEditing]       = useState(null)
  const [saving, setSaving]         = useState(false)
  const [search, setSearch]         = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([productsApi.list(), categoriesApi.list(), suppliersApi.list()])
      .then(([p, c, s]) => {
        setItems(p.data || [])
        setCategories(c.data || [])
        setSuppliers(s.data || [])
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(empty); setEditing(null); setModal('form') }
  const openEdit = (item) => {
    setForm({
      name: item.name, description: item.description || '',
      cost_price: item.cost_price, sale_price: item.sale_price,
      minimum_stock: item.minimum_stock, category_id: item.category_id, supplier_id: item.supplier_id,
    })
    setEditing(item); setModal('form')
  }

  const handleSave = async () => {
    if (!form.name || !form.cost_price || !form.sale_price || !form.category_id || !form.supplier_id) {
      setError('Preencha todos os campos obrigatórios'); return
    }
    setSaving(true); setError('')
    try {
      const payload = {
        ...form,
        cost_price: parseFloat(form.cost_price),
        sale_price: parseFloat(form.sale_price),
        minimum_stock: parseInt(form.minimum_stock) || 0,
        category_id: parseInt(form.category_id),
        supplier_id: parseInt(form.supplier_id),
      }
      editing ? await productsApi.update(editing.id, payload) : await productsApi.create(payload)
      setModal(null); load()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (item) => {
    if (!confirm(`Deletar "${item.name}"?`)) return
    try { await productsApi.delete(item.id); load() }
    catch (e) { setError(e.message) }
  }

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const displayed = search
    ? items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    : items

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
        <button className="btn btn-primary" onClick={openCreate}>+ Novo produto</button>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Produtos ({displayed.length})</span>
        </div>
        {loading ? <div className="loading">Carregando...</div> : displayed.length === 0 ? (
          <div className="empty"><div className="empty-icon">📦</div><p>Nenhum produto encontrado</p></div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>#</th><th>Nome</th><th>Categoria</th><th>Fornecedor</th><th>Custo</th><th>Venda</th><th>Mínimo</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {displayed.map(item => (
                <tr key={item.id}>
                  <td style={{ color: '#aaa', fontSize: 12 }}>{item.id}</td>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td style={{ color: '#777' }}>{item.category_name}</td>
                  <td style={{ color: '#777' }}>{item.supplier_name}</td>
                  <td>R$ {parseFloat(item.cost_price).toFixed(2)}</td>
                  <td style={{ color: 'var(--primary)', fontWeight: 600 }}>R$ {parseFloat(item.sale_price).toFixed(2)}</td>
                  <td>{item.minimum_stock}</td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(item)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item)}>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal === 'form' && (
        <Modal
          title={editing ? 'Editar produto' : 'Novo produto'}
          onClose={() => setModal(null)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
          </>}
        >
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Nome *</label>
            <input className="form-input" value={form.name} onChange={set('name')} placeholder="Nome do produto" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Descrição</label>
            <input className="form-input" value={form.description} onChange={set('description')} placeholder="Descrição opcional" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Preço de custo *</label>
              <input className="form-input" type="number" step="0.01" value={form.cost_price} onChange={set('cost_price')} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label className="form-label">Preço de venda *</label>
              <input className="form-input" type="number" step="0.01" value={form.sale_price} onChange={set('sale_price')} placeholder="0.00" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Categoria *</label>
              <select className="form-select" value={form.category_id} onChange={set('category_id')}>
                <option value="">Selecionar...</option>
                {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Fornecedor *</label>
              <select className="form-select" value={form.supplier_id} onChange={set('supplier_id')}>
                <option value="">Selecionar...</option>
                {suppliers.map(s => <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Estoque mínimo</label>
            <input className="form-input" type="number" value={form.minimum_stock} onChange={set('minimum_stock')} placeholder="0" />
          </div>
        </Modal>
      )}
    </div>
  )
}
