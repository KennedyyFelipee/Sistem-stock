import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { categoriesApi, productsApi } from '../services/api'
import Modal from '../components/Modal'

const emptyForm = { category_name: '', description: '' }

function catEmoji(name = '') {
  const n = name.toLowerCase()
  if (n.includes('bebid') || n.includes('drink'))         return '🥤'
  if (n.includes('eletr'))                                return '🔌'
  if (n.includes('limpeza') || n.includes('higiene'))     return '🧹'
  if (n.includes('peça') || n.includes('peca') || n.includes('auto')) return '🔧'
  if (n.includes('roupa') || n.includes('vestu'))         return '👕'
  if (n.includes('aliment') || n.includes('comida'))      return '🍎'
  if (n.includes('inform') || n.includes('comput'))       return '💻'
  if (n.includes('móv') || n.includes('movel'))           return '🪑'
  if (n.includes('livro') || n.includes('papelaria'))     return '📚'
  if (n.includes('esport'))                               return '⚽'
  if (n.includes('brinq'))                                return '🧸'
  if (n.includes('ferr'))                                 return '🔨'
  return '📦'
}

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [products,   setProducts]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')

  // navegação qual categoria está selecionada para ver produtos
  const [selectedCat, setSelectedCat] = useState(null)

  // modal de gerenciamento
  const [modal,   setModal]   = useState(null)   
  const [form,    setForm]    = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [saving,  setSaving]  = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([categoriesApi.list(), productsApi.list()])
      .then(([c, p]) => {
        setCategories(c.data || [])
        setProducts(p.data || [])
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  /*helpers */
  const prodsByCat = (catId) =>
    products.filter(p => Number(p.category_id) === Number(catId))

  /*  CRUD  */
  const openCreate = () => { setForm(emptyForm); setEditing(null); setModal('form') }
  const openEdit   = (cat) => {
    setForm({ category_name: cat.category_name, description: cat.description || '' })
    setEditing(cat); setModal('form')
  }
  const handleSave = async () => {
    if (!form.category_name.trim()) return
    setSaving(true); setError('')
    try {
      editing
        ? await categoriesApi.update(editing.category_id, form)
        : await categoriesApi.create(form)
      setModal('list'); load()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }
  const handleDelete = async (cat) => {
    if (!window.confirm(`Excluir "${cat.category_name}"?`)) return
    try { await categoriesApi.delete(cat.category_id); load() }
    catch (e) { setError(e.message) }
  }

  /* se uma categoria foi selecionada, mostra produtos dela  */
  if (selectedCat) {
    const prods = prodsByCat(selectedCat.category_id)
    return (
      <div>
        <button
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: 18 }}
          onClick={() => setSelectedCat(null)}
        >
          ← Voltar às categorias
        </button>

        <div className="card">
          <div className="card-header">
            <span className="card-title">
              {catEmoji(selectedCat.category_name)} {selectedCat.category_name}
              &nbsp;— {prods.length} produto(s)
            </span>
          </div>
          {prods.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📭</div>
              <p>Nenhum produto cadastrado nessa categoria</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th><th>Fornecedor</th>
                  <th>Custo</th><th>Venda</th><th>Est. Mín.</th>
                </tr>
              </thead>
              <tbody>
                {prods.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td style={{ color: '#777' }}>{p.supplier_name || '—'}</td>
                    <td>R$ {parseFloat(p.cost_price).toFixed(2)}</td>
                    <td style={{ color: 'var(--primary)', fontWeight: 600 }}>
                      R$ {parseFloat(p.sale_price).toFixed(2)}
                    </td>
                    <td>{p.minimum_stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    )
  }

  /*  tela principal, grade de categorias  */
  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <p style={{ color: '#888', fontSize: 13 }}>
          Clique em uma categoria para ver os produtos cadastrados nela.
        </p>
        <button className="btn btn-primary btn-sm" onClick={() => setModal('list')}>
          ⚙ Gerenciar categorias
        </button>
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : categories.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🗂️</div>
          <p>Nenhuma categoria cadastrada ainda.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setModal('list')}>
            Criar primeira categoria
          </button>
        </div>
      ) : (
        <div className="cat-grid">
          {categories.map(cat => (
            <div
              key={cat.category_id}
              className="cat-card"
              onClick={() => setSelectedCat(cat)}
            >
              <div className="cat-card-emoji">{catEmoji(cat.category_name)}</div>
              <div className="cat-card-name">{cat.category_name}</div>
              <div className="cat-card-count">
                {prodsByCat(cat.category_id).length} produto(s)
              </div>
              {cat.description && (
                <div className="cat-card-desc">{cat.description}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/*  Modal, lista de gerenciamento */}
      {modal === 'list' && (
        <Modal
          title="Gerenciar Categorias"
          onClose={() => setModal(null)}
          footer={
            <button className="btn btn-primary" onClick={openCreate}>+ Nova categoria</button>
          }
        >
          {error && <div className="alert alert-error">{error}</div>}
          {categories.length === 0 ? (
            <div className="empty"><p>Nenhuma categoria cadastrada</p></div>
          ) : (
            <table className="table">
              <thead><tr><th>Nome</th><th>Produtos</th><th>Ações</th></tr></thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.category_id}>
                    <td style={{ fontWeight: 600 }}>
                      {catEmoji(cat.category_name)} {cat.category_name}
                    </td>
                    <td>
                      <span className="badge badge-blue">
                        {prodsByCat(cat.category_id).length}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(cat)}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat)}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Modal>
      )}

      {/*  Modal, form criar/editar  */}
      {modal === 'form' && (
        <Modal
          title={editing ? 'Editar categoria' : 'Nova categoria'}
          onClose={() => setModal('list')}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setModal('list')}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </>}
        >
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Nome *</label>
            <input
              className="form-input"
              value={form.category_name}
              onChange={e => setForm(f => ({ ...f, category_name: e.target.value }))}
              placeholder="Ex: Eletrônicos"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Descrição</label>
            <input
              className="form-input"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Descrição opcional"
            />
          </div>
        </Modal>
      )}
    </div>
  )
}
