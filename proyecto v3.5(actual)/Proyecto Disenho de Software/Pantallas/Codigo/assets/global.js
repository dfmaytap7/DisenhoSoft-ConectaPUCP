/* ConectaPUCP — utilidades globales del prototipo */
(function () {
  'use strict';

  /* ── Overlay de carga global (RF16) ── */
  if (!document.getElementById('globalLoadingOverlay')) {
    const ov = document.createElement('div');
    ov.id = 'globalLoadingOverlay';
    ov.className = 'loading-overlay';
    ov.innerHTML = '<div class="spinner"></div><div class="loading-text">Cargando…</div>';
    document.body.appendChild(ov);
  }

  window.showLoading = function (text) {
    const ov = document.getElementById('globalLoadingOverlay');
    if (!ov) return;
    const t = ov.querySelector('.loading-text');
    if (t && text) t.textContent = text;
    ov.classList.add('show');
  };

  window.hideLoading = function () {
    const ov = document.getElementById('globalLoadingOverlay');
    if (ov) ov.classList.remove('show');
  };

  window.withLoading = function (fn, opts) {
    const waitMs = (opts && opts.waitMs) || 1100;
    const timeoutMs = (opts && opts.timeoutMs) || 5200;
    const timeoutEl = opts && opts.timeoutEl;
    const loadingText = (opts && opts.loadingText) || 'Cargando…';
    showLoading(loadingText);
    if (timeoutEl) timeoutEl.hidden = true;
    return new Promise(function (resolve) {
      setTimeout(function () {
        hideLoading();
        if (opts && opts.simulateTimeout) {
          if (timeoutEl) timeoutEl.hidden = false;
          resolve({ timedOut: true });
        } else {
          if (fn) fn();
          resolve({ timedOut: false });
        }
      }, opts && opts.simulateTimeout ? timeoutMs : waitMs);
    });
  };

  /* ── Búsqueda global unificada (RF01) ── */
  function initGlobalSearch() {
    document.querySelectorAll('.topbar-search input[type="search"]').forEach(function (input) {
      if (input.dataset.globalSearch) return;
      input.dataset.globalSearch = '1';
      input.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        const q = input.value.trim();
        const base = document.querySelector('link[rel="stylesheet"]');
        let prefix = '';
        if (base) {
          const href = base.getAttribute('href') || '';
          if (href.indexOf('../assets') !== -1) prefix = '';
          else if (href.indexOf('assets/') !== -1) prefix = 'estudiante/';
        }
        const url = (prefix || '') + 'busqueda.html' + (q ? '?q=' + encodeURIComponent(q) : '');
        window.location.href = url;
      });
    });
  }

  /* ── Menú móvil (RC01) ── */
  function initMobileNav() {
    const topbar = document.querySelector('.topbar');
    const sidebar = document.querySelector('.sidebar');
    if (!topbar || !sidebar || document.getElementById('mobileMenuBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'mobileMenuBtn';
    btn.className = 'mobile-menu-btn';
    btn.setAttribute('aria-label', 'Abrir menú');
    btn.innerHTML = '<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    topbar.insertBefore(btn, topbar.querySelector('.topbar-search'));

    const backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);

    function close() {
      sidebar.classList.remove('open');
      backdrop.classList.remove('show');
    }
    btn.addEventListener('click', function () {
      sidebar.classList.toggle('open');
      backdrop.classList.toggle('show');
    });
    backdrop.addEventListener('click', close);
    sidebar.querySelectorAll('.nav-item').forEach(function (a) {
      a.addEventListener('click', close);
    });
  }

  /* ── Compartir enlace (RF23) ── */
  window.shareContent = function (type, id, title) {
    const base = 'https://conectapucp.pucp.edu.pe/' + type + '/' + id;
    const msg = 'Enlace copiado:\n' + base + '\n\nEl acceso requiere iniciar sesión con cuenta institucional PUCP (SSO CAS).';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(base).then(function () { alert(msg); });
    } else {
      prompt('Copia este enlace (requiere autenticación PUCP):', base);
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    initGlobalSearch();
    initMobileNav();
  });
})();
