import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const titles = {
  '/':                'Dashboard',
  '/stock':           'Controle de Estoque',
  '/movements':       'Movimentação de Estoque',
  '/entries':         'Entradas de Mercadoria',
  '/products':        'Cadastro de Produtos',
  '/categories':      'Categorias de Produtos',
  '/categories/manage': 'Gerenciar Categorias',
  '/suppliers':       'Fornecedores',
}

export default function Layout({ children }) {
  const { pathname } = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const title = titles[pathname] || 'Sistema de Estoque'

  const toggleSidebar = () => setSidebarOpen(o => !o)
  const closeSidebar  = () => setSidebarOpen(false)

  return (
    <div className="layout">
      <div className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} onClick={closeSidebar} />

      <aside className={`sidebar ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="sidebar-header">
          <span className="sidebar-title">Menu</span>
          <button className="sidebar-toggle-btn" onClick={closeSidebar}>
            <span /><span /><span />
          </button>
        </div>

        <nav className="sidebar-nav">

          {/*  ESTOQUE */}
          <div className="nav-section-label">Estoque</div>

          <NavLink to="/" end
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            onClick={closeSidebar}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            Dashboard
          </NavLink>

          <NavLink to="/stock"
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            onClick={closeSidebar}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            </svg>
            Estoque
          </NavLink>

          <NavLink to="/movements"
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            onClick={closeSidebar}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="12" y1="2" x2="12" y2="22"/>
              <path d="M17 7l-5-5-5 5M17 17l-5 5-5-5"/>
            </svg>
            Movimentações
          </NavLink>

          <NavLink to="/entries"
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            onClick={closeSidebar}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="8 17 12 21 16 17"/>
              <line x1="12" y1="3" x2="12" y2="21"/>
            </svg>
            Entradas
          </NavLink>

          {/* CADASTROS*/}
          <div className="nav-section-label" style={{ marginTop: 8 }}>Cadastros</div>

          <NavLink to="/products"
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            onClick={closeSidebar}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            Produtos
          </NavLink>

          <NavLink to="/categories"
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            onClick={closeSidebar}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>
            </svg>
            Categorias
          </NavLink>

          <NavLink to="/suppliers"
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            onClick={closeSidebar}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
            Fornecedores
          </NavLink>

        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-config-btn">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Configurações
          </button>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <div className="topbar-left">
            <button className="hamburger-btn" onClick={toggleSidebar}>
              <span /><span /><span />
            </button>
          </div>
          <span className="topbar-title">{title}</span>
          <button className="topbar-user">
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
            JK
          </button>
        </div>
        <div className="page">{children}</div>
      </div>
    </div>
  )
}
