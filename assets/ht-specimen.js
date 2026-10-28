/* Blueprint flies index: hover or tap a row (in the drawing or the list) to isolate it.
   On narrow screens one fly is always selected so the description panel is never empty. */
if (!customElements.get('ht-specimen')) {
  customElements.define('ht-specimen', class HtSpecimen extends HTMLElement {
    connectedCallback() {
      this.narrow = window.matchMedia('(max-width: 989px)');
      this.frame = this.querySelector('.ht-spec__frame');
      this.pinned = null;
      const ids = [...this.querySelectorAll('.ht-spec__item')].map((li) => li.dataset.fly);
      this.first = ids[0];
      const on = (el, id, events) => events.forEach(([type, fn]) => el.addEventListener(type, () => fn(id)));
      this.querySelectorAll('.ht-spec__hit').forEach((el) => on(el, el.dataset.fly, [
        ['mouseenter', (id) => { if (!this.narrow.matches) this.set(id); }],
        ['mouseleave', () => { if (!this.narrow.matches) this.set(this.pinned); }],
        ['click', (id) => this.pin(id)]
      ]));
      this.querySelectorAll('.ht-spec__item').forEach((li) => {
        const b = li.querySelector('.ht-spec__row');
        on(b, li.dataset.fly, [
          ['mouseenter', (id) => { if (!this.narrow.matches) this.set(id); }],
          ['mouseleave', () => { if (!this.narrow.matches) this.set(this.pinned); }],
          ['focus', (id) => this.set(id)],
          ['click', (id) => this.pin(id)]
        ]);
      });
      this.querySelectorAll('.ht-spec__chip').forEach((el) => el.addEventListener('click', () => { this.pinned = el.dataset.fly; this.set(el.dataset.fly); }));
      this.narrow.addEventListener('change', () => this.set(this.pinned));
      this.set(null);
    }
    pin(id) {
      this.pinned = this.narrow.matches ? id : (this.pinned === id ? null : id);
      this.set(this.pinned);
    }
    set(id) {
      if (!id && this.narrow.matches) id = this.pinned || this.first;
      this.classList.toggle('is-active', !!id);
      this.querySelectorAll('[data-fly]').forEach((el) => {
        const match = el.dataset.fly === id;
        el.classList.toggle('is-on', match);
        if (el.classList.contains('ht-spec__chip')) el.setAttribute('aria-pressed', String(match));
        const row = el.classList.contains('ht-spec__item') ? el.querySelector('.ht-spec__row') : null;
        if (row) row.setAttribute('aria-expanded', String(match));
      });
      const hit = id && this.querySelector(`.ht-spec__hit[data-fly="${CSS.escape(id)}"]`);
      if (hit && this.frame) {
        const pad = '0.8rem';
        this.frame.style.left = `calc(${hit.style.getPropertyValue('--x')} - ${pad})`;
        this.frame.style.top = `calc(${hit.style.getPropertyValue('--y')} - ${pad})`;
        this.frame.style.width = `calc(${hit.style.getPropertyValue('--w')} + ${pad} * 2)`;
        this.frame.style.height = `calc(${hit.style.getPropertyValue('--h')} + ${pad} * 2)`;
      } else if (this.frame && id) {
        this.classList.remove('is-active');
      }
    }
  });
}
