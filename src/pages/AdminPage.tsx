import React, { useState, useEffect } from 'react';
import { 
  Check, X, RefreshCw, Plus, Trash2, Edit2, Save, Link, 
  Settings, List, ExternalLink, AlertCircle, CheckCircle, 
  Clock, Play, Pause, Download, Upload, Database, Globe,
  ChevronDown, ChevronUp, Eye, EyeOff, Sparkles
} from 'lucide-react';

interface Source {
  id: string;
  name: string;
  type: 'directory' | 'github' | 'custom';
  url?: string;
  repo?: string;
  enabled: boolean;
}

interface ScrapeRule {
  id: string;
  name: string;
  pattern: string;
  type: 'xpath' | 'regex' | 'css' | 'json';
  enabled: boolean;
  primaryCategory: string;
  secondaryCategory: string;
  keywords?: string[];
  includeTags?: string[];
  excludeTags?: string[];
  contentType?: 'video' | 'image' | 'all';
}

interface PendingItem {
  id: string;
  title: { zh: string; en: string };
  description: { zh: string; en: string };
  primaryCategory: string;
  secondaryCategory: string;
  downloadUrl: string;
  source: string;
  sourceUrl: string;
  metrics: { stars: number; forks: number; trendScore: number };
  scrapedAt: string;
  linkStatus?: 'valid' | 'invalid' | 'checking' | 'unknown';
}

const PRIMARY_CATEGORIES = [
  '智能母体', '跨境电商', '视频电商', '自媒体运行',
  '广告营销推广', 'AI 硬件', '创意设计', '社群福利'
];

const SECONDARY_CATEGORIES = [
  { label: '智能体', value: 'agent' },
  { label: '技能', value: 'skill' },
  { label: 'MCP协议', value: 'mcp' },
  { label: '提示词', value: 'prompt' },
  { label: '开源软件', value: 'opensource_soft' }
];

type TabType = 'sources' | 'rules' | 'review' | 'settings';

function ManualEditItem({ item, onSave }: { item: PendingItem; onSave: (item: any) => void }) {
  const [edit, setEdit] = useState(false);
  const [data, setData] = useState({
    titleZh: item.title.zh,
    titleEn: item.title.en,
    descZh: item.description.zh,
    descEn: item.description.en,
    url: item.downloadUrl,
    primary: item.primaryCategory,
    secondary: item.secondaryCategory
  });

  if (!edit) {
    return (
      <div className="bg-gray-700 p-4 rounded-lg flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="font-bold truncate">{item.title.zh}</div>
          <div className="text-sm text-gray-400 truncate">{item.downloadUrl}</div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-400">{item.primaryCategory}</span>
          <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400">{item.secondaryCategory}</span>
          <button onClick={() => setEdit(true)} className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded">
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-700 p-4 rounded-lg space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400">名称(中文)</label>
          <input
            value={data.titleZh}
            onChange={e => setData({ ...data, titleZh: e.target.value })}
            className="w-full px-3 py-2 bg-gray-600 rounded text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400">名称(英文)</label>
          <input
            value={data.titleEn}
            onChange={e => setData({ ...data, titleEn: e.target.value })}
            className="w-full px-3 py-2 bg-gray-600 rounded text-sm"
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-400">链接</label>
        <input
          value={data.url}
          onChange={e => setData({ ...data, url: e.target.value })}
          className="w-full px-3 py-2 bg-gray-600 rounded text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-gray-400">简介</label>
        <textarea
          value={data.descZh}
          onChange={e => setData({ ...data, descZh: e.target.value })}
          className="w-full px-3 py-2 bg-gray-600 rounded text-sm"
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400">一级分类</label>
          <select
            value={data.primary}
            onChange={e => setData({ ...data, primary: e.target.value })}
            className="w-full px-3 py-2 bg-gray-600 rounded text-sm"
          >
            {PRIMARY_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400">二级分类</label>
          <select
            value={data.secondary}
            onChange={e => setData({ ...data, secondary: e.target.value })}
            className="w-full px-3 py-2 bg-gray-600 rounded text-sm"
          >
            {SECONDARY_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            onSave({
              title: { zh: data.titleZh, en: data.titleEn },
              description: { zh: data.descZh, en: data.descEn },
              downloadUrl: data.url,
              primaryCategory: data.primary,
              secondaryCategory: data.secondary
            });
            setEdit(false);
          }}
          className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded font-bold flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> 保存
        </button>
        <button
          onClick={() => setEdit(false)}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded font-bold"
        >
          取消
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('sources');
  const [sources, setSources] = useState<Source[]>([]);
  const [rules, setRules] = useState<ScrapeRule[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);
  const [validatingLinks, setValidatingLinks] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [editingRule, setEditingRule] = useState<ScrapeRule | null>(null);

  // New source/rule form
  const [newSource, setNewSource] = useState<Partial<Source>>({ type: 'directory', enabled: true });
  const [newRule, setNewRule] = useState<Partial<ScrapeRule>>({ type: 'xpath', enabled: true });
  
  // AI natural language rule generation
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  
  // Selected category for rules
  const [selectedPrimary, setSelectedPrimary] = useState('创意设计');
  const [selectedSecondary, setSelectedSecondary] = useState('opensource_soft');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sourcesRes, rulesRes, pendingRes] = await Promise.all([
        fetch('/api/config/sources').then(r => r.json()).catch(() => ({ sources: [] })),
        fetch('/api/config/rules').then(r => r.json()).catch(() => ({ rules: [] })),
        fetch('/api/review/pending').then(r => r.json()).catch(() => ({ pending: [] }))
      ]);
      setSources(sourcesRes.sources || []);
      setRules(rulesRes.rules || []);
      setPendingItems(pendingRes.pending || []);
    } catch (e) {
      console.error('Load data error:', e);
    }
    setLoading(false);
  };

  const validateLinks = async () => {
    setValidatingLinks(true);
    const validated = await Promise.all(
      pendingItems.map(async (item) => {
        try {
          const res = await fetch(`/api/validate-link?url=${encodeURIComponent(item.downloadUrl)}`);
          const data = await res.json();
          return { ...item, linkStatus: data.valid ? 'valid' as const : 'invalid' as const };
        } catch {
          return { ...item, linkStatus: 'invalid' as const };
        }
      })
    );
    setPendingItems(validated);
    setValidatingLinks(false);
  };

  const handleApprove = async (id: string) => {
    await fetch(`/api/review/${id}/approve`, { method: 'POST' });
    setPendingItems(pendingItems.filter(i => i.id !== id));
    setSelectedItem(null);
  };

  const handleReject = async (id: string) => {
    await fetch(`/api/review/${id}/reject`, { method: 'POST' });
    setPendingItems(pendingItems.filter(i => i.id !== id));
    setSelectedItem(null);
  };

  const addSource = () => {
    if (!newSource.name) {
      alert('请输入名称');
      return;
    }
    const urlOrRepo = newSource.type === 'github' ? newSource.repo : newSource.url;
    if (!urlOrRepo) {
      alert('请输入URL或仓库地址');
      return;
    }
    const source: Source = {
      id: `src-${Date.now()}`,
      name: newSource.name,
      type: newSource.type as 'directory' | 'github' | 'custom',
      url: newSource.type === 'github' ? undefined : newSource.url,
      repo: newSource.type === 'github' ? newSource.repo : undefined,
      enabled: true
    };
    setSources([...sources, source]);
    setNewSource({ type: 'directory', enabled: true });
  };

  const deleteSource = (id: string) => {
    setSources(sources.filter(s => s.id !== id));
  };

  const toggleSource = (id: string) => {
    setSources(sources.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const addRule = () => {
    if (!newRule.name || !newRule.pattern) return;
    const rule: ScrapeRule = {
      id: `rule-${Date.now()}`,
      name: newRule.name,
      pattern: newRule.pattern,
      type: newRule.type as 'xpath' | 'regex' | 'css' | 'json',
      enabled: true,
      primaryCategory: newRule.primaryCategory || selectedPrimary,
      secondaryCategory: newRule.secondaryCategory || selectedSecondary,
      keywords: newRule.keywords || [],
      includeTags: newRule.includeTags || [],
      excludeTags: newRule.excludeTags || [],
      contentType: newRule.contentType || 'all'
    };
    setRules([...rules, rule]);
    setNewRule({ type: 'regex', enabled: true, primaryCategory: selectedPrimary, secondaryCategory: selectedSecondary });
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const saveConfig = async () => {
    await fetch('/api/config/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sources })
    });
    await fetch('/api/config/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rules })
    });
    alert('✅ 配置已保存');
  };

  const generateRuleWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    
    try {
      const prompt = `用户需求: ${aiPrompt}
      
请根据用户需求生成采集筛选规则，返回JSON格式：
{
  "name": "规则名称",
  "keywords": ["关键词1", "关键词2"],
  "includeTags": ["要包含的标签"],
  "excludeTags": ["要排除的标签"],
  "category": "一级分类",
  "type": "agent/skill/mcp/prompt/opensource_soft",
  "description": "规则说明"
}

用户可能的意图：
- "自动发布文章" → 关键词: 发布, 文章, 小红书, 博客
- "自动剪辑视频" → 关键词: 视频, 剪辑, 抖音, YouTube
- "跨境电商" → 分类: 跨境电商
- "MCP协议" → 类型: mcp

只返回JSON，不要其他文字。格式如下：
{
  "name": "自动发布文章技能",
  "keywords": ["发布", "文章", "小红书", "博客"],
  "includeTags": ["内容创作"],
  "excludeTags": [],
  "category": "自媒体运行",
  "type": "skill",
  "description": "采集能自动发布文章的技能"
}`;

      const res = await fetch('/api/ai/generate-rule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      if (res.ok) {
        const data = await res.json();
        setAiResult(data.result || '');
      } else {
        alert('AI 生成失败，请重试');
      }
    } catch (e) {
      alert('请求失败: ' + String(e));
    }
    
    setAiGenerating(false);
  };

  const runScrape = async () => {
    const confirmed = confirm('确认执行采集任务？');
    if (!confirmed) return;
    try {
      const res = await fetch('/api/scrape/run', { method: 'POST' });
      if (res.ok) {
        alert('✅ 采集任务已启动');
        loadData();
      }
    } catch {
      alert('❌ 采集失败');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-black flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-500" />
            管理中心
          </h1>
          <div className="flex gap-2">
            {/* 保存配置按钮 - 将数据源和规则保存到本地文件 */}
            <button 
              onClick={saveConfig}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold flex items-center gap-2"
              title="保存数据源和规则配置到本地文件"
            >
              <Save className="w-4 h-4" /> 保存配置
            </button>
            {/* 执行采集按钮 - 运行采集脚本从配置的数据源获取内容 */}
            <button 
              onClick={runScrape}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold flex items-center gap-2"
              title="运行采集脚本，从已配置的数据源抓取资源"
            >
              <Download className="w-4 h-4" /> 执行采集
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto flex">
          {[
            { id: 'sources', label: '数据源', icon: Database },
            { id: 'rules', label: '采集规则', icon: Settings },
            { id: 'review', label: '审核', icon: List },
            { id: 'settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-6 py-3 font-bold flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-blue-500 text-blue-400 bg-gray-700/50' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab.id === 'sources' && <Database className="w-4 h-4" />}
              {tab.id === 'rules' && <Settings className="w-4 h-4" />}
              {tab.id === 'review' && <List className="w-4 h-4" />}
              {tab.label || '设置'}
              {tab.id === 'review' && pendingItems.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingItems.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Sources Tab */}
        {/* 数据源：配置要采集的网站或GitHub仓库，采集脚本会从这些来源获取内容 */}
        {activeTab === 'sources' && (
          <div className="space-y-6">
            {/* 说明文字 */}
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 text-sm text-blue-200">
              <p className="font-bold mb-2">💡 说明 - 数据源配置示例</p>
              <ul className="list-disc list-inside space-y-1 text-blue-100">
                <li><b>目录网站</b>：如 https://skills.sh、https://openclawdir.com</li>
                <li><b>GitHub仓库</b>：如 composiohq/awesome-claude-skills</li>
                <li><b>自定义URL</b>：任何包含资源链接的网页</li>
              </ul>
              <p className="mt-2 text-blue-300">填写示例：名称填「Claude技能」，类型选「GitHub」，地址填「composiohq/awesome-claude-skills」</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-500" />
                添加数据源
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="名称"
                  value={newSource.name || ''}
                  onChange={e => setNewSource({ ...newSource, name: e.target.value })}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                />
                <select
                  value={newSource.type || 'directory'}
                  onChange={e => setNewSource({ ...newSource, type: e.target.value as any })}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                >
                  <option value="directory">目录网站</option>
                  <option value="github">GitHub 仓库</option>
                  <option value="custom">自定义 URL</option>
                </select>
                <input
                  type="text"
                  placeholder={newSource.type === 'github' ? 'owner/repo' : 'URL'}
                  value={newSource.url || newSource.repo || ''}
                  onChange={e => setNewSource({ 
                    ...newSource, 
                    ...(newSource.type === 'github' ? { repo: e.target.value } : { url: e.target.value })
                  })}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                />
                <button
                  onClick={addSource}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> 添加
                </button>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="bg-gray-700 px-6 py-3 font-bold flex items-center justify-between">
                <span>已配置的数据源 ({sources.length})</span>
                <span className="text-sm text-gray-400">
                  启用: {sources.filter(s => s.enabled).length}
                </span>
              </div>
              <div className="divide-y divide-gray-700">
                {sources.map(source => (
                  <div key={source.id} className="p-4 flex items-center justify-between hover:bg-gray-700/30">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleSource(source.id)}
                        className={`w-10 h-6 rounded-full transition-colors ${
                          source.enabled ? 'bg-green-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          source.enabled ? 'translate-x-5' : 'translate-x-1'
                        }`} />
                      </button>
                      <div>
                        <div className="font-bold">{source.name}</div>
                        <div className="text-sm text-gray-400 flex items-center gap-2">
                          {source.type === 'github' ? (
                            <><Globe className="w-3 h-3" /> {source.repo}</>
                          ) : (
                            <><Link className="w-3 h-3" /> {source.url}</>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        source.type === 'github' ? 'bg-purple-500/20 text-purple-400' :
                        source.type === 'directory' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {source.type === 'github' ? 'GitHub' : source.type === 'directory' ? '目录' : '自定义'}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteSource(source.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {sources.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    暂无数据源，请在上方添加
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rules Tab */}
        {/* 采集规则：为每个分类配置采集规则，包括关键词筛选、内容类型（视频/图文）等 */}
        {activeTab === 'rules' && (
          <div className="space-y-6">
            {/* 说明文字 */}
            <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4 text-sm text-purple-200">
              <p className="font-bold mb-2">💡 说明 - 采集规则配置示例</p>
              <ul className="list-disc list-inside space-y-1 text-purple-100">
                <li><b>内容类型</b>：选择「仅视频」只采集YouTube/Bilibili链接，「仅图文」只采集图片和文字</li>
                <li><b>关键词</b>：在AI生成中描述如「采集小红书自动发布的技能」</li>
                <li><b>手动添加</b>：匹配模式填写正则表达式，如 <code className="bg-purple-800 px-1">github\.com/[\w-]+/[\w-]+</code></li>
              </ul>
              <p className="mt-2 text-purple-300">示例：选择「AI硬件」+「开源软件」，内容类型选「仅视频」，AI输入「采集AI硬件评测视频」</p>
            </div>

            {/* 分类选择 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-500" />
                选择要配置的分类
              </h2>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-2">一级分类</label>
                  <select
                    value={selectedPrimary}
                    onChange={e => setSelectedPrimary(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                  >
                    {PRIMARY_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-2">二级分类</label>
                  <select
                    value={selectedSecondary}
                    onChange={e => setSelectedSecondary(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                  >
                    {SECONDARY_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 当前分类的规则 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <List className="w-5 h-5 text-green-500" />
                  {selectedPrimary} - {SECONDARY_CATEGORIES.find(c => c.value === selectedSecondary)?.label} 的规则
                </h2>
                <span className="text-sm text-gray-400">
                  共 {rules.filter(r => r.primaryCategory === selectedPrimary && r.secondaryCategory === selectedSecondary).length} 条规则
                </span>
              </div>
              
              {/* AI 生成 */}
              <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-4 mb-4">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  AI 智能生成规则
                </h3>
                <p className="text-gray-400 text-sm mb-3">用自然语言描述你想采集什么内容</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={`例如：只采集能自动发布小红书、抖音视频的${SECONDARY_CATEGORIES.find(c => c.value === selectedSecondary)?.label}`}
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm"
                  />
                  <button
                    onClick={generateRuleWithAI}
                    disabled={aiGenerating || !aiPrompt.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-bold text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {aiGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    AI生成
                  </button>
                </div>
                
                {aiResult && (
                  <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
                    <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap">{aiResult}</pre>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => {
                          try {
                            const parsed = JSON.parse(aiResult);
                            setNewRule({ 
                              name: parsed.name, 
                              pattern: parsed.pattern || '', 
                              type: (parsed.type || 'regex') as any,
                              primaryCategory: selectedPrimary,
                              secondaryCategory: selectedSecondary,
                              keywords: parsed.keywords || [],
                              includeTags: parsed.includeTags || [],
                              excludeTags: parsed.excludeTags || []
                            });
                            setAiResult('');
                          } catch { alert('格式解析失败'); }
                        }}
                        className="px-3 py-1 bg-green-600 rounded text-sm font-bold"
                      >
                        应用
                      </button>
                      <button onClick={() => setAiResult('')} className="px-3 py-1 bg-gray-600 rounded text-sm">
                        关闭
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 手动添加 */}
              <div className="mb-4">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-green-500" />
                  手动添加
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <input
                    type="text"
                    placeholder="规则名称"
                    value={newRule.name || ''}
                    onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm"
                  />
                  <select
                    value={newRule.type || 'regex'}
                    onChange={e => setNewRule({ ...newRule, type: e.target.value as any })}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm"
                    title="正则=匹配文字模式, CSS=网页元素选择, XPath=精准定位元素, JSON=解析JSON数据"
                  >
                    <option value="regex">正则 (文字匹配)</option>
                    <option value="xpath">XPath (精准定位)</option>
                    <option value="css">CSS (网页元素)</option>
                    <option value="json">JSON (数据解析)</option>
                  </select>
                  <select
                    value={newRule.contentType || 'all'}
                    onChange={e => setNewRule({ ...newRule, contentType: e.target.value as any })}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm"
                  >
                    <option value="all">所有内容</option>
                    <option value="video">仅视频</option>
                    <option value="image">仅图文</option>
                  </select>
                  <input
                    type="text"
                    placeholder="匹配模式"
                    value={newRule.pattern || ''}
                    onChange={e => setNewRule({ ...newRule, pattern: e.target.value })}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => {
                      setNewRule({ 
                        ...newRule, 
                        primaryCategory: selectedPrimary, 
                        secondaryCategory: selectedSecondary 
                      });
                      addRule();
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 规则列表 */}
              <div className="space-y-2">
                {rules.filter(r => r.primaryCategory === selectedPrimary && r.secondaryCategory === selectedSecondary).map(rule => (
                  <div key={rule.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleRule(rule.id)}
                        className={`w-8 h-5 rounded-full ${rule.enabled ? 'bg-green-500' : 'bg-gray-600'}`}
                      >
                        <div className={`w-3 h-3 bg-white rounded-full ${rule.enabled ? 'translate-x-3' : 'translate-x-1'}`} />
                      </button>
                      <div>
                        <div className="font-bold text-sm">{rule.name}</div>
                        <div className="text-gray-400 text-xs font-mono">{rule.pattern}</div>
                      </div>
                    </div>
                    <button onClick={() => deleteRule(rule.id)} className="p-1 text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {rules.filter(r => r.primaryCategory === selectedPrimary && r.secondaryCategory === selectedSecondary).length === 0 && (
                  <div className="text-center text-gray-500 py-4">暂无规则，请添加</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Review Tab */}
        {/* 审核：查看采集到的资源，验证链接有效性，批准或拒绝入库 */}
        {activeTab === 'review' && (
          <div className="space-y-6">
            {/* 说明文字 */}
            <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 text-sm text-green-200">
              <p className="font-bold mb-2">💡 说明 - 审核操作</p>
              <ul className="list-disc list-inside space-y-1 text-green-100">
                <li><b>验证链接</b>：检查资源的URL是否可访问（绿色=有效，红色=无效）</li>
                <li><b>批准</b>：资源入库网站，审核后需要运行「npm run build」再推送更新</li>
                <li><b>拒绝</b>：删除该资源</li>
                <li><b>左侧列表</b>：点击可查看资源详情，包括链接、简介、分类</li>
              </ul>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold">待审核资源 ({pendingItems.length})</h2>
                <button
                  onClick={validateLinks}
                  disabled={validatingLinks || pendingItems.length === 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {validatingLinks ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Link className="w-4 h-4" />
                  )}
                  验证链接
                </button>
              </div>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> 刷新
              </button>
            </div>

            {pendingItems.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">暂无待审核内容</h3>
                <p className="text-gray-400">所有资源已审核完成，或请先执行采集任务</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List */}
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                  <div className="bg-gray-700 px-4 py-3 font-bold">
                    资源列表
                  </div>
                  <div className="max-h-[70vh] overflow-y-auto divide-y divide-gray-700">
                    {pendingItems.map(item => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`p-4 cursor-pointer hover:bg-gray-700/50 transition-colors ${
                          selectedItem?.id === item.id ? 'bg-blue-900/30 border-l-2 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold truncate flex-1">{item.title.zh}</span>
                          {item.linkStatus && (
                            item.linkStatus === 'valid' ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : item.linkStatus === 'invalid' ? (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            ) : (
                              <Clock className="w-4 h-4 text-yellow-500" />
                            )
                          )}
                        </div>
                        <div className="text-xs text-gray-400 truncate">{item.source}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detail */}
                <div className="lg:col-span-2 bg-gray-800 rounded-lg overflow-hidden">
                  {selectedItem ? (
                    <>
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                        <h3 className="text-xl font-black mb-1">{selectedItem.title.zh}</h3>
                        <p className="text-blue-200 text-sm mb-3">{selectedItem.title.en}</p>
                        <a
                          href={selectedItem.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg text-sm hover:bg-white/30"
                        >
                          <ExternalLink className="w-4 h-4" />
                          访问链接
                        </a>
                      </div>

                      <div className="p-6 space-y-4">
                        {/* 简介 */}
                        <div>
                          <h4 className="font-bold text-gray-400 mb-2">简介</h4>
                          <p className="bg-gray-700 p-4 rounded-lg">
                            {selectedItem.description.zh || selectedItem.description.en || '暂无描述'}
                          </p>
                        </div>

                        {/* 链接状态 */}
                        <div className="flex items-center gap-4">
                          <span className="text-gray-400">链接状态:</span>
                          {selectedItem.linkStatus === 'valid' && (
                            <span className="flex items-center gap-1 text-green-400">
                              <CheckCircle className="w-4 h-4" /> 可访问
                            </span>
                          )}
                          {selectedItem.linkStatus === 'invalid' && (
                            <span className="flex items-center gap-1 text-red-400">
                              <AlertCircle className="w-4 h-4" /> 链接无效
                            </span>
                          )}
                          {!selectedItem.linkStatus && (
                            <span className="flex items-center gap-1 text-gray-400">
                              <Clock className="w-4 h-4" /> 未验证
                            </span>
                          )}
                        </div>

                        {/* 分类 */}
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 rounded bg-purple-500/20 text-purple-400">
                            {selectedItem.primaryCategory}
                          </span>
                          <span className="px-3 py-1 rounded bg-blue-500/20 text-blue-400">
                            {SECONDARY_CATEGORIES.find(c => c.value === selectedItem.secondaryCategory)?.label || selectedItem.secondaryCategory}
                          </span>
                        </div>

                        {/* 来源 */}
                        <div className="text-sm text-gray-400">
                          来源: {selectedItem.source} | 采集时间: {new Date(selectedItem.scrapedAt).toLocaleString('zh-CN')}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4">
                          <button
                            onClick={() => handleApprove(selectedItem.id)}
                            className="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold flex items-center justify-center gap-2"
                          >
                            <Check className="w-5 h-5" /> 批准入库
                          </button>
                          <button
                            onClick={() => handleReject(selectedItem.id)}
                            className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold flex items-center justify-center gap-2"
                          >
                            <X className="w-5 h-5" /> 拒绝
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-12 text-center text-gray-500">
                      点击左侧列表查看详情
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* 采集设置 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">采集设置</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">每日采集上限</label>
                  <input
                    type="number"
                    defaultValue={20}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Star 最小值</label>
                  <input
                    type="number"
                    defaultValue={5}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">每个分类最大数量</label>
                  <input
                    type="number"
                    defaultValue={20}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">采集间隔(秒)</label>
                  <input
                    type="number"
                    defaultValue={5}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* 分类配置 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">分类配置</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PRIMARY_CATEGORIES.map(cat => (
                  <div key={cat} className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {cat}
                  </div>
                ))}
              </div>
            </div>

            {/* 批量上传 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-500" />
                  批量上传资源
                </h2>
                <button
                  onClick={() => {
                    const template = `名称,链接,简介,一级分类,二级分类
Daytona,https://github.com/daytonaio/daytona,AI代码生成运行环境,创意设计,开源软件
Claude Code,https://claude.com/code,AI编程助手,创意设计,技能`;
                    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = '资源导入模板.csv';
                    a.click();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  下载模板
                </button>
              </div>
              
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    const text = await file.text();
                    let newItems: any[] = [];
                    
                    if (file.name.endsWith('.csv')) {
                      const lines = text.split('\n').filter(l => l.trim());
                      const headers = lines[0].split(',').map(h => h.trim());
                      
                      for (let i = 1; i < lines.length; i++) {
                        const values = lines[i].split(',').map(v => v.trim());
                        if (values.length >= 3) {
                          newItems.push({
                            id: `manual-${Date.now()}-${i}`,
                            title: { zh: values[0], en: values[0] },
                            description: { zh: values[2] || '', en: values[2] || '' },
                            primaryCategory: values[3] || '创意设计',
                            secondaryCategory: values[4] || 'opensource_soft',
                            downloadUrl: values[1] || '',
                            source: '手动上传',
                            sourceUrl: values[1] || '',
                            metrics: { stars: 0, forks: 0, trendScore: 0 },
                            scrapedAt: new Date().toISOString(),
                            status: 'pending'
                          });
                        }
                      }
                    } else if (file.name.endsWith('.json')) {
                      const data = JSON.parse(text);
                      newItems = Array.isArray(data) ? data : data.resources || [];
                    }
                    
                    if (newItems.length > 0) {
                      const confirmed = confirm(`确认导入 ${newItems.length} 条资源？`);
                      if (confirmed) {
                        const res = await fetch('/api/review/batch-add', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ items: newItems })
                        });
                        if (res.ok) {
                          alert('✅ 导入成功');
                          loadData();
                        } else {
                          alert('❌ 导入失败');
                        }
                      }
                    }
                  }}
                  className="hidden"
                  id="batch-upload"
                />
                <label htmlFor="batch-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400">点击上传 CSV 或 JSON 文件</p>
                  <p className="text-gray-500 text-sm mt-2">支持 CSV 和 JSON 格式</p>
                </label>
              </div>
            </div>

            {/* 手动编辑待审核内容 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-yellow-500" />
                手动编辑待审核内容
              </h2>
              
              {pendingItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">暂无待审核内容</p>
              ) : (
                <div className="space-y-4">
                  {pendingItems.slice(0, 10).map(item => (
                    <ManualEditItem 
                      key={item.id} 
                      item={item} 
                      onSave={async (updated) => {
                        await fetch(`/api/review/${item.id}/update`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(updated)
                        });
                        loadData();
                      }}
                    />
                  ))}
                  {pendingItems.length > 10 && (
                    <p className="text-gray-500 text-center">还有 {pendingItems.length - 10} 条...</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
