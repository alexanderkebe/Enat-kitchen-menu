"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import "./admin.css";

// ─── Login Screen ───
function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (!res.ok) {
        setErr("Wrong password. Try again.");
        setLoading(false);
        return;
      }
      onLogin();
    } catch {
      setErr("Connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="admin-page admin-login">
      <form className="login-card" onSubmit={submit}>
        <div className="login-logo">
          <span className="plate-icon">◯</span>
          <span>Enat Kitchen</span>
        </div>
        <h1>Admin Panel</h1>
        <p>Enter your password to manage the menu.</p>
        <div className="login-field">
          <input
            type="password"
            placeholder="Password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoFocus
          />
        </div>
        <button className="login-btn" type="submit" disabled={loading || !pw}>
          {loading ? "Signing in…" : "Sign In"}
        </button>
        {err && <div className="login-error">{err}</div>}
      </form>
    </div>
  );
}

// ─── Add Category Modal ───
function AddCategoryModal({ onClose, onAdd }) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), subtitle.trim());
    onClose();
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>New Category</h2>
        <div className="modal-field">
          <label>Category Name</label>
          <input placeholder="e.g. Desserts" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </div>
        <div className="modal-field">
          <label>Subtitle</label>
          <input placeholder="A short description…" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
        </div>
        <div className="modal-actions">
          <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
          <button type="submit" className="modal-confirm" disabled={!title.trim()}>Add Category</button>
        </div>
      </form>
    </div>
  );
}

// ─── Dashboard ───
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [menu, setMenu] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Check existing session
  useEffect(() => {
    fetch("/api/admin/menu")
      .then((r) => {
        if (r.ok) {
          setAuthed(true);
          return r.json();
        }
        throw new Error("Not authed");
      })
      .then((data) => setMenu(data))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = useCallback(() => {
    setAuthed(true);
    fetch("/api/admin/menu")
      .then((r) => r.json())
      .then((data) => setMenu(data));
  }, []);

  const handleLogout = useCallback(() => {
    document.cookie = "admin_token=; path=/; max-age=0";
    setAuthed(false);
    setMenu(null);
  }, []);

  // Show toast
  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Save menu
  const saveMenu = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menu),
      });
      if (!res.ok) throw new Error("Save failed");
      setDirty(false);
      showToast("Menu saved successfully!");
    } catch {
      showToast("Failed to save. Try again.", "error");
    }
    setSaving(false);
  }, [menu, showToast]);

  // ─── Mutation helpers ───
  const updateMenu = useCallback((fn) => {
    setMenu((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      fn(next);
      return next;
    });
    setDirty(true);
  }, []);

  const updateSectionTitle = useCallback((idx, title) => {
    updateMenu((m) => { m[idx][0] = title; });
  }, [updateMenu]);

  const updateSectionSubtitle = useCallback((idx, subtitle) => {
    updateMenu((m) => { m[idx][1] = subtitle; });
  }, [updateMenu]);

  const updateItemName = useCallback((sIdx, iIdx, name) => {
    updateMenu((m) => { m[sIdx][2][iIdx][0] = name; });
  }, [updateMenu]);

  const updateItemDesc = useCallback((sIdx, iIdx, desc) => {
    updateMenu((m) => { m[sIdx][2][iIdx][1] = desc; });
  }, [updateMenu]);

  const updateItemPrice = useCallback((sIdx, iIdx, price) => {
    updateMenu((m) => {
      m[sIdx][2][iIdx][2] = price === "" ? null : Number(price) || null;
    });
  }, [updateMenu]);

  const deleteItem = useCallback((sIdx, iIdx) => {
    updateMenu((m) => { m[sIdx][2].splice(iIdx, 1); });
  }, [updateMenu]);

  const addItem = useCallback((sIdx) => {
    updateMenu((m) => { m[sIdx][2].push(["New Item", "", null]); });
  }, [updateMenu]);

  const deleteSection = useCallback((idx) => {
    updateMenu((m) => { m.splice(idx, 1); });
    setActiveIdx((prev) => Math.max(0, Math.min(prev, (menu?.length || 1) - 2)));
  }, [updateMenu, menu]);

  const addSection = useCallback((title, subtitle) => {
    updateMenu((m) => { m.push([title, subtitle, []]); });
    setActiveIdx(menu ? menu.length : 0);
  }, [updateMenu, menu]);

  const moveSection = useCallback((idx, dir) => {
    updateMenu((m) => {
      const target = idx + dir;
      if (target < 0 || target >= m.length) return;
      [m[idx], m[target]] = [m[target], m[idx]];
    });
    setActiveIdx((prev) => {
      const target = prev + dir;
      return target >= 0 && target < (menu?.length || 0) ? target : prev;
    });
  }, [updateMenu, menu]);

  // Stats
  const stats = useMemo(() => {
    if (!menu) return { categories: 0, items: 0, priced: 0 };
    const items = menu.reduce((sum, s) => sum + s[2].length, 0);
    const priced = menu.reduce((sum, s) => sum + s[2].filter((i) => i[2] !== null).length, 0);
    return { categories: menu.length, items, priced };
  }, [menu]);

  // ─── Render ───
  if (checking) {
    return <div className="admin-page admin-loading"><div className="loading-spinner" /></div>;
  }

  if (!authed) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (!menu) {
    return <div className="admin-page admin-loading"><div className="loading-spinner" /></div>;
  }

  const section = menu[activeIdx];

  return (
    <div className="admin-page admin-dashboard">
      {/* Top Bar */}
      <header className="admin-topbar">
        <div className="topbar-left">
          <div className="topbar-logo">
            <span className="plate-icon">◯</span>
            <span>Enat Kitchen</span>
          </div>
          <span className="topbar-badge">Admin</span>
        </div>
        <div className="topbar-actions">
          <a className="topbar-btn" href="/" target="_blank" rel="noopener">
            ↗ View Menu
          </a>
          <button
            className={`topbar-btn save-btn${!dirty ? " saved" : ""}`}
            onClick={saveMenu}
            disabled={saving || !dirty}
          >
            {saving ? "Saving…" : dirty ? "Save Changes" : "✓ Saved"}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-title">Categories</div>
        <ul className="sidebar-list">
          {menu.map((s, i) => (
            <li
              key={i}
              className={`sidebar-item${i === activeIdx ? " active" : ""}`}
              onClick={() => setActiveIdx(i)}
            >
              <span>{s[0]}</span>
              <span className="sidebar-item-count">{s[2].length}</span>
              <div className="sidebar-move">
                <button title="Move up" onClick={(e) => { e.stopPropagation(); moveSection(i, -1); }} disabled={i === 0}>↑</button>
                <button title="Move down" onClick={(e) => { e.stopPropagation(); moveSection(i, 1); }} disabled={i === menu.length - 1}>↓</button>
              </div>
            </li>
          ))}
        </ul>
        <button className="sidebar-add" onClick={() => setShowAddCategory(true)}>
          + Add Category
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Mobile category selector */}
        <select
          className="mobile-category-select"
          value={activeIdx}
          onChange={(e) => setActiveIdx(Number(e.target.value))}
        >
          {menu.map((s, i) => (
            <option key={i} value={i}>{s[0]} ({s[2].length} items)</option>
          ))}
        </select>

        {/* Stats */}
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-label">Categories</div>
            <div className="stat-value">{stats.categories}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Items</div>
            <div className="stat-value">{stats.items}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">With Price</div>
            <div className="stat-value">{stats.priced}</div>
          </div>
        </div>

        {/* Section Editor */}
        {section ? (
          <>
            <div className="section-header">
              <div className="section-header-left">
                <div className="section-title-row">
                  <span className="section-number">{String(activeIdx + 1).padStart(2, "0")}</span>
                  <input
                    className="section-title-input"
                    value={section[0]}
                    onChange={(e) => updateSectionTitle(activeIdx, e.target.value)}
                    placeholder="Category name"
                  />
                </div>
                <input
                  className="section-subtitle-input"
                  value={section[1]}
                  onChange={(e) => updateSectionSubtitle(activeIdx, e.target.value)}
                  placeholder="Subtitle or description"
                />
              </div>
              <div className="section-actions">
                <button
                  className="danger-btn"
                  onClick={() => {
                    if (confirm(`Delete "${section[0]}" and all its items?`)) {
                      deleteSection(activeIdx);
                    }
                  }}
                >
                  Delete Category
                </button>
              </div>
            </div>

            {/* Items Header */}
            <div className="items-header">
              <span>Name</span>
              <span>Description</span>
              <span>Price (Br)</span>
              <span></span>
            </div>

            {/* Items */}
            {section[2].map((item, iIdx) => (
              <div className="item-row" key={iIdx}>
                <input
                  className="item-input name-input"
                  value={item[0]}
                  onChange={(e) => updateItemName(activeIdx, iIdx, e.target.value)}
                  placeholder="Item name"
                />
                <input
                  className="item-input desc-input"
                  value={item[1]}
                  onChange={(e) => updateItemDesc(activeIdx, iIdx, e.target.value)}
                  placeholder="Description"
                />
                <div className="price-input-wrap">
                  <input
                    type="number"
                    value={item[2] ?? ""}
                    onChange={(e) => updateItemPrice(activeIdx, iIdx, e.target.value)}
                    placeholder="—"
                  />
                  <span className="price-unit">Br</span>
                </div>
                <button
                  className="item-delete"
                  title="Delete item"
                  onClick={() => deleteItem(activeIdx, iIdx)}
                >
                  ×
                </button>
              </div>
            ))}

            {/* Add Item */}
            <button className="add-item-btn" onClick={() => addItem(activeIdx)}>
              <span>+</span> Add Item
            </button>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No category selected</h3>
            <p>Choose a category from the sidebar or create a new one.</p>
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.type === "success" ? "✓ " : "⚠ "}{toast.msg}
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <AddCategoryModal
          onClose={() => setShowAddCategory(false)}
          onAdd={addSection}
        />
      )}
    </div>
  );
}
