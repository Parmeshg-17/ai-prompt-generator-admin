import { useEffect, useState } from 'react';
import { getSystemPrompts, saveSystemPrompts } from '../lib/firebaseService';
import type { SystemPrompts } from '../lib/firebaseService';
import { FileText, Save, RefreshCw, CheckCircle } from 'lucide-react';

const DEFAULT_APP = `You are an expert Android/iOS developer. Generate a comprehensive, production-ready development prompt for the user's mobile app idea. Include:
- Architecture overview (MVVM/Clean Architecture)
- Tech stack recommendations
- Core feature list with implementation steps
- API integrations
- UI/UX guidelines
- Security considerations
Make it detailed, structured, and ready to use with an AI coding assistant.`;

const DEFAULT_WEBSITE = `You are an expert full-stack web developer. Generate a comprehensive, production-ready development prompt for the user's website/web app idea. Include:
- Architecture overview (frontend + backend)
- Tech stack recommendations
- Core feature list with implementation steps
- API design
- UI/UX guidelines
- Deployment strategy
Make it detailed, structured, and ready to use with an AI coding assistant.`;

export default function PromptsPage() {
  const [data, setData] = useState<SystemPrompts>({ appPrompt: '', websitePrompt: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'app' | 'website'>('app');

  useEffect(() => {
    getSystemPrompts().then((p) => {
      setData(p);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await saveSystemPrompts({ appPrompt: data.appPrompt, websitePrompt: data.websitePrompt });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const fillDefault = () => {
    setData((prev) => ({
      ...prev,
      appPrompt: activeTab === 'app' ? DEFAULT_APP : prev.appPrompt,
      websitePrompt: activeTab === 'website' ? DEFAULT_WEBSITE : prev.websitePrompt,
    }));
  };

  return (
    <div className="page">
      <div className="page-header">
        <FileText size={28} className="page-icon" />
        <div>
          <h1 className="page-title">System Prompts</h1>
          <p className="page-sub">Control what AI instructions the app uses for each prompt type</p>
        </div>
      </div>

      <div className="tab-bar">
        <button
          className={`tab-btn ${activeTab === 'app' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('app')}
        >
          📱 App Prompt
        </button>
        <button
          className={`tab-btn ${activeTab === 'website' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('website')}
        >
          🌐 Website Prompt
        </button>
      </div>

      {loading ? (
        <div className="skeleton-textarea" />
      ) : (
        <div className="prompt-editor-wrap">
          <div className="editor-toolbar">
            <span className="char-count">
              {activeTab === 'app' ? data.appPrompt.length : data.websitePrompt.length} chars
            </span>
            <button className="ghost-btn" onClick={fillDefault}>
              <RefreshCw size={14} /> Fill Default
            </button>
          </div>
          <textarea
            className="prompt-textarea"
            value={activeTab === 'app' ? data.appPrompt : data.websitePrompt}
            onChange={(e) =>
              setData((prev) =>
                activeTab === 'app'
                  ? { ...prev, appPrompt: e.target.value }
                  : { ...prev, websitePrompt: e.target.value }
              )
            }
            placeholder={`Enter the system prompt for ${activeTab === 'app' ? 'mobile app' : 'website'} generation…`}
            rows={22}
          />
        </div>
      )}

      <div className="action-row">
        {saved && (
          <span className="saved-badge">
            <CheckCircle size={16} /> Saved successfully!
          </span>
        )}
        <button className="primary-btn" onClick={handleSave} disabled={saving || loading}>
          <Save size={16} />
          {saving ? 'Saving…' : 'Save to Firebase'}
        </button>
      </div>

      <div className="info-banner">
        <span className="info-dot" />
        Changes are live immediately — the Android app fetches from <strong>config/systemPrompts</strong> on every generation.
      </div>
    </div>
  );
}
