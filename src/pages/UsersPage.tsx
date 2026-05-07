import { useEffect, useState } from 'react';
import { getAllUsers, updateUserCredits, AppUser } from '../lib/firebaseService';
import { Users, Search, CreditCard, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [filtered, setFiltered] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUid, setEditingUid] = useState<string | null>(null);
  const [editCredits, setEditCredits] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedUid, setSavedUid] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setFiltered(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(users.filter((u) => u.email?.toLowerCase().includes(q) || u.uid.includes(q)));
  }, [search, users]);

  const startEdit = (u: AppUser) => {
    setEditingUid(u.uid);
    setEditCredits(u.credits);
  };

  const saveCredits = async (uid: string) => {
    setSaving(true);
    await updateUserCredits(uid, editCredits);
    setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, credits: editCredits } : u));
    setSaving(false);
    setEditingUid(null);
    setSavedUid(uid);
    setTimeout(() => setSavedUid(null), 2000);
  };

  const formatDate = (ts: number) =>
    ts ? new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="page">
      <div className="page-header">
        <Users size={28} className="page-icon" />
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-sub">Manage users and their credit balances</p>
        </div>
        <button className="ghost-btn ml-auto" onClick={load}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="search-bar">
        <Search size={16} className="search-icon" />
        <input
          className="search-input"
          placeholder="Search by email or UID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-list">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton-row" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <AlertTriangle size={40} />
          <p>No users found</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>UID</th>
                <th>Credits</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.uid} className={savedUid === u.uid ? 'row-saved' : ''}>
                  <td>
                    <div className="user-email-cell">
                      <div className="avatar-sm">{u.email?.[0]?.toUpperCase() ?? '?'}</div>
                      {u.email ?? '—'}
                    </div>
                  </td>
                  <td className="uid-cell">{u.uid}</td>
                  <td>
                    {editingUid === u.uid ? (
                      <input
                        type="number"
                        className="credits-input"
                        value={editCredits}
                        min={0}
                        onChange={(e) => setEditCredits(Number(e.target.value))}
                      />
                    ) : (
                      <span className={`credits-badge ${u.credits <= 10 ? 'credits-low' : ''}`}>
                        <CreditCard size={12} /> {u.credits}
                      </span>
                    )}
                  </td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>
                    {editingUid === u.uid ? (
                      <div className="btn-row">
                        <button
                          className="save-btn"
                          disabled={saving}
                          onClick={() => saveCredits(u.uid)}
                        >
                          {saving ? '…' : <CheckCircle size={14} />}
                        </button>
                        <button className="cancel-btn" onClick={() => setEditingUid(null)}>✕</button>
                      </div>
                    ) : (
                      <button className="edit-btn" onClick={() => startEdit(u)}>
                        Edit Credits
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="table-footer">
        Showing {filtered.length} / {users.length} users
      </p>
    </div>
  );
}
