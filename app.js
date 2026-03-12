// ===== PromptVault — Core Application Logic =====

(function () {
  'use strict';

  // ===== Constants =====
  const STORAGE_KEY = 'promptvault_prompts';
  const THEME_KEY = 'promptvault_theme';
  const COPY_COUNT_KEY = 'promptvault_total_copies';
  const CATEGORY_NAMES = {
    all: '全部', writing: '写作', coding: '编程', marketing: '营销',
    translation: '翻译', business: '商务', image: 'AI绘画', other: '其他'
  };

  // ===== State =====
  let prompts = [];
  let currentCategory = 'all';
  let currentTag = 'all';
  let searchQuery = '';
  let editingId = null;
  let totalCopied = parseInt(localStorage.getItem(COPY_COUNT_KEY) || '0', 10);

  // ===== DOM Elements =====
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const promptGrid = $('#promptGrid');
  const emptyState = $('#emptyState');
  const searchInput = $('#searchInput');
  const categoryList = $('#categoryList');
  const tagFilters = $('#tagFilters');
  const promptModal = $('#promptModal');
  const templateModal = $('#templateModal');
  const toast = $('#toast');

  // Stats
  const totalPromptsEl = $('#totalPrompts');
  const totalFavoritesEl = $('#totalFavorites');
  const totalCopiedEl = $('#totalCopied');

  // Form elements
  const modalTitle = $('#modalTitle');
  const promptTitle = $('#promptTitle');
  const promptCategory = $('#promptCategory');
  const promptContent = $('#promptContent');
  const promptTags = $('#promptTags');
  const promptNote = $('#promptNote');
  const variableHint = $('#variableHint');
  const detectedVars = $('#detectedVars');

  // ===== Initialization =====
  function init() {
    loadPrompts();
    loadTheme();
    render();
    bindEvents();
  }

  // ===== Data Management =====
  function loadPrompts() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      prompts = JSON.parse(stored);
    } else {
      // First time — load builtin prompts
      prompts = BUILTIN_PROMPTS.map(p => ({ ...p }));
      savePrompts();
    }
  }

  function savePrompts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
  }

  function generateId() {
    return 'pv-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
  }

  // ===== Theme =====
  function loadTheme() {
    const theme = localStorage.getItem(THEME_KEY) || 'dark';
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    updateThemeIcon(theme);
  }

  function toggleTheme() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const newTheme = isLight ? 'dark' : 'light';
    if (newTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem(THEME_KEY, newTheme);
    updateThemeIcon(newTheme);
  }

  function updateThemeIcon(theme) {
    const icon = $('#themeIcon');
    if (theme === 'light') {
      icon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
    } else {
      icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    }
  }

  // ===== Filtering & Searching =====
  function getFilteredPrompts() {
    let result = [...prompts];

    // Category filter
    if (currentCategory !== 'all') {
      result = result.filter(p => p.category === currentCategory);
    }

    // Tag filter
    if (currentTag !== 'all') {
      result = result.filter(p => p.tags && p.tags.includes(currentTag));
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q))) ||
        (p.note && p.note.toLowerCase().includes(q))
      );
    }

    return result;
  }

  function getAllTags() {
    const tagSet = new Set();
    prompts.forEach(p => {
      if (p.tags) p.tags.forEach(t => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
  }

  // ===== Rendering =====
  function render() {
    renderStats();
    renderCategories();
    renderTags();
    renderCards();
  }

  function renderStats() {
    totalPromptsEl.textContent = prompts.length;
    totalFavoritesEl.textContent = prompts.filter(p => p.favorite).length;
    totalCopiedEl.textContent = totalCopied;
  }

  function renderCategories() {
    const counts = { all: prompts.length };
    Object.keys(CATEGORY_NAMES).forEach(cat => {
      if (cat !== 'all') {
        counts[cat] = prompts.filter(p => p.category === cat).length;
      }
    });

    categoryList.querySelectorAll('.category-item').forEach(item => {
      const cat = item.dataset.category;
      item.classList.toggle('active', cat === currentCategory);
      const countEl = item.querySelector('.category-count');
      if (countEl) countEl.textContent = counts[cat] || 0;
    });
  }

  function renderTags() {
    const allTags = getAllTags();
    tagFilters.innerHTML = '<span class="tag-filter' + (currentTag === 'all' ? ' active' : '') + '" data-tag="all">全部</span>';
    allTags.forEach(tag => {
      tagFilters.innerHTML += '<span class="tag-filter' + (currentTag === tag ? ' active' : '') + '" data-tag="' + escapeHtml(tag) + '">' + escapeHtml(tag) + '</span>';
    });

    // Re-bind tag filter clicks
    tagFilters.querySelectorAll('.tag-filter').forEach(el => {
      el.addEventListener('click', () => {
        currentTag = el.dataset.tag;
        render();
      });
    });
  }

  function renderCards() {
    const filtered = getFilteredPrompts();

    if (filtered.length === 0) {
      promptGrid.style.display = 'none';
      emptyState.style.display = 'block';
      if (searchQuery || currentCategory !== 'all' || currentTag !== 'all') {
        emptyState.querySelector('h3').textContent = '没有找到匹配的提示词';
        emptyState.querySelector('p').textContent = '试试调整搜索关键词或筛选条件';
      } else {
        emptyState.querySelector('h3').textContent = '还没有提示词';
        emptyState.querySelector('p').textContent = '点击右上角「新建提示词」开始你的 AI 提示词管理之旅';
      }
      return;
    }

    promptGrid.style.display = 'grid';
    emptyState.style.display = 'none';

    promptGrid.innerHTML = filtered.map(p => createCardHtml(p)).join('');

    // Bind card action events
    promptGrid.querySelectorAll('.card-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => handleCopy(btn.dataset.id));
    });
    promptGrid.querySelectorAll('.card-template-btn').forEach(btn => {
      btn.addEventListener('click', () => handleTemplate(btn.dataset.id));
    });
    promptGrid.querySelectorAll('.card-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => handleEdit(btn.dataset.id));
    });
    promptGrid.querySelectorAll('.card-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => handleDelete(btn.dataset.id));
    });
    promptGrid.querySelectorAll('.card-favorite').forEach(btn => {
      btn.addEventListener('click', () => handleFavorite(btn.dataset.id));
    });
  }

  function createCardHtml(prompt) {
    const hasVars = /\{\{.+?\}\}/.test(prompt.content);
    const contentDisplay = highlightVariables(escapeHtml(prompt.content));
    const catName = CATEGORY_NAMES[prompt.category] || prompt.category;
    const favIcon = prompt.favorite ? '⭐' : '☆';
    const tagsHtml = (prompt.tags || []).map(t =>
      '<span class="card-tag">' + escapeHtml(t) + '</span>'
    ).join('');
    const noteHtml = prompt.note
      ? '<div class="card-note">💡 ' + escapeHtml(prompt.note) + '</div>'
      : '';
    const templateBtn = hasVars
      ? '<button class="btn btn-ghost btn-sm card-template-btn" data-id="' + prompt.id + '">🔧 填充变量</button>'
      : '';

    return `
      <div class="prompt-card" data-id="${prompt.id}">
        <div class="card-header">
          <span class="card-title">${escapeHtml(prompt.title)}</span>
          <button class="card-favorite" data-id="${prompt.id}" title="收藏">${favIcon}</button>
        </div>
        <span class="card-category">${catName}</span>
        <div class="card-content">${contentDisplay}</div>
        ${tagsHtml ? '<div class="card-tags">' + tagsHtml + '</div>' : ''}
        ${noteHtml}
        <div class="card-meta">
          <span>复制 ${prompt.copyCount || 0} 次</span>
          <span>${prompt.createdAt || ''}</span>
        </div>
        <div class="card-actions">
          <button class="btn btn-primary btn-sm card-copy-btn" data-id="${prompt.id}">📋 复制</button>
          ${templateBtn}
          <button class="btn btn-ghost btn-sm card-edit-btn" data-id="${prompt.id}">✏️ 编辑</button>
          <button class="btn btn-danger btn-sm card-delete-btn" data-id="${prompt.id}">🗑️</button>
        </div>
      </div>
    `;
  }

  function highlightVariables(text) {
    return text.replace(/\{\{(.+?)\}\}/g, '<span class="variable">{{$1}}</span>');
  }

  // ===== Actions =====
  function handleCopy(id) {
    const prompt = prompts.find(p => p.id === id);
    if (!prompt) return;

    copyToClipboard(prompt.content);
    prompt.copyCount = (prompt.copyCount || 0) + 1;
    totalCopied++;
    localStorage.setItem(COPY_COUNT_KEY, totalCopied.toString());
    savePrompts();
    render();
    showToast('✅ 已复制到剪贴板！');
  }

  function handleFavorite(id) {
    const prompt = prompts.find(p => p.id === id);
    if (!prompt) return;
    prompt.favorite = !prompt.favorite;
    savePrompts();
    render();
    showToast(prompt.favorite ? '⭐ 已收藏' : '取消收藏');
  }

  function handleEdit(id) {
    const prompt = prompts.find(p => p.id === id);
    if (!prompt) return;
    editingId = id;
    modalTitle.textContent = '编辑提示词';
    promptTitle.value = prompt.title;
    promptCategory.value = prompt.category;
    promptContent.value = prompt.content;
    promptTags.value = (prompt.tags || []).join(', ');
    promptNote.value = prompt.note || '';
    detectVariables();
    openModal(promptModal);
  }

  function handleDelete(id) {
    if (!confirm('确定要删除这条提示词吗？')) return;
    prompts = prompts.filter(p => p.id !== id);
    savePrompts();
    render();
    showToast('🗑️ 已删除');
  }

  function handleSave() {
    const title = promptTitle.value.trim();
    const content = promptContent.value.trim();

    if (!title) {
      showToast('⚠️ 请输入标题', 'warning');
      promptTitle.focus();
      return;
    }
    if (!content) {
      showToast('⚠️ 请输入提示词内容', 'warning');
      promptContent.focus();
      return;
    }

    const tags = promptTags.value
      .split(/[,，]/)
      .map(t => t.trim())
      .filter(Boolean);

    const now = new Date().toISOString().slice(0, 10);

    if (editingId) {
      // Update existing
      const prompt = prompts.find(p => p.id === editingId);
      if (prompt) {
        prompt.title = title;
        prompt.category = promptCategory.value;
        prompt.content = content;
        prompt.tags = tags;
        prompt.note = promptNote.value.trim();
      }
    } else {
      // Create new
      prompts.unshift({
        id: generateId(),
        title: title,
        category: promptCategory.value,
        content: content,
        tags: tags,
        note: promptNote.value.trim(),
        favorite: false,
        copyCount: 0,
        createdAt: now
      });
    }

    savePrompts();
    closeModal(promptModal);
    resetForm();
    render();
    showToast(editingId ? '✅ 已更新' : '✅ 已创建');
    editingId = null;
  }

  // ===== Template System =====
  function handleTemplate(id) {
    const prompt = prompts.find(p => p.id === id);
    if (!prompt) return;

    const vars = extractVariables(prompt.content);
    if (vars.length === 0) {
      handleCopy(id);
      return;
    }

    const fieldsContainer = $('#templateFields');
    fieldsContainer.innerHTML = vars.map(v =>
      `<div class="template-field">
        <label>{{${escapeHtml(v)}}}</label>
        <input type="text" data-var="${escapeHtml(v)}" placeholder="输入 ${escapeHtml(v)}" />
      </div>`
    ).join('');

    // Store template prompt id
    templateModal.dataset.promptId = id;
    $('#templatePreview').style.display = 'none';
    openModal(templateModal);

    // Focus first field
    const firstInput = fieldsContainer.querySelector('input');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
  }

  function getFilledTemplate() {
    const id = templateModal.dataset.promptId;
    const prompt = prompts.find(p => p.id === id);
    if (!prompt) return '';

    let result = prompt.content;
    templateModal.querySelectorAll('.template-field input').forEach(input => {
      const varName = input.dataset.var;
      const value = input.value || '{{' + varName + '}}';
      result = result.replace(new RegExp('\\{\\{' + escapeRegex(varName) + '\\}\\}', 'g'), value);
    });
    return result;
  }

  function handleTemplateCopy() {
    const filled = getFilledTemplate();
    copyToClipboard(filled);

    // Update copy count
    const id = templateModal.dataset.promptId;
    const prompt = prompts.find(p => p.id === id);
    if (prompt) {
      prompt.copyCount = (prompt.copyCount || 0) + 1;
      totalCopied++;
      localStorage.setItem(COPY_COUNT_KEY, totalCopied.toString());
      savePrompts();
    }

    closeModal(templateModal);
    render();
    showToast('✅ 已复制填充后的提示词！');
  }

  function handleTemplatePreview() {
    const previewEl = $('#templatePreview');
    const previewContent = $('#previewContent');
    const isVisible = previewEl.style.display !== 'none';

    if (isVisible) {
      previewEl.style.display = 'none';
    } else {
      previewContent.textContent = getFilledTemplate();
      previewEl.style.display = 'block';
    }
  }

  function extractVariables(content) {
    const matches = content.match(/\{\{(.+?)\}\}/g);
    if (!matches) return [];
    const vars = [...new Set(matches.map(m => m.slice(2, -2)))];
    return vars;
  }

  function detectVariables() {
    const content = promptContent.value;
    const vars = extractVariables(content);
    if (vars.length > 0) {
      variableHint.style.display = 'flex';
      detectedVars.textContent = vars.map(v => '{{' + v + '}}').join('  ');
    } else {
      variableHint.style.display = 'none';
    }
  }

  // ===== Import / Export =====
  function handleExport() {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      prompts: prompts
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'promptvault-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('📤 数据已导出');
  }

  function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const importedPrompts = data.prompts || data;

        if (!Array.isArray(importedPrompts)) {
          showToast('⚠️ 无效的数据格式', 'warning');
          return;
        }

        const count = importedPrompts.length;
        if (confirm(`即将导入 ${count} 条提示词，是否继续？\n（已有数据不会被覆盖）`)) {
          // Merge — skip duplicates by id
          const existingIds = new Set(prompts.map(p => p.id));
          const newPrompts = importedPrompts.filter(p => !existingIds.has(p.id));
          prompts = [...newPrompts, ...prompts];
          savePrompts();
          render();
          showToast(`✅ 成功导入 ${newPrompts.length} 条新提示词`);
        }
      } catch (err) {
        showToast('⚠️ 文件解析失败', 'warning');
      }
    };
    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
  }

  // ===== Modal Controls =====
  function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function resetForm() {
    promptTitle.value = '';
    promptCategory.value = 'writing';
    promptContent.value = '';
    promptTags.value = '';
    promptNote.value = '';
    variableHint.style.display = 'none';
    editingId = null;
    modalTitle.textContent = '新建提示词';
  }

  // ===== Utility Functions =====
  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  function escapeHtml(str) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(str).replace(/[&<>"']/g, c => map[c]);
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // ===== Event Binding =====
  function bindEvents() {
    // Theme toggle
    $('#themeToggle').addEventListener('click', toggleTheme);

    // Search
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderCards();
    });

    // Category navigation
    categoryList.querySelectorAll('.category-item').forEach(item => {
      item.addEventListener('click', () => {
        currentCategory = item.dataset.category;
        currentTag = 'all'; // Reset tag filter on category change
        render();
      });
    });

    // Add prompt
    $('#addPromptBtn').addEventListener('click', () => {
      resetForm();
      openModal(promptModal);
      setTimeout(() => promptTitle.focus(), 100);
    });

    // Modal controls - Prompt Modal
    $('#modalClose').addEventListener('click', () => { closeModal(promptModal); resetForm(); });
    $('#modalCancel').addEventListener('click', () => { closeModal(promptModal); resetForm(); });
    $('#modalSave').addEventListener('click', handleSave);

    // Close on overlay click
    promptModal.addEventListener('click', (e) => {
      if (e.target === promptModal) { closeModal(promptModal); resetForm(); }
    });

    // Detect variables while typing
    promptContent.addEventListener('input', detectVariables);

    // Template modal controls
    $('#templateModalClose').addEventListener('click', () => closeModal(templateModal));
    $('#templateCancel').addEventListener('click', () => closeModal(templateModal));
    $('#templateCopy').addEventListener('click', handleTemplateCopy);
    $('#previewTemplateBtn').addEventListener('click', handleTemplatePreview);
    templateModal.addEventListener('click', (e) => {
      if (e.target === templateModal) closeModal(templateModal);
    });

    // Export / Import
    $('#exportBtn').addEventListener('click', handleExport);
    $('#importBtn').addEventListener('click', () => $('#importFile').click());
    $('#importFile').addEventListener('change', handleImport);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Escape — close modals
      if (e.key === 'Escape') {
        if (promptModal.classList.contains('active')) { closeModal(promptModal); resetForm(); }
        if (templateModal.classList.contains('active')) closeModal(templateModal);
      }
      // Ctrl/Cmd + K — focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
      // Ctrl/Cmd + N — new prompt
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        resetForm();
        openModal(promptModal);
        setTimeout(() => promptTitle.focus(), 100);
      }
    });
  }

  // ===== Start =====
  document.addEventListener('DOMContentLoaded', init);
})();
