// <vn-map> — inlines assets/vietnam-map.svg (34 provinces + Hoàng Sa / Trường Sa archipelagos).
// Attributes:
//   unlocked="A,B"          provinces filled with --map-unlocked
//   heat="Name:count,..."   choropleth — bolder fill as count crosses 10 / 100 / 1k / 10k
//   interactive             provinces clickable; dispatches bubbling composed
//                           CustomEvent 'province-pick' { detail: { name, count } }
(function () {
  var svgText = null, loading = null;
  var srcBase = document.currentScript && document.currentScript.src;
  function fetchSvg() {
    if (!loading) loading = fetch(new URL('assets/vietnam-map.svg', srcBase || document.baseURI))
      .then(function (r) { return r.text(); })
      .then(function (t) { svgText = t; return t; });
    return loading;
  }
  var TIERS = [
    { min: 10000, fill: '#BE382A' },
    { min: 1000, fill: '#DE9B27' },
    { min: 100, fill: '#E9BA55' },
    { min: 10, fill: '#F0CF8C' },
    { min: 1, fill: '#F6E3BC' }
  ];
  class VNMap extends HTMLElement {
    static get observedAttributes() { return ['unlocked', 'heat', 'interactive']; }
    connectedCallback() {
      var self = this;
      this.style.display = 'block';
      this.style.lineHeight = '0';
      fetchSvg().then(function () { self.renderSvg(); });
    }
    attributeChangedCallback() { if (this._svg) this.applyFills(); }
    renderSvg() {
      if (!svgText || this._svg) return;
      if (!this._root) this._root = this.attachShadow({ mode: 'open' });
      this._root.innerHTML = svgText;
      var svg = this._root.querySelector('svg');
      if (!svg) return;
      this._svg = svg;
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      var self = this;
      svg.addEventListener('click', function (e) {
        if (!self.hasAttribute('interactive')) return;
        var t = e.target;
        while (t && t !== svg && !(t.classList && t.classList.contains('province-shape'))) t = t.parentNode;
        if (t && t !== svg && t.classList) {
          var name = t.getAttribute('data-province');
          self.dispatchEvent(new CustomEvent('province-pick', {
            detail: { name: name, count: self._heat && self._heat[name] || 0 },
            bubbles: true, composed: true
          }));
        }
      });
      this.applyFills();
    }
    applyFills() {
      var unlocked = (this.getAttribute('unlocked') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      var heat = {};
      (this.getAttribute('heat') || '').split(',').forEach(function (pair) {
        var i = pair.lastIndexOf(':');
        if (i > 0) heat[pair.slice(0, i).trim()] = +pair.slice(i + 1) || 0;
      });
      this._heat = heat;
      var interactive = this.hasAttribute('interactive');
      this._svg.querySelectorAll('.province-shape').forEach(function (p) {
        var name = p.getAttribute('data-province');
        var n = heat[name] || 0;
        var tier = null;
        for (var k = 0; k < TIERS.length; k++) { if (n >= TIERS[k].min) { tier = TIERS[k]; break; } }
        var isUn = unlocked.indexOf(name) >= 0;
        p.style.fill = tier ? tier.fill : (isUn ? 'var(--map-unlocked, #F2D8A0)' : 'var(--map-prov, #F1EAE0)');
        p.style.stroke = 'var(--map-stroke, #FFFFFF)';
        p.style.strokeWidth = tier && tier.min >= 1000 ? '1' : '0.7';
        p.style.transition = 'fill .3s';
        p.style.cursor = interactive ? 'pointer' : '';
      });
    }
  }
  if (!customElements.get('vn-map')) customElements.define('vn-map', VNMap);
})();
