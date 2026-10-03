const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..', 'dummy_api_flutter');

/**
 * Recursively build folder tree structure
 */
function buildTree(dir, relative = '') {
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    // Sort directories first, then alphabetically
    items.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

    const result = [];
    const ignored = ['.git', 'build', '.dart_tool', 'node_modules', '.idea', '.vscode', '.gradle'];

    for (const item of items) {
      if (ignored.includes(item.name)) continue;
      // Skip hidden files except essential configs
      if (item.name.startsWith('.') && !['.gitignore'].includes(item.name)) continue;

      const relPath = path.join(relative, item.name).replace(/\\/g, '/');
      const fullPath = path.join(dir, item.name);

      if (item.isDirectory()) {
        const children = buildTree(fullPath, relPath);
        result.push({
          name: item.name,
          type: 'directory',
          path: relPath,
          children: children,
        });
      } else if (item.isFile()) {
        const stats = fs.statSync(fullPath);
        result.push({
          name: item.name,
          type: 'file',
          path: relPath,
          size: stats.size,
          extension: path.extname(item.name).toLowerCase(),
        });
      }
    }
    return result;
  } catch (err) {
    console.error('Error scanning tree:', err);
    return [];
  }
}

/**
 * Get file icon based on file extension
 */
function getFileIcon(ext) {
  switch (ext) {
    case '.dart':
      return '🎯';
    case '.yaml':
    case '.yml':
      return '⚙️';
    case '.json':
      return '{ }';
    case '.md':
      return '📝';
    case '.html':
      return '🌐';
    case '.png':
    case '.jpg':
    case '.ico':
      return '🖼️';
    default:
      return '📄';
  }
}

/**
 * Render folder tree to HTML
 */
function renderTreeHtml(nodes, defaultExpandedDepth = 2, currentDepth = 1) {
  let html = '<ul class="tree-list">';
  for (const node of nodes) {
    if (node.type === 'directory') {
      const isExpanded = currentDepth <= defaultExpandedDepth;
      html += `
        <li class="tree-item directory ${isExpanded ? 'open' : ''}" data-path="${node.path}">
          <div class="tree-row folder-row" onclick="toggleFolder(this)">
            <span class="tree-arrow">${isExpanded ? '▼' : '▶'}</span>
            <span class="folder-icon">${isExpanded ? '📂' : '📁'}</span>
            <span class="folder-name">${node.name}</span>
          </div>
          ${renderTreeHtml(node.children, defaultExpandedDepth, currentDepth + 1)}
        </li>
      `;
    } else {
      const icon = getFileIcon(node.extension);
      const isInitialFile = node.path === 'lib/core/network/api_client.dart';
      const sizeKb = (node.size / 1024).toFixed(1);
      html += `
        <li class="tree-item file ${isInitialFile ? 'active-file' : ''}" data-path="${node.path}" data-ext="${node.extension}">
          <div class="tree-row file-row" onclick="selectFile('${node.path}')">
            <span class="file-icon">${icon}</span>
            <span class="file-name">${node.name}</span>
            <span class="file-size">${sizeKb} KB</span>
          </div>
        </li>
      `;
    }
  }
  html += '</ul>';
  return html;
}

/**
 * Generate complete Project Explorer page with Light Theme (NO BLUE)
 */
function generateExplorerHtml(initialPath = 'lib/core/network/api_client.dart') {
  const tree = buildTree(PROJECT_ROOT);
  const treeHtml = renderTreeHtml(tree);

  let initialCode = '';
  let initialLines = 0;
  let initialSize = '0 KB';

  try {
    const fullPath = path.join(PROJECT_ROOT, initialPath);
    if (fs.existsSync(fullPath)) {
      initialCode = fs.readFileSync(fullPath, 'utf8');
      initialLines = initialCode.split('\n').length;
      initialSize = (fs.statSync(fullPath).size / 1024).toFixed(1) + ' KB';
    }
  } catch (e) {
    initialCode = '// Could not load default file';
  }

  // Pre-generate line numbers
  let lineNumbersHtml = '';
  for (let i = 1; i <= Math.max(initialLines, 1); i++) {
    lineNumbersHtml += `<span>${i}</span>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flutter Project Explorer & Codebase IDE | DummyApi</title>
  <meta name="description" content="Interactive Flutter project file tree and code viewer. Explore production architecture files, network clients, ViewModels, and widgets.">
  
  <!-- Fonts & Prism Light Syntax Highlighting -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css">
  
  <style>
    :root {
      --bg-body: #f8fafc;
      --bg-surface: #ffffff;
      --bg-card: #ffffff;
      --bg-hover: #f1f5f9;
      --border-color: #e2e8f0;
      --border-light: #cbd5e1;
      --primary: #059669; /* Emerald Green - ZERO BLUE */
      --primary-hover: #047857;
      --primary-subtle: #ecfdf5;
      --primary-border: #a7f3d0;
      --accent: #16a34a;
      --success: #10b981;
      --warning: #d97706; /* Warm Amber */
      --text-main: #0f172a; /* Deep Charcoal */
      --text-secondary: #334155; /* Slate 700 */
      --text-muted: #64748b; /* Slate 500 */
      --text-dim: #94a3b8; /* Slate 400 */
      --editor-bg: #ffffff;
      --gutter-bg: #f8fafc;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--bg-body);
      color: var(--text-main);
      overflow: hidden;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* Top Navigation Bar */
    .topbar {
      height: 56px;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      flex-shrink: 0;
      z-index: 50;
    }
    .topbar-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: var(--text-main);
      font-weight: 700;
      font-size: 1.1rem;
    }
    .brand-icon {
      width: 26px;
      height: 26px;
      background: linear-gradient(135deg, #059669, #10b981);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 13px;
      font-weight: bold;
    }
    .brand-tag {
      background: var(--primary-subtle);
      color: var(--primary);
      border: 1px solid var(--primary-border);
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.72rem;
      font-weight: 600;
    }

    .topbar-links {
      display: flex;
      align-items: center;
      gap: 18px;
    }
    .topbar-links a {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 500;
      transition: color 0.15s;
    }
    .topbar-links a:hover, .topbar-links a.active {
      color: var(--primary);
      font-weight: 600;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .btn {
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s;
    }
    .btn-default {
      background: #ffffff;
      border: 1px solid var(--border-light);
      color: var(--text-main);
    }
    .btn-default:hover {
      background: var(--bg-hover);
      border-color: var(--primary);
      color: var(--primary);
    }
    .btn-primary {
      background: var(--primary);
      border: 1px solid var(--primary-hover);
      color: #ffffff;
      font-weight: 600;
    }
    .btn-primary:hover {
      background: var(--primary-hover);
    }

    /* IDE Workspace */
    .ide-container {
      display: flex;
      flex: 1;
      height: calc(100vh - 56px);
      overflow: hidden;
    }

    /* Left Sidebar: Folder Tree */
    .tree-sidebar {
      width: 340px;
      flex-shrink: 0;
      background: var(--bg-surface);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .tree-header {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-body);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .tree-title {
      font-size: 0.76rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tree-tools {
      display: flex;
      gap: 6px;
    }
    .tool-icon {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 13px;
    }
    .tool-icon:hover {
      background: var(--border-color);
      color: var(--text-main);
    }

    .tree-search {
      padding: 8px 12px;
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-surface);
    }
    .tree-search-input {
      width: 100%;
      background: #ffffff;
      border: 1px solid var(--border-light);
      border-radius: 6px;
      padding: 6px 10px 6px 28px;
      font-size: 0.82rem;
      color: var(--text-main);
      outline: none;
    }
    .tree-search-input:focus {
      border-color: var(--primary);
    }
    .tree-search-box {
      position: relative;
    }
    .search-glyph {
      position: absolute;
      left: 8px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 12px;
      color: var(--text-muted);
    }

    .tree-content {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
    }
    .tree-content::-webkit-scrollbar { width: 5px; }
    .tree-content::-webkit-scrollbar-thumb { background: var(--border-light); border-radius: 3px; }

    .tree-list {
      list-style: none;
    }
    .tree-item {
      user-select: none;
    }
    .tree-row {
      display: flex;
      align-items: center;
      padding: 5px 12px 5px 16px;
      font-size: 0.84rem;
      cursor: pointer;
      transition: background 0.1s;
      gap: 6px;
    }
    .tree-row:hover {
      background: var(--bg-hover);
    }
    .folder-row {
      font-weight: 500;
      color: var(--text-secondary);
    }
    .tree-arrow {
      font-size: 9px;
      color: var(--text-muted);
      width: 14px;
      text-align: center;
    }
    .folder-icon {
      font-size: 14px;
    }
    .folder-name {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .file-row {
      padding-left: 32px;
      color: var(--text-main);
    }
    .file-icon {
      font-size: 13px;
    }
    .file-name {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-size: 0.8rem;
    }
    .file-size {
      font-size: 0.7rem;
      color: var(--text-muted);
    }

    /* Nested indentations */
    .tree-item ul {
      display: none;
    }
    .tree-item.open > ul {
      display: block;
    }
    .tree-item.open > .folder-row > .tree-arrow {
      transform: rotate(0deg);
    }
    .tree-item > ul .file-row {
      padding-left: 44px;
    }
    .tree-item > ul > .directory > .folder-row {
      padding-left: 28px;
    }
    .tree-item > ul > .directory > ul .file-row {
      padding-left: 56px;
    }
    .tree-item > ul > .directory > ul > .directory > .folder-row {
      padding-left: 40px;
    }
    .tree-item > ul > .directory > ul > .directory > ul .file-row {
      padding-left: 68px;
    }

    .tree-item.active-file > .file-row {
      background: var(--primary-subtle) !important;
      color: var(--primary) !important;
      font-weight: 600;
      border-left: 3px solid var(--primary);
      padding-left: calc(var(--pl, 32px) - 3px);
    }

    /* Right Main Panel: Editor View */
    .editor-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: var(--editor-bg);
      height: 100%;
      min-width: 0;
    }

    /* Editor Tabs Bar */
    .editor-tabs-bar {
      height: 40px;
      background: var(--bg-body);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      overflow-x: auto;
      padding: 0 8px;
    }
    .editor-tab {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      background: #ffffff;
      border-top: 2px solid var(--primary);
      border-left: 1px solid var(--border-color);
      border-right: 1px solid var(--border-color);
      font-size: 0.82rem;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-main);
      font-weight: 600;
      cursor: pointer;
    }

    /* Editor Header / Breadcrumbs */
    .editor-header {
      padding: 10px 20px;
      border-bottom: 1px solid var(--border-color);
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .editor-breadcrumbs {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-muted);
    }
    .editor-breadcrumbs span.active {
      color: var(--text-main);
      font-weight: 600;
    }
    .editor-meta {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .meta-tag {
      font-size: 0.75rem;
      background: var(--bg-hover);
      color: var(--text-secondary);
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid var(--border-color);
    }

    /* Editor Code View Area */
    .code-workspace {
      flex: 1;
      display: flex;
      overflow: hidden;
      position: relative;
    }
    .line-numbers-gutter {
      width: 52px;
      background: var(--gutter-bg);
      border-right: 1px solid var(--border-color);
      padding: 16px 0;
      text-align: right;
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-size: 0.86rem;
      color: var(--text-dim);
      user-select: none;
      line-height: 1.6;
      flex-shrink: 0;
      overflow: hidden;
    }
    .line-numbers-gutter span {
      display: block;
      padding-right: 12px;
    }

    .code-scroll-container {
      flex: 1;
      overflow: auto;
      padding: 16px 20px;
      background: #ffffff;
    }
    .code-scroll-container::-webkit-scrollbar { width: 8px; height: 8px; }
    .code-scroll-container::-webkit-scrollbar-thumb { background: var(--border-light); border-radius: 4px; }

    pre#codePre {
      margin: 0 !important;
      padding: 0 !important;
      background: transparent !important;
      font-family: 'JetBrains Mono', Consolas, monospace !important;
      font-size: 0.88rem !important;
      line-height: 1.6 !important;
      tab-size: 2;
    }
    code#codeBlock {
      font-family: 'JetBrains Mono', Consolas, monospace !important;
      color: var(--text-main) !important;
      text-shadow: none !important;
    }

    /* Zero Blue Token Highlighting */
    .token.comment, .token.prolog { color: #64748b !important; font-style: italic; }
    .token.punctuation { color: #334155 !important; }
    .token.property, .token.tag, .token.boolean, .token.number { color: #c2410c !important; }
    .token.string { color: #047857 !important; }
    .token.keyword { color: #7c3aed !important; font-weight: 600; }
    .token.function, .token.class-name { color: #b91c1c !important; font-weight: 600; }
    .token.operator { color: #b45309 !important; }

    /* Toast Notification */
    #toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #0f172a;
      border: 1px solid #334155;
      color: #ffffff;
      padding: 10px 18px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.85rem;
      z-index: 1000;
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
    }
    #toast.show {
      transform: translateY(0);
      opacity: 1;
    }

    @media (max-width: 800px) {
      .tree-sidebar {
        width: 260px;
      }
    }
  </style>
</head>
<body>

  <!-- Top Navigation Bar -->
  <header class="topbar">
    <div class="topbar-left">
      <a href="/" class="brand">
        <span class="brand-icon">⚡</span>
        <span>DummyApi</span>
      </a>
      <span class="brand-tag">IDE Code Explorer</span>
    </div>

    <nav class="topbar-links">
      <a href="/">📡 API Endpoints</a>
      <a href="/tutorials">📘 Tutorials & Recipes</a>
      <a href="/project" class="active">📁 Project Explorer</a>
      <a href="/postman/collection.json" download>📦 Postman Collection</a>
    </nav>

    <div class="topbar-right">
      <button class="btn btn-default" onclick="copyCurrentFile()">
        <span id="copyBtnIcon">📋</span>
        <span id="copyBtnText">Copy File</span>
      </button>
      <a id="downloadBtn" href="/project/raw?path=${initialPath}" download class="btn btn-primary">
        <span>⬇️</span> Download
      </a>
    </div>
  </header>

  <div class="ide-container">
    <!-- Left Panel: File Tree -->
    <aside class="tree-sidebar">
      <div class="tree-header">
        <span class="tree-title">
          <span>📁</span> dummy_api_flutter
        </span>
        <div class="tree-tools">
          <button class="tool-icon" onclick="expandAllFolders()" title="Expand All">⤢</button>
          <button class="tool-icon" onclick="collapseAllFolders()" title="Collapse All">⤡</button>
        </div>
      </div>

      <div class="tree-search">
        <div class="tree-search-box">
          <span class="search-glyph">🔍</span>
          <input type="text" id="fileSearchInput" class="tree-search-input" placeholder="Filter files (e.g. client, model)..." oninput="filterFileTree()">
        </div>
      </div>

      <div class="tree-content">
        ${treeHtml}
      </div>
    </aside>

    <!-- Right Panel: Code Viewer -->
    <main class="editor-panel">
      <!-- Tabs Bar -->
      <div class="editor-tabs-bar">
        <div class="editor-tab" id="activeTab">
          <span id="tabIcon">🎯</span>
          <span id="tabTitle">api_client.dart</span>
        </div>
      </div>

      <!-- Breadcrumbs & Meta -->
      <div class="editor-header">
        <div class="editor-breadcrumbs" id="breadcrumbsContainer">
          <span>dummy_api_flutter</span> <span>/</span>
          <span>lib</span> <span>/</span>
          <span>core</span> <span>/</span>
          <span>network</span> <span>/</span>
          <span class="active">api_client.dart</span>
        </div>
        <div class="editor-meta">
          <span class="meta-tag" id="metaLines">${initialLines} lines</span>
          <span class="meta-tag" id="metaSize">${initialSize}</span>
          <span class="meta-tag">Dart</span>
        </div>
      </div>

      <!-- Code Workspace -->
      <div class="code-workspace">
        <div class="line-numbers-gutter" id="lineGutter">
          ${lineNumbersHtml}
        </div>
        <div class="code-scroll-container" id="codeContainer" onscroll="syncGutterScroll(this)">
          <pre id="codePre"><code id="codeBlock" class="language-dart">${escapeHtml(initialCode)}</code></pre>
        </div>
      </div>
    </main>
  </div>

  <!-- Toast Notification -->
  <div id="toast">
    <span style="color:#10b981;font-weight:bold;">✓</span>
    <span id="toastMsg">File copied to clipboard!</span>
  </div>

  <!-- Prism.js Syntax Highlighting -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-dart.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-yaml.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-json.min.js"></script>

  <script>
    let currentFilePath = '${initialPath}';
    let currentFileContent = ${JSON.stringify(initialCode)};

    function toggleFolder(row) {
      const dirItem = row.closest('.directory');
      dirItem.classList.toggle('open');
      const arrow = row.querySelector('.tree-arrow');
      const icon = row.querySelector('.folder-icon');
      if (dirItem.classList.contains('open')) {
        arrow.textContent = '▼';
        icon.textContent = '📂';
      } else {
        arrow.textContent = '▶';
        icon.textContent = '📁';
      }
    }

    function expandAllFolders() {
      document.querySelectorAll('.directory').forEach(el => {
        el.classList.add('open');
        const arrow = el.querySelector('.tree-arrow');
        const icon = el.querySelector('.folder-icon');
        if (arrow) arrow.textContent = '▼';
        if (icon) icon.textContent = '📂';
      });
    }

    function collapseAllFolders() {
      document.querySelectorAll('.directory').forEach(el => {
        el.classList.remove('open');
        const arrow = el.querySelector('.tree-arrow');
        const icon = el.querySelector('.folder-icon');
        if (arrow) arrow.textContent = '▶';
        if (icon) icon.textContent = '📁';
      });
    }

    async function selectFile(relPath) {
      currentFilePath = relPath;

      // Update tree active selection
      document.querySelectorAll('.tree-item.file').forEach(el => el.classList.remove('active-file'));
      const activeEl = document.querySelector(\`.tree-item.file[data-path="\${relPath}"]\`);
      if (activeEl) {
        activeEl.classList.add('active-file');
      }

      // Fetch file content from server API
      try {
        const response = await fetch('/project/api/file?path=' + encodeURIComponent(relPath));
        if (!response.ok) throw new Error('Failed to load file');
        const data = await response.json();

        currentFileContent = data.content;

        // Update Tab & Breadcrumbs
        const parts = relPath.split('/');
        const fileName = parts[parts.length - 1];
        document.getElementById('tabTitle').textContent = fileName;
        
        let breadcrumbHtml = '<span>dummy_api_flutter</span>';
        parts.forEach((p, idx) => {
          breadcrumbHtml += ' <span>/</span> ';
          if (idx === parts.length - 1) {
            breadcrumbHtml += \`<span class="active">\${p}</span>\`;
          } else {
            breadcrumbHtml += \`<span>\${p}</span>\`;
          }
        });
        document.getElementById('breadcrumbsContainer').innerHTML = breadcrumbHtml;

        // Update Metadata
        document.getElementById('metaLines').textContent = data.lines + ' lines';
        document.getElementById('metaSize').textContent = (data.size / 1024).toFixed(1) + ' KB';
        document.getElementById('downloadBtn').href = '/project/raw?path=' + encodeURIComponent(relPath);

        // Update Line Numbers Gutter
        let gutterHtml = '';
        for (let i = 1; i <= Math.max(data.lines, 1); i++) {
          gutterHtml += \`<span>\${i}</span>\`;
        }
        document.getElementById('lineGutter').innerHTML = gutterHtml;

        // Update Code Pre & Highlight
        const codeBlock = document.getElementById('codeBlock');
        codeBlock.textContent = data.content;

        // Detect language
        const ext = fileName.split('.').pop().toLowerCase();
        let langClass = 'language-dart';
        if (ext === 'yaml' || ext === 'yml') langClass = 'language-yaml';
        if (ext === 'json') langClass = 'language-json';
        if (ext === 'md') langClass = 'language-markdown';

        codeBlock.className = langClass;
        Prism.highlightElement(codeBlock);

        // Reset scroll position
        document.getElementById('codeContainer').scrollTop = 0;
        document.getElementById('codeContainer').scrollLeft = 0;
      } catch (err) {
        console.error('Error opening file:', err);
      }
    }

    function syncGutterScroll(container) {
      document.getElementById('lineGutter').scrollTop = container.scrollTop;
    }

    function copyCurrentFile() {
      if (!navigator.clipboard) {
        const textarea = document.createElement('textarea');
        textarea.value = currentFileContent;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showFeedback();
        return;
      }

      navigator.clipboard.writeText(currentFileContent).then(() => {
        showFeedback();
      });
    }

    function showFeedback() {
      const icon = document.getElementById('copyBtnIcon');
      const text = document.getElementById('copyBtnText');
      icon.textContent = '✓';
      text.textContent = 'Copied!';
      showToast('Copied ' + currentFilePath.split('/').pop() + ' to clipboard!');

      setTimeout(() => {
        icon.textContent = '📋';
        text.textContent = 'Copy File';
      }, 2000);
    }

    function showToast(msg) {
      const toast = document.getElementById('toast');
      document.getElementById('toastMsg').textContent = msg;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2200);
    }

    function filterFileTree() {
      const query = document.getElementById('fileSearchInput').value.toLowerCase().trim();
      const fileRows = document.querySelectorAll('.tree-item.file');

      fileRows.forEach(item => {
        const name = item.querySelector('.file-name').textContent.toLowerCase();
        const path = item.getAttribute('data-path').toLowerCase();
        if (!query || name.includes(query) || path.includes(query)) {
          item.style.display = 'block';
          // Ensure parent folders are opened so matched files are visible
          let parent = item.parentElement.closest('.directory');
          while (parent) {
            parent.classList.add('open');
            const arrow = parent.querySelector('.tree-arrow');
            const icon = parent.querySelector('.folder-icon');
            if (arrow) arrow.textContent = '▼';
            if (icon) icon.textContent = '📂';
            parent = parent.parentElement.closest('.directory');
          }
        } else {
          item.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ===== Routes =====

// Main IDE Page
router.get('/', (req, res) => {
  const filePath = req.query.file || 'lib/core/network/api_client.dart';
  res.send(generateExplorerHtml(filePath));
});

// JSON API endpoint for fetching tree
router.get('/api/tree', (req, res) => {
  const tree = buildTree(PROJECT_ROOT);
  res.json({ success: true, tree });
});

// JSON API endpoint for reading specific file
router.get('/api/file', (req, res) => {
  const relPath = req.query.path;
  if (!relPath) {
    return res.status(400).json({ success: false, error: 'Path parameter required' });
  }

  // Prevent directory traversal
  const safeRelPath = path.normalize(relPath).replace(/^(\.\.[\/\\])+/, '');
  const fullPath = path.join(PROJECT_ROOT, safeRelPath);

  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
    return res.status(404).json({ success: false, error: 'File not found' });
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const stats = fs.statSync(fullPath);
    const lines = content.split('\n').length;
    res.json({
      success: true,
      path: relPath,
      name: path.basename(relPath),
      size: stats.size,
      lines: lines,
      content: content,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Raw file download endpoint
router.get('/raw', (req, res) => {
  const relPath = req.query.path;
  if (!relPath) return res.status(400).send('Path required');
  const safeRelPath = path.normalize(relPath).replace(/^(\.\.[\/\\])+/, '');
  const fullPath = path.join(PROJECT_ROOT, safeRelPath);

  if (!fs.existsSync(fullPath)) return res.status(404).send('File not found');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.sendFile(fullPath);
});

module.exports = router;
