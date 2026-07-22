// <v-icon name="LocationProperty1Bold" size="20"> — renders iconsax data from the Figma file + a few simple custom glyphs. Paints with currentColor.
(function () {
  var S = 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';
  var CUSTOM = {
    Camera: { viewBox: "0 0 24 24", body: '<path d="M8.2 6.2 9.4 4.2h5.2l1.2 2h2.7a2.3 2.3 0 0 1 2.3 2.3v8.2a2.3 2.3 0 0 1-2.3 2.3H5.5a2.3 2.3 0 0 1-2.3-2.3V8.5a2.3 2.3 0 0 1 2.3-2.3h2.7Z" ' + S + '/><circle cx="12" cy="12.6" r="3.6" ' + S + '/>' },
    CameraFill: { viewBox: "0 0 24 24", body: '<path d="M8.2 6.2 9.4 4.2h5.2l1.2 2h2.7a2.3 2.3 0 0 1 2.3 2.3v8.2a2.3 2.3 0 0 1-2.3 2.3H5.5a2.3 2.3 0 0 1-2.3-2.3V8.5a2.3 2.3 0 0 1 2.3-2.3h2.7Z" fill="currentColor"/><circle cx="12" cy="12.6" r="3.4" fill="#fff"/><circle cx="12" cy="12.6" r="2" fill="currentColor"/>' },
    Heart: { viewBox: "0 0 24 24", body: '<path d="M12 20.5C7.3 16.4 3.2 13.1 3.2 9.2 3.2 6.6 5.2 4.7 7.5 4.7c1.8 0 3.4 1 4.5 2.5 1.1-1.5 2.7-2.5 4.5-2.5 2.3 0 4.3 1.9 4.3 4.5 0 3.9-4.1 7.2-8.8 11.3Z" ' + S + '/>' },
    HeartFill: { viewBox: "0 0 24 24", body: '<path d="M12 20.5C7.3 16.4 3.2 13.1 3.2 9.2 3.2 6.6 5.2 4.7 7.5 4.7c1.8 0 3.4 1 4.5 2.5 1.1-1.5 2.7-2.5 4.5-2.5 2.3 0 4.3 1.9 4.3 4.5 0 3.9-4.1 7.2-8.8 11.3Z" fill="currentColor"/>' },
    Flame: { viewBox: "0 0 24 24", body: '<path d="M12 2.2c.9 3.4 4.8 5 4.8 9.3a4.8 4.8 0 0 1-9.6 0c0-1.9.9-3.3 1.9-4.3.1 1.3.6 2.2 1.5 2.7-.5-2.9.4-5.6 1.4-7.7Z" fill="currentColor"/><path d="M12 21.8c-3.9 0-7-2.9-7-6.9 0-.8.1-1.5.4-2.2" fill="none" stroke="currentColor" stroke-width="0" opacity="0"/>' },
    ArrowLeft: { viewBox: "0 0 24 24", body: '<path d="M14.5 5 7.8 12l6.7 7" ' + S + '/>' },
    ChevronRight: { viewBox: "0 0 24 24", body: '<path d="M9.5 5l6.7 7-6.7 7" ' + S + '/>' },
    Close: { viewBox: "0 0 24 24", body: '<path d="M6 6l12 12M18 6 6 18" ' + S + '/>' },
    Check: { viewBox: "0 0 24 24", body: '<path d="M4.5 12.5 9.8 18 19.5 6.5" ' + S + '/>' },
    Send: { viewBox: "0 0 24 24", body: '<path d="M21 3.5 3.3 10.8l6.7 2.6 2.6 6.7L21 3.5Z" ' + S + '/><path d="M10 13.4 21 3.5" ' + S + '/>' },
    Flip: { viewBox: "0 0 24 24", body: '<path d="M19.6 13.8A7.8 7.8 0 1 1 18 7.2" ' + S + '/><path d="M18.6 3.4v3.9h-3.9" ' + S + '/>' },
    Globe: { viewBox: "0 0 24 24", body: '<circle cx="12" cy="12" r="8.8" ' + S + '/><ellipse cx="12" cy="12" rx="3.8" ry="8.8" ' + S + '/><path d="M3.2 12h17.6" ' + S + '/>' },
    Bolt: { viewBox: "0 0 24 24", body: '<path d="M13.2 2.5 4.5 14h5.6l-1.3 7.5L17.5 10h-5.6l1.3-7.5Z" fill="currentColor"/>' },
    Bookmark: { viewBox: "0 0 24 24", body: '<path d="M6.5 3.5h11v17l-5.5-3.7-5.5 3.7v-17Z" ' + S + '/>' },
    Gallery: { viewBox: "0 0 24 24", body: '<rect x="3.2" y="3.2" width="17.6" height="17.6" rx="3.5" ' + S + '/><circle cx="9" cy="9" r="1.7" ' + S + '/><path d="M4 17.5 9.5 13l3.5 3 3-2.5 4.5 4" ' + S + '/>' },
    Plus: { viewBox: "0 0 24 24", body: '<path d="M12 5v14M5 12h14" ' + S + '/>' },
    StarFill: { viewBox: "0 0 24 24", body: '<path d="m12 2.8 2.7 5.6 6.1.8-4.5 4.3 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.2 9.2l6.1-.8L12 2.8Z" fill="currentColor"/>' }
  };
  var data = null, waiting = [];
  import('./assets/icons/icon-data.js').then(function (m) {
    data = m.default;
    waiting.forEach(function (el) { el.render(); });
    waiting = [];
  });
  class VIcon extends HTMLElement {
    static get observedAttributes() { return ['name', 'size']; }
    connectedCallback() { this.render(); }
    attributeChangedCallback() { if (this.isConnected) this.render(); }
    render() {
      var name = this.getAttribute('name') || '';
      var d = CUSTOM[name] || (data && data[name]);
      if (!d) {
        if (!data && waiting.indexOf(this) < 0) waiting.push(this);
        return;
      }
      var s = this.getAttribute('size') || 24;
      this.style.display = 'inline-flex';
      this.style.lineHeight = '0';
      this.style.flexShrink = '0';
      if (!this._root) this._root = this.attachShadow({ mode: 'open' });
      this._root.innerHTML = '<svg width="' + s + '" height="' + s + '" viewBox="' + d.viewBox + '" fill="none" xmlns="http://www.w3.org/2000/svg">' + d.body + '</svg>';
    }
  }
  if (!customElements.get('v-icon')) customElements.define('v-icon', VIcon);
})();
