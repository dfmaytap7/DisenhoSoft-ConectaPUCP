/* ConectaPUCP — iconos y utilidades de rangos de gamificación */
(function () {
  'use strict';

  var RANK_ICONS = {
    CACHIMBO: '<svg class="rank-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>',
    REGULAR: '<svg class="rank-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    EXPERTO: '<svg class="rank-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M8.56 14.49 6 22l6-3 6 3-2.56-7.51"/></svg>',
    AVANZADO: '<svg class="rank-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    SENIOR: '<svg class="rank-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
    ELITE: '<svg class="rank-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20"/><path d="m4 20 2-9 6 4 4-7 4 7 6-4 2 9"/></svg>'
  };

  function resolveRank(el) {
    if (el.dataset.rank) return el.dataset.rank.toUpperCase();
    var match = el.className.match(/rank-(CACHIMBO|REGULAR|EXPERTO|AVANZADO|SENIOR|ELITE)/i);
    return match ? match[1].toUpperCase() : null;
  }

  function injectIcon(el) {
    var rank = resolveRank(el);
    if (!rank || !RANK_ICONS[rank]) return;
    var slot = el.querySelector('.rank-icon');
    if (!slot) {
      slot = document.createElement('span');
      slot.className = 'rank-icon';
      slot.setAttribute('aria-hidden', 'true');
      el.insertBefore(slot, el.firstChild);
    }
    slot.innerHTML = RANK_ICONS[rank];
  }

  function initRankIcons() {
    document.querySelectorAll('[data-rank], .rank-badge, .rank-badge-sidebar, .rank-section-header, .rank-inline, .notif-icon[data-rank]').forEach(injectIcon);
  }

  window.initRankIcons = initRankIcons;
  window.getRankIcon = function (rank) { return RANK_ICONS[(rank || '').toUpperCase()] || ''; };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRankIcons);
  } else {
    initRankIcons();
  }
})();
