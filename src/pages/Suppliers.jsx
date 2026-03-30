import { useState, useEffect } from 'react'
import { suppliersApi } from '../services/api'
import Modal from '../components/Modal'

const empty = { name: '', cnpj: '', phone: '', email: '', address: '' }

export default function Suppliers() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [modal, setModal]     = useState(null)
  const [form, setForm]       = useState(empty)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving]   = useState(false)

  const load = () => {
    setLoading(true)
    suppliersApi.list()
      .then(r => setItems(r.data || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(empty); setEditing(null); setModal('form') }
  const openEdit   = (item) => {
    setForm({ name: item.name, cnpj: item.cnpj || '', phone: item.phone || '', email: item.email || '', address: item.address || '' })
    setEditing(item); setModal('form')
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true); setError('')
    try {
      editing ? await suppliersApi.update(editing.supplier_id, form) : await suppliersApi.create(form)
      setModal(null); load()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (item) => {
    if (!confirm(`Deletar "${item.name}"?`)) return
    try { await suppliersApi.delete(item.supplier_id); load() }
    catch (e) { setError(e.message) }
  }

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Fornecedores ({items.length})</span>
          <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Novo fornecedor</button>
        </div>
        {loading ? <div className="loading">carregando...</div> : items.length === 0 ? (
          <div className="empty"><div className="empty-icon">◎</div><p>Nenhum fornecedor cadastrado</p></div>
        ) : (
          <table className="table">
            <thead><tr><th>#</th><th>Nome</th><th>CNPJ</th><th>Telefone</th><th>Email</th><th>Ações</th></tr></thead>
            <tbody>
              {items.map(item => (
                <tr key={item.supplier_id}>
                  <td className="mono" style={{ color: 'var(--muted)' }}>{item.supplier_id}</td>
                  <td style={{ fontWeight: 500 }}>{item.name}</td>
                  <td className="mono">{item.cnpj || '—'}</td>
                  <td>{item.phone || '—'}</td>
                  <td style={{ color: 'var(--muted)' }}>{item.email || '—'}</td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(item)}>editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item)}>deletar</button>
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
          title={editing ? 'Editar fornecedor' : 'Novo fornecedor'}
          onClose={() => setModal(null)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'salvando...' : 'Salvar'}</button>
          </>}
        >
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Nome *</label>
            <input className="form-input" value={form.name} onChange={set('name')} placeholder="Nome do fornecedor" autoFocus />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">CNPJ</label>
              <input className="form-input" value={form.cnpj} onChange={set('cnpj')} placeholder="00.000.000/0000-00" />
            </div>
            <div className="form-group">
              <label className="form-label">Telefone</label>
              <input className="form-input" value={form.phone} onChange={set('phone')} placeholder="(11) 99999-0000" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="contato@empresa.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Endereço</label>
            <input className="form-input" value={form.address} onChange={set('address')} placeholder="Rua, número, cidade" />
          </div>
        </Modal>
      )}
    </div>
  )
}
