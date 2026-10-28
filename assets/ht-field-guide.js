/**
 * HT 2026-10-20 — Field Guide table lookup.
 * Builds a picker from the first table in an article body: choose a value from the
 * first column, read the last column. All labels and values come from the table itself.
 * The table stays in place, and the selected row is highlighted in it.
 */
(() => {
  /** @param {HTMLElement} body */
  const enhance = (body) => {
    const table = body.querySelector('table');
    if (!table || table.dataset.htFgLookup === 'done') return;

    const headers = [...table.querySelectorAll('thead th')].map((cell) => cell.textContent.trim());
    const rows = [...table.querySelectorAll('tbody tr')]
      .map((row) => ({ row, cells: [...row.cells].map((cell) => cell.textContent.trim()) }))
      .filter(({ cells }) => cells.length >= 2);
    if (headers.length < 2 || rows.length < 2) return;

    const id = `HtFgLookup-${Math.random().toString(36).slice(2, 8)}`;
    // The server renders the panel (heading + subtitle) so search engines read it; create one if absent.
    let wrapper = body.querySelector('[data-ht-fg-lookup-panel]');
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'ht-fg-lookup';
      table.before(wrapper);
    }
    wrapper.classList.add('is-ready');

    const field = document.createElement('div');
    const label = document.createElement('label');
    label.className = 'ht-fg-lookup__label';
    label.htmlFor = id;
    label.textContent = headers[0];
    const select = document.createElement('select');
    select.className = 'ht-fg-lookup__select';
    select.id = id;
    for (const [index, { cells }] of rows.entries()) {
      select.add(new Option(cells[0], String(index)));
    }
    field.append(label, select);

    const result = document.createElement('p');
    result.className = 'ht-fg-lookup__result';
    result.setAttribute('aria-live', 'polite');
    const resultLabel = document.createElement('span');
    resultLabel.className = 'ht-fg-lookup__result-label';
    resultLabel.textContent = headers[headers.length - 1];
    const resultValue = document.createElement('span');
    resultValue.className = 'ht-fg-lookup__result-value';
    result.append(resultLabel, resultValue);

    wrapper.append(field, result);
    table.dataset.htFgLookup = 'done';

    const update = () => {
      const chosen = rows[Number(select.value)];
      resultValue.textContent = chosen.cells[chosen.cells.length - 1];
      for (const { row } of rows) row.classList.toggle('is-selected', row === chosen.row);
    };

    // Start on the middle row: a typical fly size rather than the extreme.
    select.value = String(Math.floor((rows.length - 1) / 2));
    select.addEventListener('change', update);
    update();
  };

  const init = () => {
    for (const body of document.querySelectorAll('[data-ht-fg-lookup="true"]')) enhance(body);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/**
 * Sticky side column that never hides its own bottom: it sticks below the header when it
 * fits, otherwise it scrolls until its bottom is in view and sticks there.
 */
(() => {
  const selector = '.ht-fg-article__header, .ht-fg-index--compact .ht-fg-hero';
  const desktop = window.matchMedia('(min-width: 990px)');
  const preferredTop = 120;
  const bottomGap = 24;

  const place = () => {
    for (const column of document.querySelectorAll(selector)) {
      if (!desktop.matches) {
        column.style.removeProperty('--ht-fg-sticky-top');
        continue;
      }
      const top = Math.min(preferredTop, window.innerHeight - column.offsetHeight - bottomGap);
      column.style.setProperty('--ht-fg-sticky-top', `${top}px`);
    }
  };

  const start = () => {
    place();
    window.addEventListener('resize', place, { passive: true });
    desktop.addEventListener('change', place);
    for (const img of document.querySelectorAll(`${selector.split(', ').map((s) => `${s} img`).join(', ')}`)) {
      if (!img.complete) img.addEventListener('load', place, { once: true });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

/**
 * "What's hatching now": shows one month at a time. Opens on the month in the URL hash
 * (#may) or the reader's current month; month links switch without scrolling the page.
 * Without JavaScript all twelve months are listed and the links jump to them.
 */
(() => {
  const start = () => {
    for (const root of document.querySelectorAll('[data-ht-fg-hatch]')) {
      const months = [...root.querySelectorAll('.ht-fg-hatch__month')];
      const links = [...root.querySelectorAll('.ht-fg-hatch__months a')];
      if (!months.length) continue;

      const show = (number, { updateHash = false } = {}) => {
        const target = months.find((month) => month.dataset.month === String(number)) || months[0];
        for (const month of months) month.hidden = month !== target;
        for (const link of links) {
          const current = link.dataset.month === target.dataset.month;
          if (current) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        }
        if (updateHash) history.replaceState(null, '', `#${target.id}`);
      };

      const fromHash = () => months.find((month) => `#${month.id}` === window.location.hash);
      const initial = fromHash();
      show(initial ? initial.dataset.month : new Date().getMonth() + 1);
      root.classList.add('is-enhanced');

      for (const link of links) {
        link.addEventListener('click', (event) => {
          event.preventDefault();
          show(link.dataset.month, { updateHash: true });
        });
      }
      window.addEventListener('hashchange', () => {
        const month = fromHash();
        if (month) show(month.dataset.month);
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
