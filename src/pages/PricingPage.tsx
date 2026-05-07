import { useEffect, useState } from 'react';
import { getPricingPlans, savePricingPlans, PricingPlan } from '../lib/firebaseService';
import { CreditCard, Plus, Trash2, Save, Star, CheckCircle } from 'lucide-react';

const DEFAULT_PLANS: PricingPlan[] = [
  { id: 'basic', name: 'Basic', price: 99, credits: 499, popular: false },
  { id: 'popular', name: 'Popular', price: 299, credits: 1599, popular: true },
  { id: 'premium', name: 'Premium', price: 499, credits: 2999, popular: false },
];

function newPlan(): PricingPlan {
  return { id: `plan_${Date.now()}`, name: '', price: 0, credits: 0, popular: false };
}

export default function PricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getPricingPlans().then((p) => {
      setPlans(p.length ? p : DEFAULT_PLANS);
      setLoading(false);
    });
  }, []);

  const update = (idx: number, field: keyof PricingPlan, value: unknown) => {
    setPlans((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      // Only one plan can be popular
      if (field === 'popular' && value === true) {
        next.forEach((p, i) => { if (i !== idx) p.popular = false; });
      }
      return next;
    });
  };

  const addPlan = () => setPlans((prev) => [...prev, newPlan()]);
  const removePlan = (idx: number) => setPlans((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    setSaving(true);
    await savePricingPlans(plans);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="page">
      <div className="page-header">
        <CreditCard size={28} className="page-icon" />
        <div>
          <h1 className="page-title">Pricing Plans</h1>
          <p className="page-sub">Manage credit packages shown in the Android app</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-grid">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton-card" style={{ height: 200 }} />)}
        </div>
      ) : (
        <>
          <div className="plans-grid">
            {plans.map((plan, idx) => (
              <div key={plan.id} className={`plan-card ${plan.popular ? 'plan-popular' : ''}`}>
                {plan.popular && (
                  <div className="popular-badge">
                    <Star size={12} fill="currentColor" /> Most Popular
                  </div>
                )}

                <div className="plan-field-row">
                  <label>Plan Name</label>
                  <input
                    className="plan-input"
                    value={plan.name}
                    onChange={(e) => update(idx, 'name', e.target.value)}
                    placeholder="e.g. Basic"
                  />
                </div>

                <div className="plan-field-row">
                  <label>Price (₹)</label>
                  <input
                    className="plan-input"
                    type="number"
                    min={0}
                    value={plan.price}
                    onChange={(e) => update(idx, 'price', Number(e.target.value))}
                  />
                </div>

                <div className="plan-field-row">
                  <label>Credits</label>
                  <input
                    className="plan-input"
                    type="number"
                    min={0}
                    value={plan.credits}
                    onChange={(e) => update(idx, 'credits', Number(e.target.value))}
                  />
                </div>

                <div className="plan-field-row">
                  <label>Mark Popular</label>
                  <label className="toggle-wrap">
                    <input
                      type="checkbox"
                      checked={plan.popular}
                      onChange={(e) => update(idx, 'popular', e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="plan-price-preview">
                  ₹{plan.price} → {plan.credits} credits
                </div>

                <button
                  className="delete-btn"
                  onClick={() => removePlan(idx)}
                  title="Remove plan"
                >
                  <Trash2 size={15} /> Remove
                </button>
              </div>
            ))}

            <button className="add-plan-card" onClick={addPlan}>
              <Plus size={32} />
              <span>Add Plan</span>
            </button>
          </div>

          <div className="action-row">
            {saved && (
              <span className="saved-badge">
                <CheckCircle size={16} /> Saved successfully!
              </span>
            )}
            <button className="primary-btn" onClick={handleSave} disabled={saving}>
              <Save size={16} />
              {saving ? 'Saving…' : 'Save to Firebase'}
            </button>
          </div>

          <div className="info-banner">
            <span className="info-dot" />
            Plans are saved to <strong>config/pricing</strong> and fetched live by the Android app's payment screen.
          </div>
        </>
      )}
    </div>
  );
}
