import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, loadEnv} from 'vite';

function generateSimpleRule(prompt: string): object {
  const lower = prompt.toLowerCase();
  if (lower.includes('github')) {
    return {
      name: "GitHub仓库采集",
      type: "regex",
      pattern: "\\|\\s*([^|]+)\\s*\\|\\s*(https?://[^|]+)\\s*\\|",
      description: "采集GitHub README表格中的项目"
    };
  }
  return {
    name: "通用链接采集",
    type: "regex",
    pattern: "href=[\"']([^\"']+)[\"'][^>]*>([^<]+)<",
    description: "通用网页链接采集"
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'serve-knowledge-json',
        configureServer(server) {
          server.middlewares.use('/api/knowledge.json', async (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            
            try {
              let data;
              try {
                data = fs.readFileSync(path.join(__dirname, 'src/data/approved-resources.json'), 'utf-8');
              } catch {
                const { MOCK_RESOURCES } = await server.ssrLoadModule('/src/data/resources.ts');
                data = JSON.stringify(MOCK_RESOURCES);
              }
              const resources = JSON.parse(data);
              const simplifiedData = (resources.resources || resources).map((item: any) => ({
                id: item.id,
                name: item.title?.zh || item.title?.en || item.title || '',
                nameEn: item.title?.en || item.title?.zh || item.title || '',
                desc: item.description?.zh || item.description?.en || item.description || '',
                descEn: item.description?.en || item.description?.zh || item.description || '',
                category: item.primaryCategory || '',
                type: item.secondaryCategory || '',
                url: item.downloadUrl || item.url || '',
                version: item.version || '1.0.0',
                tags: item.tags || item.capabilityTags || [],
                imageUrl: item.imageUrl || '',
                videoUrl: item.videoPreviewUrl || '',
                externalLinks: item.externalLinks || []
              }));
              res.end(JSON.stringify(simplifiedData));
            } catch (e) {
              res.end(JSON.stringify({ error: "Failed to load resources" }));
            }
          });

          server.middlewares.use('/api/review/pending', async (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            try {
              const data = fs.readFileSync(path.join(__dirname, 'src/data/pending-review.json'), 'utf-8');
              res.end(data);
            } catch (e) {
              res.end(JSON.stringify({ pending: [], total: 0 }));
            }
          });

          server.middlewares.use('/api/review/approved', async (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            try {
              const data = fs.readFileSync(path.join(__dirname, 'src/data/approved-resources.json'), 'utf-8');
              res.end(data);
            } catch (e) {
              res.end(JSON.stringify({ resources: [] }));
            }
          });

          server.middlewares.use('/api/validate-link', async (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            const url = req.url?.split('?url=')[1];
            if (!url) {
              res.end(JSON.stringify({ valid: false, error: 'Missing URL' }));
              return;
            }
            const decodedUrl = decodeURIComponent(url);
            try {
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 10000);
              const response = await fetch(decodedUrl, { 
                method: 'HEAD',
                signal: controller.signal,
                redirect: 'follow'
              });
              clearTimeout(timeout);
              const valid = response.ok || response.status === 405;
              res.end(JSON.stringify({ 
                valid, 
                status: response.status,
                statusText: response.statusText
              }));
            } catch (e) {
              res.end(JSON.stringify({ 
                valid: false, 
                error: String(e)
              }));
            }
          });

          server.middlewares.use('/api/validate-link', async (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            const url = req.url?.split('?url=')[1];
            if (!url) {
              res.end(JSON.stringify({ valid: false, error: 'Missing URL' }));
              return;
            }
            const decodedUrl = decodeURIComponent(url);
            try {
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 10000);
              const response = await fetch(decodedUrl, { 
                method: 'HEAD',
                signal: controller.signal,
                redirect: 'follow'
              });
              clearTimeout(timeout);
              const valid = response.ok || response.status === 405;
              res.end(JSON.stringify({ 
                valid, 
                status: response.status,
                statusText: response.statusText
              }));
            } catch (e) {
              res.end(JSON.stringify({ 
                valid: false, 
                error: String(e)
              }));
            }
          });

          server.middlewares.use('/api/review/:id/approve', async (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            try {
              const pendingPath = path.join(__dirname, 'src/data/pending-review.json');
              const approvedPath = path.join(__dirname, 'src/data/approved-resources.json');
              const pendingData = JSON.parse(fs.readFileSync(pendingPath, 'utf-8'));
              const approvedData = JSON.parse(fs.readFileSync(approvedPath, 'utf-8'));
              const itemId = req.url?.split('/').pop() || '';
              const itemIndex = pendingData.pending.findIndex((item: any) => item.id === itemId);
              if (itemIndex === -1) {
                res.end(JSON.stringify({ error: 'Item not found' }));
                return;
              }
              const item = pendingData.pending[itemIndex];
              item.status = 'approved';
              item.approvedAt = new Date().toISOString();
              if (!approvedData.resources) approvedData.resources = [];
              approvedData.resources.push(item);
              pendingData.pending.splice(itemIndex, 1);
              fs.writeFileSync(pendingPath, JSON.stringify(pendingData, null, 2));
              fs.writeFileSync(approvedPath, JSON.stringify(approvedData, null, 2));
              res.end(JSON.stringify({ success: true }));
            } catch (e) {
              res.end(JSON.stringify({ error: 'Failed to approve' }));
            }
          });

          server.middlewares.use('/api/review/:id/reject', async (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            try {
              const pendingPath = path.join(__dirname, 'src/data/pending-review.json');
              const pendingData = JSON.parse(fs.readFileSync(pendingPath, 'utf-8'));
              const itemId = req.url?.split('/').pop() || '';
              const itemIndex = pendingData.pending.findIndex((item: any) => item.id === itemId);
              if (itemIndex === -1) {
                res.end(JSON.stringify({ error: 'Item not found' }));
                return;
              }
              pendingData.pending.splice(itemIndex, 1);
              fs.writeFileSync(pendingPath, JSON.stringify(pendingData, null, 2));
              res.end(JSON.stringify({ success: true }));
            } catch (e) {
              res.end(JSON.stringify({ error: 'Failed to reject' }));
            }
          });

          server.middlewares.use('/api/review/approve-all', async (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            try {
              const pendingPath = path.join(__dirname, 'src/data/pending-review.json');
              const approvedPath = path.join(__dirname, 'src/data/approved-resources.json');
              const pendingData = JSON.parse(fs.readFileSync(pendingPath, 'utf-8'));
              const approvedData = JSON.parse(fs.readFileSync(approvedPath, 'utf-8'));
              const approved = pendingData.pending.map((item: any) => ({
                ...item, status: 'approved', approvedAt: new Date().toISOString()
              }));
              if (!approvedData.resources) approvedData.resources = [];
              approvedData.resources.push(...approved);
              pendingData.pending = [];
              fs.writeFileSync(pendingPath, JSON.stringify(pendingData, null, 2));
              fs.writeFileSync(approvedPath, JSON.stringify(approvedData, null, 2));
              res.end(JSON.stringify({ success: true, count: approved.length }));
            } catch (e) {
              res.end(JSON.stringify({ error: 'Failed to approve all' }));
            }
          });

          server.middlewares.use('/api/config/sources', async (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            if (req.method === 'GET') {
              try {
                const data = fs.readFileSync(path.join(__dirname, 'config/sources.json'), 'utf-8');
                res.end(data);
              } catch (e) {
                res.end(JSON.stringify({ sources: [] }));
              }
            } else if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => body += chunk);
              req.on('end', () => {
                try {
                  const configPath = path.join(__dirname, 'config/sources.json');
                  const existing = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                  const newData = JSON.parse(body);
                  const merged = { ...existing, ...newData };
                  fs.writeFileSync(configPath, JSON.stringify(merged, null, 2));
                  res.end(JSON.stringify({ success: true }));
                } catch (e) {
                  res.end(JSON.stringify({ error: 'Failed to save' }));
                }
              });
            }
          });

          server.middlewares.use('/api/config/rules', async (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            if (req.method === 'GET') {
              try {
                const data = fs.readFileSync(path.join(__dirname, 'config/rules.json'), 'utf-8');
                res.end(data);
              } catch (e) {
                res.end(JSON.stringify({ rules: [] }));
              }
            } else if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => body += chunk);
              req.on('end', () => {
                try {
                  const configPath = path.join(__dirname, 'config/rules.json');
                  let existing = { rules: [] };
                  try { existing = JSON.parse(fs.readFileSync(configPath, 'utf-8')); } catch {}
                  const newData = JSON.parse(body);
                  const merged = { ...existing, ...newData };
                  fs.writeFileSync(configPath, JSON.stringify(merged, null, 2));
                  res.end(JSON.stringify({ success: true }));
                } catch (e) {
                  res.end(JSON.stringify({ error: 'Failed to save' }));
                }
              });
            }
          });

          server.middlewares.use('/api/review/batch-add', async (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => body += chunk);
              req.on('end', () => {
                try {
                  const pendingPath = path.join(__dirname, 'src/data/pending-review.json');
                  const pendingData = JSON.parse(fs.readFileSync(pendingPath, 'utf-8'));
                  const { items } = JSON.parse(body);
                  if (!pendingData.pending) pendingData.pending = [];
                  pendingData.pending.push(...items);
                  fs.writeFileSync(pendingPath, JSON.stringify(pendingData, null, 2));
                  res.end(JSON.stringify({ success: true, count: items.length }));
                } catch (e) {
                  res.end(JSON.stringify({ error: 'Failed to batch add' }));
                }
              });
            }
          });

          server.middlewares.use('/api/review/:id/update', async (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => body += chunk);
              req.on('end', () => {
                try {
                  const pendingPath = path.join(__dirname, 'src/data/pending-review.json');
                  const pendingData = JSON.parse(fs.readFileSync(pendingPath, 'utf-8'));
                  const itemId = req.url?.split('/').pop();
                  const updates = JSON.parse(body);
                  const itemIndex = pendingData.pending?.findIndex((item: any) => item.id === itemId);
                  if (itemIndex !== undefined && itemIndex >= 0) {
                    pendingData.pending[itemIndex] = {
                      ...pendingData.pending[itemIndex],
                      title: updates.title || pendingData.pending[itemIndex].title,
                      description: updates.description || pendingData.pending[itemIndex].description,
                      downloadUrl: updates.downloadUrl || pendingData.pending[itemIndex].downloadUrl,
                      primaryCategory: updates.primaryCategory || pendingData.pending[itemIndex].primaryCategory,
                      secondaryCategory: updates.secondaryCategory || pendingData.pending[itemIndex].secondaryCategory
                    };
                    fs.writeFileSync(pendingPath, JSON.stringify(pendingData, null, 2));
                    res.end(JSON.stringify({ success: true }));
                  } else {
                    res.end(JSON.stringify({ error: 'Item not found' }));
                  }
                } catch (e) {
                  res.end(JSON.stringify({ error: 'Failed to update' }));
                }
              });
            }
          });

          server.middlewares.use('/api/ai/generate-rule', async (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => body += chunk);
              req.on('end', async () => {
                try {
                  const { prompt } = JSON.parse(body);
                  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
                  if (!GEMINI_API_KEY) {
                    const simpleRule = generateSimpleRule(prompt);
                    res.end(JSON.stringify({ result: JSON.stringify(simpleRule, null, 2) }));
                    return;
                  }
                  const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      contents: [{ parts: [{ text: prompt }] }],
                      generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
                    })
                  });
                  const aiData = await aiRes.json();
                  const result = aiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                  res.end(JSON.stringify({ result }));
                } catch (e) {
                  res.end(JSON.stringify({ error: 'AI generation failed' }));
                }
              });
            }
          });
        }
      }
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
