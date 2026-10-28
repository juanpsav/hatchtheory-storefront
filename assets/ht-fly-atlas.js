if (!customElements.get('ht-fly-atlas')) {
  customElements.define('ht-fly-atlas', class extends HTMLElement {
    connectedCallback() {
      if (window.Shopify?.designMode || this.controller) return;
      this.groups = [...this.querySelectorAll('[data-atlas-category]')].map(element => ({
        element,
        button: element.querySelector('.ht-atlas__toggle'),
        label: element.querySelector('[data-atlas-static]'),
        descriptions: [...element.querySelectorAll('[data-atlas-description]')],
      })).filter(group => group.button && group.label && group.descriptions.length);
      if (!this.groups.length) return;
      this.controller = new AbortController();
      const options = { signal: this.controller.signal };
      this.groups.forEach(group => {
        this.setExpanded(group, false);
        group.label.hidden = true;
        group.button.hidden = false;
        group.button.addEventListener('click', () => {
          const expand = group.button.getAttribute('aria-expanded') !== 'true';
          this.groups.forEach(other => this.setExpanded(other, other === group && expand));
        }, options);
      });
    }

    setExpanded(group, expanded) {
      group.button.setAttribute('aria-expanded', String(expanded));
      group.element.classList.toggle('ht-atlas__category--open', expanded);
      group.descriptions.forEach(description => { description.hidden = !expanded; });
    }

    disconnectedCallback() {
      this.controller?.abort();
      this.controller = null;
      this.groups?.forEach(group => {
        this.setExpanded(group, true);
        group.button.hidden = true;
        group.label.hidden = false;
      });
    }
  });
}
