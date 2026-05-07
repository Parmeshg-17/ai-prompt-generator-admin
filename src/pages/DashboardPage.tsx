import { useEffect, useState } from 'react';
import { getAllUsers, getPricingPlans, getSystemPrompts } from '../lib/firebaseService';
import { Bot, Users, CreditCard, FileText, TrendingUp } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalCredits: number;
  plans: number;
  promptsConfigured: boolean;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [users, plans, prompts] = await Promise.all([
        getAllUsers(),
        getPricingPlans(),
        getSystemPrompts(),
      ]);
      setStats({
        totalUsers: users.length,
        totalCredits: users.reduce((s, u) => s + (u.credits || 0), 0),
        plans: plans.length,
        promptsConfigured: !!(prompts.appPrompt && prompts.websitePrompt),
      });
      setLoading(false);
    })();
  }, []);

  const cards = [
    { icon: <Users size={24} />, label: 'Total Users', value: stats?.totalUsers ?? '—', color: 'card-blue' },
    { icon: <TrendingUp size={24} />, label: 'Total Credits in Circulation', value: stats?.totalCredits ?? '—', color: 'card-purple' },
    { icon: <CreditCard size={24} />, label: 'Pricing Plans', value: stats?.plans ?? '—', color: 'card-green' },
    {
      icon: <FileText size={24} />,
      label: 'System Prompts',
      value: stats?.promptsConfigured ? 'Configured ✓' : 'Not Set',
      color: stats?.promptsConfigured ? 'card-teal' : 'card-red',
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <Bot size={28} className="page-icon" />
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Overview of your AI Prompt Generator</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-grid">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton-card" />)}
        </div>
      ) : (
        <div className="stats-grid">
          {cards.map((c) => (
            <div key={c.label} className={`stat-card ${c.color}`}>
              <div className="stat-icon">{c.icon}</div>
              <div className="stat-info">
                <div className="stat-value">{c.value}</div>
                <div className="stat-label">{c.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="info-banner">
        <span className="info-dot" />
        Admin writes to <strong>config/systemPrompts</strong> and <strong>config/pricing</strong> — Android app reads them live.
      </div>
    </div>
  );
}
