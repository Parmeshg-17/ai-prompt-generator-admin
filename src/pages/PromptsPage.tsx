import { useEffect, useState } from 'react';
import { getSystemPrompts, saveSystemPrompts } from '../lib/firebaseService';
import type { SystemPrompts } from '../lib/firebaseService';
import { FileText, Save, RefreshCw, CheckCircle, Cpu, Zap, Loader2, Key, Eye, EyeOff } from 'lucide-react';

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
  const [data, setData] = useState<SystemPrompts>({ appPrompt: '', websitePrompt: '', modelId: '', apiKey: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'app' | 'website'>('app');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    getSystemPrompts().then((p) => {
      setData(p);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await saveSystemPrompts({
      appPrompt: data.appPrompt,
      websitePrompt: data.websitePrompt,
      modelId: data.modelId,
      apiKey: data.apiKey,
    });
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

  const testModel = async () => {
    if (!data.modelId.trim()) {
      setTestResult({ ok: false, msg: 'Please enter a model ID first.' });
      setTimeout(() => setTestResult(null), 3000);
      return;
    }
    if (!data.apiKey.trim()) {
      setTestResult({ ok: false, msg: 'Please enter an API key first.' });
      setTimeout(() => setTestResult(null), 3000);
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.apiKey.trim()}`,
          'HTTP-Referer': window.location.origin,
        },
        body: JSON.stringify({
          model: data.modelId.trim(),
          messages: [{ role: 'user', content: 'Say "Hello" in one word.' }],
          max_tokens: 10,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const reply = json.choices?.[0]?.message?.content ?? 'No response';
        setTestResult({ ok: true, msg: `✓ Model responded: "${reply.slice(0, 80)}"` });
      } else {
        const err = await res.text();
        setTestResult({ ok: false, msg: `✗ Error ${res.status}: ${err.slice(0, 100)}` });
      }
    } catch (e: unknown) {
      setTestResult({ ok: false, msg: `✗ ${e instanceof Error ? e.message : 'Connection failed'}` });
    }
    setTesting(false);
    setTimeout(() => setTestResult(null), 6000);
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

      {/* AI Model + API Key Section */}
      <div className="model-section">
        <div className="model-header">
          <Cpu size={18} className="model-icon" />
          <div>
            <div className="model-title">AI Model (OpenRouter)</div>
            <div className="model-hint">
              Model ID from OpenRouter. Examples: google/gemini-2.0-flash-exp:free, openai/gpt-4o-mini, anthropic/claude-3.5-sonnet
            </div>
          </div>
        </div>
        <div className="model-input-row">
          <input
            className="model-input"
            value={data.modelId}
            onChange={(e) => setData((prev) => ({ ...prev, modelId: e.target.value }))}
            placeholder="e.g. z-ai/glm-4.5-air:free"
          />
          <button className="test-btn" onClick={testModel} disabled={testing}>
            {testing ? <Loader2 size={15} className="spin" /> : <Zap size={15} />}
            {testing ? 'Testing…' : 'Test Model'}
          </button>
        </div>

        {/* API Key */}
        <div className="api-key-row">
          <div className="api-key-label">
            <Key size={14} />
            <span>OpenRouter API Key</span>
          </div>
          <div className="model-input-row">
            <input
              className="model-input"
              type={showKey ? 'text' : 'password'}
              value={data.apiKey}
              onChange={(e) => setData((prev) => ({ ...prev, apiKey: e.target.value }))}
              placeholder="sk-or-v1-..."
            />
            <button className="ghost-btn" onClick={() => setShowKey(!showKey)} type="button">
              {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {testResult && (
          <div className={`test-result ${testResult.ok ? 'test-ok' : 'test-err'}`}>
            {testResult.msg}
          </div>
        )}
      </div>

      {/* Tabs */}
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
