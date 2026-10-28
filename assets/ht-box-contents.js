/* Box contents rows: tap to read the description; hover (pointer devices) to frame the fly in the blueprint image. */
if (!customElements.get('ht-box-contents')) {
  customElements.define('ht-box-contents', class HtBoxContents extends HTMLElement {
    connectedCallback() {
      this.hover = window.matchMedia('(hover: hover) and (min-width: 990px)');
      const p = (this.dataset.placement || '0 0 100').trim().split(/\s+/).map(Number);
      this.place = { x: p[0] || 0, y: p[1] || 0, w: p[2] || 100, h: p[3] || p[2] || 100 };
      this.querySelectorAll('.ht-box__row[data-region]').forEach((row) => {
        row.addEventListener('click', () => this.toggle(row));
        row.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.toggle(row); } });
        row.addEventListener('mouseenter', () => { if (this.hover.matches) this.frame(row); });
        row.addEventListener('mouseleave', () => { if (this.hover.matches) this.frame(null); });
      });
    }
    toggle(row) {
      const desc = document.getElementById(row.getAttribute('aria-controls'));
      const open = desc && desc.hidden;
      this.querySelectorAll('.ht-box__desc').forEach((d) => { d.hidden = true; });
      this.querySelectorAll('.ht-box__row').forEach((r) => r.setAttribute('aria-expanded', 'false'));
      if (desc && open) { desc.hidden = false; row.setAttribute('aria-expanded', 'true'); }
    }
    target() {
      const id = this.dataset.mediaId;
      if (!id) return null;
      const section = this.closest('.shopify-section') || document;
      const gallery = section.querySelector('media-gallery');
      const item = gallery && gallery.querySelector(`[data-media-id="${CSS.escape(id)}"]`);
      const host = item && (item.querySelector('.product__media') || item);
      return gallery && host ? { gallery, item, host } : null;
    }
    frame(row) {
      this.querySelectorAll('.ht-box__row').forEach((r) => r.classList.toggle('is-on', r === row));
      const t = this.target();
      if (!t) return;
      let f = t.host.querySelector('.ht-box-frame');
      if (!f) { f = document.createElement('span'); f.className = 'ht-box-frame'; f.setAttribute('aria-hidden', 'true'); t.host.classList.add('ht-box-host'); t.host.append(f); }
      if (!row) { f.classList.remove('is-on'); return; }
      if (!t.item.classList.contains('is-active') && typeof t.gallery.setActiveMedia === 'function') t.gallery.setActiveMedia(this.dataset.mediaId, false);
      const r = row.dataset.region.trim().split(/\s+/).map(Number);
      const kx = this.place.w / 100, ky = this.place.h / 100, pad = 1.2;
      f.style.left = `${this.place.x + r[0] * kx - pad}%`;
      f.style.top = `${this.place.y + r[1] * ky - pad}%`;
      f.style.width = `${r[2] * kx + pad * 2}%`;
      f.style.height = `${r[3] * ky + pad * 2}%`;
      f.classList.add('is-on');
    }
  });
}
