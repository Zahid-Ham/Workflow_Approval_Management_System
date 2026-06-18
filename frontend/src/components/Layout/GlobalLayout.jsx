import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const GlobalLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar" aria-label="Main navigation">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 10h10M4 14h12M4 18h8"
                stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="sidebar-brand-text">Workflow</div>
            <div className="sidebar-brand-sub">Approval System</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav" aria-label="Page navigation">
          {user?.role === 'Requester' && (
            <>
              <span className="sidebar-nav-label">Requester</span>
              <NavLink
                to="/requester"
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                <span className="nav-link-icon">🏠</span>
                Dashboard
              </NavLink>
              <NavLink
                to="/requests"
                end
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                <span className="nav-link-icon">📋</span>
                All Requests
              </NavLink>
              <NavLink
                to="/requests/new"
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                <span className="nav-link-icon">✏️</span>
                New Request
              </NavLink>
            </>
          )}

          {user?.role === 'Reviewer' && (
            <>
              <span className="sidebar-nav-label">Reviewer</span>
              <NavLink
                to="/reviewer"
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                <span className="nav-link-icon">📋</span>
                Review Queue
              </NavLink>
            </>
          )}
        </nav>

        {/* Footer: user mini + logout */}
        <div className="sidebar-footer">
          <div className="sidebar-user-mini" aria-label="Logged-in user">
            <div className="sidebar-user-avatar-mini" aria-hidden="true">{initial}</div>
            <div>
              <div className="sidebar-user-name-mini">{user?.name || 'User'}</div>
              <div className="sidebar-user-role-mini">{user?.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} aria-label="Sign out">
            <span aria-hidden="true">→</span> Logout
          </button>
        </div>
      </aside>

      {/* ── Main pane ── */}
      <div className="main-pane">
        {/* Topbar */}
        <header className="topbar">
          <span className="topbar-title">
            {user?.role === 'Reviewer' ? 'Review Queue' : 'Workspace'}
          </span>
          <div className="topbar-profile">
            <span className="topbar-role-badge">{user?.role}</span>
            <div>
              <div className="topbar-name">{user?.name}</div>
              <div className="topbar-email">{user?.email}</div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default GlobalLayout;