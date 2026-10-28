/* Fades the crowd once the drawer is mostly in view, leaving the keepers lit. */
if (!customElements.get('ht-fly-drawer')) {
  customElements.define('ht-fly-drawer', class HtFlyDrawer extends HTMLElement {
    connectedCallback() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || (window.Shopify && window.Shopify.designMode)) { this.classList.add('is-sorted'); return; }
      new IntersectionObserver(([e], o) => {
        if (e.isIntersecting) { setTimeout(() => this.classList.add('is-sorted'), 350); o.disconnect(); }
      }, { threshold: 0.55 }).observe(this);
    }
  });
}
