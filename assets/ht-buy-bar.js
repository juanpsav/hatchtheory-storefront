/* Shows the sticky buy bar once every other product form on the page has scrolled above the viewport. */
if (!customElements.get('ht-buy-bar')) {
  customElements.define('ht-buy-bar', class HtBuyBar extends HTMLElement {
    connectedCallback() {
      const forms = [...document.querySelectorAll('product-form')].filter((f) => !this.contains(f));
      if (!forms.length) return;
      const state = new Map();
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => state.set(e.target, e.isIntersecting || e.boundingClientRect.top > 0));
        const show = [...state.values()].every((v) => v === false);
        this.classList.toggle('is-visible', show);
        this.setAttribute('aria-hidden', String(!show));
        this.toggleAttribute('inert', !show);
      });
      forms.forEach((f) => { state.set(f, true); io.observe(f); });
      this.toggleAttribute('inert', true);
    }
  });
}
