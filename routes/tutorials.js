const express = require('express');
const router = express.Router();
const tutorials = require('../data/tutorialsData');

/**
 * Helper to escape HTML special characters
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate full HTML page for tutorials and code recipes
 */
function generateTutorialsHtml(baseUrl, activeSlug = null) {
  const categories = {};
  tutorials.forEach(t => {
    if (!categories[t.category]) {
      categories[t.category] = [];
    }
    categories[t.category].push(t);
  });

  const categoryListHtml = Object.keys(categories).map(catName => {
    const items = categories[catName].map(item => `
      <a href="#${item.slug}" class="nav-item ${activeSlug === item.slug ? 'active' : ''}" data-slug="${item.slug}">
        <span class="nav-dot"></span>
        <span class="nav-text">${escapeHtml(item.title)}</span>
      </a>
    `).join('');

    return `
      <div class="nav-group">
        <div class="nav-group-title">${escapeHtml(catName)}</div>
        <div class="nav-group-items">${items}</div>
      </div>
    `;
  }).join('');

  const articlesHtml = tutorials.map((item, index) => `
    <article id="${item.slug}" class="tutorial-article" data-title="${escapeHtml(item.title.toLowerCase())}" data-category="${escapeHtml(item.category.toLowerCase())}">
      <div class="article-header">
        <div class="breadcrumbs">
          <a href="/">Home</a> <span>/</span>
          <a href="/tutorials">Tutorials</a> <span>/</span>
          <span>${escapeHtml(item.category)}</span>
        </div>
        <div class="article-meta">
          <span class="badge badge-primary">${escapeHtml(item.badge)}</span>
          <span class="badge badge-muted">${escapeHtml(item.difficulty)}</span>
          <span class="badge badge-muted">${escapeHtml(item.readTime)}</span>
        </div>
        <h2 class="article-title">${index + 1}. ${escapeHtml(item.title)}</h2>
        <p class="article-desc">${escapeHtml(item.description)}</p>
      </div>

      <!-- Why This Pattern Callout -->
      <div class="callout callout-why">
        <div class="callout-header">
          <span class="callout-icon">💡</span>
          <strong>Architectural Rationale & Best Practice:</strong>
        </div>
        <p>${escapeHtml(item.whyThisPattern)}</p>
      </div>

      <!-- Pubspec Dependencies -->
      ${item.pubspecDeps ? `
      <div class="deps-card">
        <div class="deps-header">
          <span>📦 Required Dependencies (<code>pubspec.yaml</code>)</span>
          <button class="copy-btn mini" onclick="copySnippet(this, \`${escapeHtml(item.pubspecDeps).replace(/`/g, '\\`')}\`)">Copy YAML</button>
        </div>
        <pre class="deps-code"><code class="language-yaml">${escapeHtml(item.pubspecDeps)}</code></pre>
      </div>
      ` : ''}

      <!-- Production Ready Code Block -->
      <div class="code-card">
        <div class="code-card-header">
          <div class="file-path">
            <span class="file-icon">📄</span>
            <span class="file-name">${escapeHtml(item.fileName)}</span>
            <span class="lang-tag">Dart</span>
          </div>
          <div class="code-actions">
            <a href="/tutorials/raw/${item.slug}" target="_blank" class="action-btn text-link" title="Open raw file">Raw</a>
            <button class="copy-btn primary" onclick="copySnippet(this, decodeURIComponent('${encodeURIComponent(item.code)}'))">
              <span class="copy-icon">📋</span>
              <span class="copy-label">Copy Code</span>
            </button>
          </div>
        </div>
        <div class="code-card-body">
          <pre><code class="language-dart">${escapeHtml(item.code)}</code></pre>
        </div>
      </div>

      <!-- Usage Example -->
      ${item.usageExample ? `
      <div class="usage-section">
        <h3 class="section-subtitle">🚀 How to integrate & use in your app:</h3>
        <div class="code-card">
          <div class="code-card-header">
            <span class="file-name">Usage Example</span>
            <button class="copy-btn mini" onclick="copySnippet(this, decodeURIComponent('${encodeURIComponent(item.usageExample)}'))">Copy Snippet</button>
          </div>
          <pre class="usage-code"><code class="language-dart">${escapeHtml(item.usageExample)}</code></pre>
        </div>
      </div>
      ` : ''}

      <!-- Interview Q&A Talking Points -->
      ${item.interviewTips && item.interviewTips.length > 0 ? `
      <div class="interview-section">
        <h3 class="section-subtitle">🎯 Technical Interview Talking Points:</h3>
        <div class="interview-grid">
          ${item.interviewTips.map(tip => `
            <div class="interview-card">
              <div class="interview-q">
                <span class="q-badge">Q</span>
                <span>${escapeHtml(tip.question)}</span>
              </div>
              <div class="interview-a">
                <span class="a-badge">A</span>
                <span>${escapeHtml(tip.answer)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <div class="article-footer">
        <a href="#top" class="back-to-top">↑ Back to top</a>
      </div>
    </article>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flutter Architecture Cookbook & Production Tutorials</title>
  <meta name="description" content="Official Flutter developer tutorials, production-ready Dio networking, MVVM state management, and Clean Architecture recipes for engineers.">
  
  <!-- Google Fonts & Prism Syntax Highlighting -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">
  
  <style>
    :root {
      --bg-dark: #0b1120;
      --bg-surface: #0f172a;
      --bg-card: #1e293b;
      --bg-card-hover: #243248;
      --border-color: #334155;
      --border-light: #475569;
      --primary: #38bdf8;
      --primary-hover: #0284c7;
      --accent: #818cf8;
      --success: #34d399;
      --warning: #fbbf24;
      --text-main: #f1f5f9;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --code-bg: #090d16;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--bg-dark);
      color: var(--text-main);
      line-height: 1.6;
      font-size: 15px;
    }

    /* Top Navigation Bar */
    .topbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(15, 23, 42, 0.92);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      height: 64px;
    }
    .topbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--text-main);
      font-weight: 700;
      font-size: 1.15rem;
    }
    .brand-icon {
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #0284c7, #38bdf8);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: white;
      font-size: 14px;
    }
    .brand-tag {
      background: rgba(56, 189, 248, 0.15);
      color: var(--primary);
      border: 1px solid rgba(56, 189, 248, 0.3);
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.72rem;
      font-weight: 600;
    }
    .topbar-links {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .topbar-links a {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: color 0.15s;
    }
    .topbar-links a:hover, .topbar-links a.active {
      color: var(--primary);
    }
    .topbar-right {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    /* Main Docs Layout */
    .docs-container {
      display: flex;
      max-width: 1440px;
      margin: 0 auto;
      min-height: calc(100vh - 64px);
    }

    /* Left Sidebar */
    .sidebar {
      width: 320px;
      flex-shrink: 0;
      border-right: 1px solid var(--border-color);
      background: var(--bg-surface);
      height: calc(100vh - 64px);
      position: sticky;
      top: 64px;
      overflow-y: auto;
      padding: 20px 16px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .sidebar::-webkit-scrollbar { width: 6px; }
    .sidebar::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }

    .search-box {
      position: relative;
    }
    .search-input {
      width: 100%;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 9px 12px 9px 34px;
      color: var(--text-main);
      font-size: 0.85rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .search-input:focus {
      border-color: var(--primary);
    }
    .search-icon {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-dim);
      font-size: 14px;
    }

    .nav-group {
      margin-bottom: 16px;
    }
    .nav-group-title {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-dim);
      margin-bottom: 8px;
      padding-left: 10px;
    }
    .nav-group-items {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 7px 10px;
      border-radius: 6px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.86rem;
      font-weight: 500;
      transition: all 0.15s;
    }
    .nav-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--border-light);
      flex-shrink: 0;
      transition: background 0.15s;
    }
    .nav-item:hover {
      background: var(--bg-card);
      color: var(--text-main);
    }
    .nav-item:hover .nav-dot {
      background: var(--primary);
    }
    .nav-item.active {
      background: rgba(56, 189, 248, 0.12);
      color: var(--primary);
      font-weight: 600;
    }
    .nav-item.active .nav-dot {
      background: var(--primary);
    }

    /* Content Area */
    .content-area {
      flex: 1;
      min-width: 0;
      padding: 40px 48px 80px 48px;
      overflow-y: auto;
    }

    /* Hero Banner */
    .hero-banner {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      padding: 30px;
      margin-bottom: 40px;
      position: relative;
      overflow: hidden;
    }
    .hero-banner::before {
      content: '';
      position: absolute;
      top: -50px;
      right: -50px;
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%);
      pointer-events: none;
    }
    .hero-title {
      font-size: 1.85rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 8px;
    }
    .hero-subtitle {
      color: var(--text-muted);
      font-size: 1rem;
      max-width: 780px;
      line-height: 1.6;
    }
    .hero-stats {
      display: flex;
      gap: 20px;
      margin-top: 18px;
      flex-wrap: wrap;
    }
    .stat-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .stat-badge strong {
      color: var(--primary);
    }

    /* Tutorial Articles */
    .tutorial-article {
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 50px;
      margin-bottom: 50px;
      scroll-margin-top: 80px;
    }
    .tutorial-article:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      color: var(--text-dim);
      margin-bottom: 12px;
    }
    .breadcrumbs a {
      color: var(--text-muted);
      text-decoration: none;
    }
    .breadcrumbs a:hover {
      color: var(--primary);
    }

    .article-meta {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }
    .badge {
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
    .badge-primary { background: rgba(56, 189, 248, 0.15); color: var(--primary); border: 1px solid rgba(56, 189, 248, 0.3); }
    .badge-muted { background: var(--bg-card); color: var(--text-muted); border: 1px solid var(--border-color); }

    .article-title {
      font-size: 1.6rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 8px;
    }
    .article-desc {
      color: var(--text-muted);
      font-size: 0.98rem;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    /* Callout Box */
    .callout {
      border-radius: 10px;
      padding: 16px 20px;
      margin-bottom: 24px;
      font-size: 0.9rem;
      line-height: 1.6;
    }
    .callout-why {
      background: rgba(14, 165, 233, 0.08);
      border-left: 4px solid var(--primary);
      border-right: 1px solid var(--border-color);
      border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
    }
    .callout-header {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--primary);
      margin-bottom: 6px;
      font-size: 0.92rem;
    }

    /* Dependencies Card */
    .deps-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      margin-bottom: 20px;
      overflow: hidden;
    }
    .deps-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 14px;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border-color);
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .deps-code {
      margin: 0 !important;
      padding: 12px 14px !important;
      background: var(--code-bg) !important;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.82rem;
    }

    /* Code Card */
    .code-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      margin-bottom: 24px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
    }
    .code-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border-color);
    }
    .file-path {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      color: var(--text-main);
    }
    .lang-tag {
      background: var(--bg-dark);
      border: 1px solid var(--border-color);
      padding: 1px 7px;
      border-radius: 4px;
      font-size: 0.72rem;
      color: var(--text-muted);
    }
    .code-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .action-btn {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.78rem;
      padding: 4px 8px;
      border-radius: 4px;
      background: var(--bg-dark);
      border: 1px solid var(--border-color);
    }
    .action-btn:hover {
      color: var(--primary);
      border-color: var(--primary);
    }

    .copy-btn {
      background: var(--bg-dark);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 5px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }
    .copy-btn:hover {
      background: var(--border-color);
      border-color: var(--primary);
      color: var(--primary);
    }
    .copy-btn.primary {
      background: linear-gradient(135deg, rgba(2, 132, 199, 0.4), rgba(56, 189, 248, 0.2));
      border: 1px solid rgba(56, 189, 248, 0.4);
      color: #ffffff;
      font-weight: 600;
    }
    .copy-btn.primary:hover {
      background: linear-gradient(135deg, rgba(2, 132, 199, 0.7), rgba(56, 189, 248, 0.4));
      border-color: var(--primary);
    }
    .copy-btn.mini {
      padding: 3px 8px;
      font-size: 0.75rem;
    }
    .copy-btn.copied {
      background: #065f46 !important;
      border-color: #10b981 !important;
      color: #6ee7b7 !important;
    }

    .code-card-body pre {
      margin: 0 !important;
      padding: 16px 20px !important;
      background: var(--code-bg) !important;
      font-family: 'JetBrains Mono', Consolas, monospace !important;
      font-size: 0.88rem !important;
      line-height: 1.55 !important;
      max-height: 520px;
      overflow-y: auto;
    }

    /* Subsections */
    .section-subtitle {
      font-size: 1.15rem;
      font-weight: 600;
      color: #ffffff;
      margin: 24px 0 12px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Interview Grid */
    .interview-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      margin-top: 10px;
    }
    .interview-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 14px 18px;
    }
    .interview-q {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-weight: 600;
      color: #f8fafc;
      font-size: 0.92rem;
      margin-bottom: 8px;
    }
    .q-badge {
      background: #818cf8;
      color: #0b1120;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .interview-a {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      color: var(--text-muted);
      font-size: 0.88rem;
      line-height: 1.5;
    }
    .a-badge {
      background: #34d399;
      color: #0b1120;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .article-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
    .back-to-top {
      font-size: 0.8rem;
      color: var(--text-dim);
      text-decoration: none;
    }
    .back-to-top:hover {
      color: var(--primary);
    }

    /* Toast Notification */
    #toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #1e293b;
      border: 1px solid #10b981;
      color: #f1f5f9;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.88rem;
      z-index: 1000;
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
    }
    #toast.show {
      transform: translateY(0);
      opacity: 1;
    }
    #toast-icon {
      color: #10b981;
      font-weight: bold;
      font-size: 1.1rem;
    }

    /* Responsive */
    @media (max-width: 900px) {
      .sidebar {
        display: none;
      }
      .content-area {
        padding: 24px 20px;
      }
      .topbar {
        padding: 0 16px;
      }
    }
  </style>
</head>
<body id="top">

  <!-- Top Navigation Bar -->
  <header class="topbar">
    <div class="topbar-left">
      <a href="/" class="brand">
        <span class="brand-icon">⚡</span>
        <span>DummyApi</span>
      </a>
      <span class="brand-tag">Flutter Docs & Tutorials</span>
    </div>
    <nav class="topbar-links">
      <a href="/">📡 API Endpoints</a>
      <a href="/tutorials" class="active">📘 Code Tutorials & Recipes</a>
      <a href="/postman/collection.json" download>📦 Postman Collection</a>
    </nav>
    <div class="topbar-right">
      <a href="https://flutter.dev" target="_blank" class="stat-badge" style="text-decoration:none;">
        <span>Flutter SDK Ready</span>
      </a>
    </div>
  </header>

  <div class="docs-container">
    <!-- Left Navigation Sidebar -->
    <aside class="sidebar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input type="text" id="searchInput" class="search-input" placeholder="Quick find recipe (e.g. Dio, MVVM, Model)..." oninput="filterTutorials()">
      </div>

      <nav class="sidebar-nav">
        ${categoryListHtml}
      </nav>
    </aside>

    <!-- Main Content Area -->
    <main class="content-area">
      <!-- Hero Header -->
      <section class="hero-banner">
        <h1 class="hero-title">Flutter Architecture & Production Recipes</h1>
        <p class="hero-subtitle">
          Battle-tested, ready-to-use Dart templates for mobile engineering interviews and production applications. Complete with Dio networking, native HTTP fallbacks, MVVM ViewModels, clean repository contracts, and infinite scroll pagination.
        </p>
        <div class="hero-stats">
          <div class="stat-badge">📚 <strong>12</strong> Production Templates</div>
          <div class="stat-badge">⚡ <strong>100%</strong> Compile-Ready Dart</div>
          <div class="stat-badge">🎯 <strong>Senior Q&A</strong> Talking Points</div>
          <div class="stat-badge">📋 <strong>1-Click</strong> Copy to Clipboard</div>
        </div>
      </section>

      <!-- Tutorials List -->
      <div id="tutorialArticles">
        ${articlesHtml}
      </div>
    </main>
  </div>

  <!-- Toast Notification -->
  <div id="toast">
    <span id="toast-icon">✓</span>
    <span id="toast-msg">Code copied to clipboard!</span>
  </div>

  <!-- Scripts -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-dart.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-yaml.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-json.min.js"></script>
  
  <script>
    // Copy snippet with visual feedback and toast
    function copySnippet(button, text) {
      if (!navigator.clipboard) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showFeedback(button);
        return;
      }

      navigator.clipboard.writeText(text).then(() => {
        showFeedback(button);
      }).catch(err => {
        console.error('Clipboard copy failed:', err);
      });
    }

    function showFeedback(button) {
      const originalHtml = button.innerHTML;
      button.classList.add('copied');
      button.innerHTML = '<span class="copy-icon">✓</span><span class="copy-label">Copied!</span>';
      
      showToast('Copied code to clipboard!');

      setTimeout(() => {
        button.classList.remove('copied');
        button.innerHTML = originalHtml;
      }, 2000);
    }

    function showToast(message) {
      const toast = document.getElementById('toast');
      const toastMsg = document.getElementById('toast-msg');
      toastMsg.textContent = message;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2500);
    }

    // Client-side quick filter
    function filterTutorials() {
      const query = document.getElementById('searchInput').value.toLowerCase().trim();
      const articles = document.querySelectorAll('.tutorial-article');
      const navItems = document.querySelectorAll('.nav-item');

      articles.forEach(article => {
        const title = article.getAttribute('data-title') || '';
        const category = article.getAttribute('data-category') || '';
        const text = article.innerText.toLowerCase();

        if (!query || title.includes(query) || category.includes(query) || text.includes(query)) {
          article.style.display = 'block';
        } else {
          article.style.display = 'none';
        }
      });

      navItems.forEach(item => {
        const text = item.innerText.toLowerCase();
        if (!query || text.includes(query)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    }

    // Active link highlighting on scroll
    window.addEventListener('DOMContentLoaded', () => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            document.querySelectorAll('.nav-item').forEach(item => {
              if (item.getAttribute('data-slug') === id) {
                item.classList.add('active');
              } else {
                item.classList.remove('active');
              }
            });
          }
        });
      }, { rootMargin: '-20% 0px -70% 0px' });

      document.querySelectorAll('.tutorial-article').forEach(article => {
        observer.observe(article);
      });
    });
  </script>
</body>
</html>`;
}

// ===== Routes =====

// Main Tutorials & Recipes Index Page
router.get('/', (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : req.protocol);
  const baseUrl = `${protocol}://${req.get('host')}`;
  res.send(generateTutorialsHtml(baseUrl));
});

// Direct single tutorial route
router.get('/:slug', (req, res) => {
  const { slug } = req.params;
  const tutorial = tutorials.find(t => t.slug === slug || t.id === slug);
  if (!tutorial) {
    return res.redirect('/tutorials');
  }
  const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : req.protocol);
  const baseUrl = `${protocol}://${req.get('host')}`;
  res.send(generateTutorialsHtml(baseUrl, slug));
});

// Raw code download / preview endpoint
router.get('/raw/:slug', (req, res) => {
  const { slug } = req.params;
  const tutorial = tutorials.find(t => t.slug === slug || t.id === slug);
  if (!tutorial) {
    return res.status(404).send('Tutorial file not found');
  }
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(tutorial.code);
});

module.exports = router;
