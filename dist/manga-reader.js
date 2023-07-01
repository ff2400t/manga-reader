/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const X = window, kt = X.ShadowRoot && (X.ShadyCSS === void 0 || X.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Pt = Symbol(), Rt = /* @__PURE__ */ new WeakMap();
let Ft = class {
  constructor(t, e, r) {
    if (this._$cssResult$ = !0, r !== Pt)
      throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (kt && t === void 0) {
      const r = e !== void 0 && e.length === 1;
      r && (t = Rt.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), r && Rt.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Kt = (i) => new Ft(typeof i == "string" ? i : i + "", void 0, Pt), nt = (i, ...t) => {
  const e = i.length === 1 ? i[0] : t.reduce((r, s, o) => r + ((n) => {
    if (n._$cssResult$ === !0)
      return n.cssText;
    if (typeof n == "number")
      return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + i[o + 1], i[0]);
  return new Ft(e, i, Pt);
}, de = (i, t) => {
  kt ? i.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet) : t.forEach((e) => {
    const r = document.createElement("style"), s = X.litNonce;
    s !== void 0 && r.setAttribute("nonce", s), r.textContent = e.cssText, i.appendChild(r);
  });
}, Ht = kt ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const r of t.cssRules)
    e += r.cssText;
  return Kt(e);
})(i) : i;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var dt;
const rt = window, Mt = rt.trustedTypes, ue = Mt ? Mt.emptyScript : "", Nt = rt.reactiveElementPolyfillSupport, _t = { toAttribute(i, t) {
  switch (t) {
    case Boolean:
      i = i ? ue : null;
      break;
    case Object:
    case Array:
      i = i == null ? i : JSON.stringify(i);
  }
  return i;
}, fromAttribute(i, t) {
  let e = i;
  switch (t) {
    case Boolean:
      e = i !== null;
      break;
    case Number:
      e = i === null ? null : Number(i);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(i);
      } catch {
        e = null;
      }
  }
  return e;
} }, Yt = (i, t) => t !== i && (t == t || i == i), ut = { attribute: !0, type: String, converter: _t, reflect: !1, hasChanged: Yt };
let U = class extends HTMLElement {
  constructor() {
    super(), this._$Ei = /* @__PURE__ */ new Map(), this.isUpdatePending = !1, this.hasUpdated = !1, this._$El = null, this.u();
  }
  static addInitializer(t) {
    var e;
    this.finalize(), ((e = this.h) !== null && e !== void 0 ? e : this.h = []).push(t);
  }
  static get observedAttributes() {
    this.finalize();
    const t = [];
    return this.elementProperties.forEach((e, r) => {
      const s = this._$Ep(r, e);
      s !== void 0 && (this._$Ev.set(s, r), t.push(s));
    }), t;
  }
  static createProperty(t, e = ut) {
    if (e.state && (e.attribute = !1), this.finalize(), this.elementProperties.set(t, e), !e.noAccessor && !this.prototype.hasOwnProperty(t)) {
      const r = typeof t == "symbol" ? Symbol() : "__" + t, s = this.getPropertyDescriptor(t, r, e);
      s !== void 0 && Object.defineProperty(this.prototype, t, s);
    }
  }
  static getPropertyDescriptor(t, e, r) {
    return { get() {
      return this[e];
    }, set(s) {
      const o = this[t];
      this[e] = s, this.requestUpdate(t, o, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) || ut;
  }
  static finalize() {
    if (this.hasOwnProperty("finalized"))
      return !1;
    this.finalized = !0;
    const t = Object.getPrototypeOf(this);
    if (t.finalize(), t.h !== void 0 && (this.h = [...t.h]), this.elementProperties = new Map(t.elementProperties), this._$Ev = /* @__PURE__ */ new Map(), this.hasOwnProperty("properties")) {
      const e = this.properties, r = [...Object.getOwnPropertyNames(e), ...Object.getOwnPropertySymbols(e)];
      for (const s of r)
        this.createProperty(s, e[s]);
    }
    return this.elementStyles = this.finalizeStyles(this.styles), !0;
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const r = new Set(t.flat(1 / 0).reverse());
      for (const s of r)
        e.unshift(Ht(s));
    } else
      t !== void 0 && e.push(Ht(t));
    return e;
  }
  static _$Ep(t, e) {
    const r = e.attribute;
    return r === !1 ? void 0 : typeof r == "string" ? r : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  u() {
    var t;
    this._$E_ = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$Eg(), this.requestUpdate(), (t = this.constructor.h) === null || t === void 0 || t.forEach((e) => e(this));
  }
  addController(t) {
    var e, r;
    ((e = this._$ES) !== null && e !== void 0 ? e : this._$ES = []).push(t), this.renderRoot !== void 0 && this.isConnected && ((r = t.hostConnected) === null || r === void 0 || r.call(t));
  }
  removeController(t) {
    var e;
    (e = this._$ES) === null || e === void 0 || e.splice(this._$ES.indexOf(t) >>> 0, 1);
  }
  _$Eg() {
    this.constructor.elementProperties.forEach((t, e) => {
      this.hasOwnProperty(e) && (this._$Ei.set(e, this[e]), delete this[e]);
    });
  }
  createRenderRoot() {
    var t;
    const e = (t = this.shadowRoot) !== null && t !== void 0 ? t : this.attachShadow(this.constructor.shadowRootOptions);
    return de(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var t;
    this.renderRoot === void 0 && (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$ES) === null || t === void 0 || t.forEach((e) => {
      var r;
      return (r = e.hostConnected) === null || r === void 0 ? void 0 : r.call(e);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$ES) === null || t === void 0 || t.forEach((e) => {
      var r;
      return (r = e.hostDisconnected) === null || r === void 0 ? void 0 : r.call(e);
    });
  }
  attributeChangedCallback(t, e, r) {
    this._$AK(t, r);
  }
  _$EO(t, e, r = ut) {
    var s;
    const o = this.constructor._$Ep(t, r);
    if (o !== void 0 && r.reflect === !0) {
      const n = (((s = r.converter) === null || s === void 0 ? void 0 : s.toAttribute) !== void 0 ? r.converter : _t).toAttribute(e, r.type);
      this._$El = t, n == null ? this.removeAttribute(o) : this.setAttribute(o, n), this._$El = null;
    }
  }
  _$AK(t, e) {
    var r;
    const s = this.constructor, o = s._$Ev.get(t);
    if (o !== void 0 && this._$El !== o) {
      const n = s.getPropertyOptions(o), c = typeof n.converter == "function" ? { fromAttribute: n.converter } : ((r = n.converter) === null || r === void 0 ? void 0 : r.fromAttribute) !== void 0 ? n.converter : _t;
      this._$El = o, this[o] = c.fromAttribute(e, n.type), this._$El = null;
    }
  }
  requestUpdate(t, e, r) {
    let s = !0;
    t !== void 0 && (((r = r || this.constructor.getPropertyOptions(t)).hasChanged || Yt)(this[t], e) ? (this._$AL.has(t) || this._$AL.set(t, e), r.reflect === !0 && this._$El !== t && (this._$EC === void 0 && (this._$EC = /* @__PURE__ */ new Map()), this._$EC.set(t, r))) : s = !1), !this.isUpdatePending && s && (this._$E_ = this._$Ej());
  }
  async _$Ej() {
    this.isUpdatePending = !0;
    try {
      await this._$E_;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var t;
    if (!this.isUpdatePending)
      return;
    this.hasUpdated, this._$Ei && (this._$Ei.forEach((s, o) => this[o] = s), this._$Ei = void 0);
    let e = !1;
    const r = this._$AL;
    try {
      e = this.shouldUpdate(r), e ? (this.willUpdate(r), (t = this._$ES) === null || t === void 0 || t.forEach((s) => {
        var o;
        return (o = s.hostUpdate) === null || o === void 0 ? void 0 : o.call(s);
      }), this.update(r)) : this._$Ek();
    } catch (s) {
      throw e = !1, this._$Ek(), s;
    }
    e && this._$AE(r);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var e;
    (e = this._$ES) === null || e === void 0 || e.forEach((r) => {
      var s;
      return (s = r.hostUpdated) === null || s === void 0 ? void 0 : s.call(r);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$Ek() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$E_;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$EC !== void 0 && (this._$EC.forEach((e, r) => this._$EO(r, this[r], e)), this._$EC = void 0), this._$Ek();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
U.finalized = !0, U.elementProperties = /* @__PURE__ */ new Map(), U.elementStyles = [], U.shadowRootOptions = { mode: "open" }, Nt == null || Nt({ ReactiveElement: U }), ((dt = rt.reactiveElementVersions) !== null && dt !== void 0 ? dt : rt.reactiveElementVersions = []).push("1.6.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var pt;
const st = window, M = st.trustedTypes, zt = M ? M.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, yt = "$lit$", E = `lit$${(Math.random() + "").slice(9)}$`, Zt = "?" + E, pe = `<${Zt}>`, T = document, V = () => T.createComment(""), q = (i) => i === null || typeof i != "object" && typeof i != "function", Gt = Array.isArray, ge = (i) => Gt(i) || typeof (i == null ? void 0 : i[Symbol.iterator]) == "function", gt = `[ 	
\f\r]`, L = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, It = /-->/g, Lt = />/g, C = RegExp(`>|${gt}(?:([^\\s"'>=/]+)(${gt}*=${gt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Wt = /'/g, Dt = /"/g, Jt = /^(?:script|style|textarea|title)$/i, ve = (i) => (t, ...e) => ({ _$litType$: i, strings: t, values: e }), _ = ve(1), S = Symbol.for("lit-noChange"), p = Symbol.for("lit-nothing"), Bt = /* @__PURE__ */ new WeakMap(), x = T.createTreeWalker(T, 129, null, !1), fe = (i, t) => {
  const e = i.length - 1, r = [];
  let s, o = t === 2 ? "<svg>" : "", n = L;
  for (let a = 0; a < e; a++) {
    const l = i[a];
    let g, d, u = -1, $ = 0;
    for (; $ < l.length && (n.lastIndex = $, d = n.exec(l), d !== null); )
      $ = n.lastIndex, n === L ? d[1] === "!--" ? n = It : d[1] !== void 0 ? n = Lt : d[2] !== void 0 ? (Jt.test(d[2]) && (s = RegExp("</" + d[2], "g")), n = C) : d[3] !== void 0 && (n = C) : n === C ? d[0] === ">" ? (n = s ?? L, u = -1) : d[1] === void 0 ? u = -2 : (u = n.lastIndex - d[2].length, g = d[1], n = d[3] === void 0 ? C : d[3] === '"' ? Dt : Wt) : n === Dt || n === Wt ? n = C : n === It || n === Lt ? n = L : (n = C, s = void 0);
    const G = n === C && i[a + 1].startsWith("/>") ? " " : "";
    o += n === L ? l + pe : u >= 0 ? (r.push(g), l.slice(0, u) + yt + l.slice(u) + E + G) : l + E + (u === -2 ? (r.push(void 0), a) : G);
  }
  const c = o + (i[e] || "<?>") + (t === 2 ? "</svg>" : "");
  if (!Array.isArray(i) || !i.hasOwnProperty("raw"))
    throw Error("invalid template strings array");
  return [zt !== void 0 ? zt.createHTML(c) : c, r];
};
class F {
  constructor({ strings: t, _$litType$: e }, r) {
    let s;
    this.parts = [];
    let o = 0, n = 0;
    const c = t.length - 1, a = this.parts, [l, g] = fe(t, e);
    if (this.el = F.createElement(l, r), x.currentNode = this.el.content, e === 2) {
      const d = this.el.content, u = d.firstChild;
      u.remove(), d.append(...u.childNodes);
    }
    for (; (s = x.nextNode()) !== null && a.length < c; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) {
          const d = [];
          for (const u of s.getAttributeNames())
            if (u.endsWith(yt) || u.startsWith(E)) {
              const $ = g[n++];
              if (d.push(u), $ !== void 0) {
                const G = s.getAttribute($.toLowerCase() + yt).split(E), J = /([.?@])?(.*)/.exec($);
                a.push({ type: 1, index: o, name: J[2], strings: G, ctor: J[1] === "." ? _e : J[1] === "?" ? $e : J[1] === "@" ? be : at });
              } else
                a.push({ type: 6, index: o });
            }
          for (const u of d)
            s.removeAttribute(u);
        }
        if (Jt.test(s.tagName)) {
          const d = s.textContent.split(E), u = d.length - 1;
          if (u > 0) {
            s.textContent = M ? M.emptyScript : "";
            for (let $ = 0; $ < u; $++)
              s.append(d[$], V()), x.nextNode(), a.push({ type: 2, index: ++o });
            s.append(d[u], V());
          }
        }
      } else if (s.nodeType === 8)
        if (s.data === Zt)
          a.push({ type: 2, index: o });
        else {
          let d = -1;
          for (; (d = s.data.indexOf(E, d + 1)) !== -1; )
            a.push({ type: 7, index: o }), d += E.length - 1;
        }
      o++;
    }
  }
  static createElement(t, e) {
    const r = T.createElement("template");
    return r.innerHTML = t, r;
  }
}
function N(i, t, e = i, r) {
  var s, o, n, c;
  if (t === S)
    return t;
  let a = r !== void 0 ? (s = e._$Co) === null || s === void 0 ? void 0 : s[r] : e._$Cl;
  const l = q(t) ? void 0 : t._$litDirective$;
  return (a == null ? void 0 : a.constructor) !== l && ((o = a == null ? void 0 : a._$AO) === null || o === void 0 || o.call(a, !1), l === void 0 ? a = void 0 : (a = new l(i), a._$AT(i, e, r)), r !== void 0 ? ((n = (c = e)._$Co) !== null && n !== void 0 ? n : c._$Co = [])[r] = a : e._$Cl = a), a !== void 0 && (t = N(i, a._$AS(i, t.values), a, r)), t;
}
class me {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    var e;
    const { el: { content: r }, parts: s } = this._$AD, o = ((e = t == null ? void 0 : t.creationScope) !== null && e !== void 0 ? e : T).importNode(r, !0);
    x.currentNode = o;
    let n = x.nextNode(), c = 0, a = 0, l = s[0];
    for (; l !== void 0; ) {
      if (c === l.index) {
        let g;
        l.type === 2 ? g = new Z(n, n.nextSibling, this, t) : l.type === 1 ? g = new l.ctor(n, l.name, l.strings, this, t) : l.type === 6 && (g = new we(n, this, t)), this._$AV.push(g), l = s[++a];
      }
      c !== (l == null ? void 0 : l.index) && (n = x.nextNode(), c++);
    }
    return x.currentNode = T, o;
  }
  v(t) {
    let e = 0;
    for (const r of this._$AV)
      r !== void 0 && (r.strings !== void 0 ? (r._$AI(t, r, e), e += r.strings.length - 2) : r._$AI(t[e])), e++;
  }
}
class Z {
  constructor(t, e, r, s) {
    var o;
    this.type = 2, this._$AH = p, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = r, this.options = s, this._$Cp = (o = s == null ? void 0 : s.isConnected) === null || o === void 0 || o;
  }
  get _$AU() {
    var t, e;
    return (e = (t = this._$AM) === null || t === void 0 ? void 0 : t._$AU) !== null && e !== void 0 ? e : this._$Cp;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && (t == null ? void 0 : t.nodeType) === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = N(this, t, e), q(t) ? t === p || t == null || t === "" ? (this._$AH !== p && this._$AR(), this._$AH = p) : t !== this._$AH && t !== S && this._(t) : t._$litType$ !== void 0 ? this.g(t) : t.nodeType !== void 0 ? this.$(t) : ge(t) ? this.T(t) : this._(t);
  }
  k(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  $(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.k(t));
  }
  _(t) {
    this._$AH !== p && q(this._$AH) ? this._$AA.nextSibling.data = t : this.$(T.createTextNode(t)), this._$AH = t;
  }
  g(t) {
    var e;
    const { values: r, _$litType$: s } = t, o = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = F.createElement(s.h, this.options)), s);
    if (((e = this._$AH) === null || e === void 0 ? void 0 : e._$AD) === o)
      this._$AH.v(r);
    else {
      const n = new me(o, this), c = n.u(this.options);
      n.v(r), this.$(c), this._$AH = n;
    }
  }
  _$AC(t) {
    let e = Bt.get(t.strings);
    return e === void 0 && Bt.set(t.strings, e = new F(t)), e;
  }
  T(t) {
    Gt(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let r, s = 0;
    for (const o of t)
      s === e.length ? e.push(r = new Z(this.k(V()), this.k(V()), this, this.options)) : r = e[s], r._$AI(o), s++;
    s < e.length && (this._$AR(r && r._$AB.nextSibling, s), e.length = s);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var r;
    for ((r = this._$AP) === null || r === void 0 || r.call(this, !1, !0, e); t && t !== this._$AB; ) {
      const s = t.nextSibling;
      t.remove(), t = s;
    }
  }
  setConnected(t) {
    var e;
    this._$AM === void 0 && (this._$Cp = t, (e = this._$AP) === null || e === void 0 || e.call(this, t));
  }
}
class at {
  constructor(t, e, r, s, o) {
    this.type = 1, this._$AH = p, this._$AN = void 0, this.element = t, this.name = e, this._$AM = s, this.options = o, r.length > 2 || r[0] !== "" || r[1] !== "" ? (this._$AH = Array(r.length - 1).fill(new String()), this.strings = r) : this._$AH = p;
  }
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t, e = this, r, s) {
    const o = this.strings;
    let n = !1;
    if (o === void 0)
      t = N(this, t, e, 0), n = !q(t) || t !== this._$AH && t !== S, n && (this._$AH = t);
    else {
      const c = t;
      let a, l;
      for (t = o[0], a = 0; a < o.length - 1; a++)
        l = N(this, c[r + a], e, a), l === S && (l = this._$AH[a]), n || (n = !q(l) || l !== this._$AH[a]), l === p ? t = p : t !== p && (t += (l ?? "") + o[a + 1]), this._$AH[a] = l;
    }
    n && !s && this.j(t);
  }
  j(t) {
    t === p ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class _e extends at {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === p ? void 0 : t;
  }
}
const ye = M ? M.emptyScript : "";
class $e extends at {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    t && t !== p ? this.element.setAttribute(this.name, ye) : this.element.removeAttribute(this.name);
  }
}
class be extends at {
  constructor(t, e, r, s, o) {
    super(t, e, r, s, o), this.type = 5;
  }
  _$AI(t, e = this) {
    var r;
    if ((t = (r = N(this, t, e, 0)) !== null && r !== void 0 ? r : p) === S)
      return;
    const s = this._$AH, o = t === p && s !== p || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, n = t !== p && (s === p || o);
    o && this.element.removeEventListener(this.name, this, s), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var e, r;
    typeof this._$AH == "function" ? this._$AH.call((r = (e = this.options) === null || e === void 0 ? void 0 : e.host) !== null && r !== void 0 ? r : this.element, t) : this._$AH.handleEvent(t);
  }
}
class we {
  constructor(t, e, r) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    N(this, t);
  }
}
const jt = st.litHtmlPolyfillSupport;
jt == null || jt(F, Z), ((pt = st.litHtmlVersions) !== null && pt !== void 0 ? pt : st.litHtmlVersions = []).push("2.7.4");
const Xt = (i, t, e) => {
  var r, s;
  const o = (r = e == null ? void 0 : e.renderBefore) !== null && r !== void 0 ? r : t;
  let n = o._$litPart$;
  if (n === void 0) {
    const c = (s = e == null ? void 0 : e.renderBefore) !== null && s !== void 0 ? s : null;
    o._$litPart$ = n = new Z(t.insertBefore(V(), c), c, void 0, e ?? {});
  }
  return n._$AI(i), n;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var vt, ft;
class P extends U {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var t, e;
    const r = super.createRenderRoot();
    return (t = (e = this.renderOptions).renderBefore) !== null && t !== void 0 || (e.renderBefore = r.firstChild), r;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Xt(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var t;
    super.connectedCallback(), (t = this._$Do) === null || t === void 0 || t.setConnected(!0);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._$Do) === null || t === void 0 || t.setConnected(!1);
  }
  render() {
    return S;
  }
}
P.finalized = !0, P._$litElement$ = !0, (vt = globalThis.litElementHydrateSupport) === null || vt === void 0 || vt.call(globalThis, { LitElement: P });
const Vt = globalThis.litElementPolyfillSupport;
Vt == null || Vt({ LitElement: P });
((ft = globalThis.litElementVersions) !== null && ft !== void 0 ? ft : globalThis.litElementVersions = []).push("3.3.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const lt = (i) => (t) => typeof t == "function" ? ((e, r) => (customElements.define(e, r), r))(i, t) : ((e, r) => {
  const { kind: s, elements: o } = r;
  return { kind: s, elements: o, finisher(n) {
    customElements.define(e, n);
  } };
})(i, t);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ae = (i, t) => t.kind === "method" && t.descriptor && !("value" in t.descriptor) ? { ...t, finisher(e) {
  e.createProperty(t.key, i);
} } : { kind: "field", key: Symbol(), placement: "own", descriptor: {}, originalKey: t.key, initializer() {
  typeof t.initializer == "function" && (this[t.key] = t.initializer.call(this));
}, finisher(e) {
  e.createProperty(t.key, i);
} };
function m(i) {
  return (t, e) => e !== void 0 ? ((r, s, o) => {
    s.constructor.createProperty(o, r);
  })(i, t, e) : Ae(i, t);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function St(i) {
  return m({ ...i, state: !0 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Qt = ({ finisher: i, descriptor: t }) => (e, r) => {
  var s;
  if (r === void 0) {
    const o = (s = e.originalKey) !== null && s !== void 0 ? s : e.key, n = t != null ? { kind: "method", placement: "prototype", key: o, descriptor: t(e.key) } : { ...e, key: o };
    return i != null && (n.finisher = function(c) {
      i(c, o);
    }), n;
  }
  {
    const o = e.constructor;
    t !== void 0 && Object.defineProperty(e, r, t(r)), i == null || i(o, r);
  }
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Ee(i) {
  return Qt({ finisher: (t, e) => {
    Object.assign(t.prototype[e], i);
  } });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Ct(i, t) {
  return Qt({ descriptor: (e) => {
    const r = { get() {
      var s, o;
      return (o = (s = this.renderRoot) === null || s === void 0 ? void 0 : s.querySelector(i)) !== null && o !== void 0 ? o : null;
    }, enumerable: !0, configurable: !0 };
    if (t) {
      const s = typeof e == "symbol" ? Symbol() : "__" + e;
      r.get = function() {
        var o, n;
        return this[s] === void 0 && (this[s] = (n = (o = this.renderRoot) === null || o === void 0 ? void 0 : o.querySelector(i)) !== null && n !== void 0 ? n : null), this[s];
      };
    }
    return r;
  } });
}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var mt;
((mt = window.HTMLSlotElement) === null || mt === void 0 ? void 0 : mt.prototype.assignedElements) != null;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const te = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 }, ee = (i) => (...t) => ({ _$litDirective$: i, values: t });
let ie = class {
  constructor(t) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t, e, r) {
    this._$Ct = t, this._$AM = e, this._$Ci = r;
  }
  _$AS(t, e) {
    return this.update(t, e);
  }
  update(t, e) {
    return this.render(...e);
  }
};
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ke = ee(class extends ie {
  constructor(i) {
    var t;
    if (super(i), i.type !== te.ATTRIBUTE || i.name !== "class" || ((t = i.strings) === null || t === void 0 ? void 0 : t.length) > 2)
      throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
  }
  render(i) {
    return " " + Object.keys(i).filter((t) => i[t]).join(" ") + " ";
  }
  update(i, [t]) {
    var e, r;
    if (this.it === void 0) {
      this.it = /* @__PURE__ */ new Set(), i.strings !== void 0 && (this.nt = new Set(i.strings.join(" ").split(/\s/).filter((o) => o !== "")));
      for (const o in t)
        t[o] && !(!((e = this.nt) === null || e === void 0) && e.has(o)) && this.it.add(o);
      return this.render(t);
    }
    const s = i.element.classList;
    this.it.forEach((o) => {
      o in t || (s.remove(o), this.it.delete(o));
    });
    for (const o in t) {
      const n = !!t[o];
      n === this.it.has(o) || !((r = this.nt) === null || r === void 0) && r.has(o) || (n ? (s.add(o), this.it.add(o)) : (s.remove(o), this.it.delete(o)));
    }
    return S;
  }
});
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Pe = (i, t, e) => {
  for (const r of t)
    if (r[0] === i)
      return (0, r[1])();
  return e == null ? void 0 : e();
};
function re(i, t = 100, e = !1) {
  var r, s, o, n, c;
  function a() {
    var g = Date.now() - n;
    g < t && g >= 0 ? r = setTimeout(a, t - g) : (r = null, e || (c = i.apply(o, s), o = s = null));
  }
  var l = function() {
    o = this, s = arguments, n = Date.now();
    var g = e && !r;
    return r || (r = setTimeout(a, t)), g && (c = i.apply(o, s), o = s = null), c;
  };
  return l.clear = function() {
    r && (clearTimeout(r), r = null);
  }, l.flush = function() {
    r && (c = i.apply(o, s), o = s = null, clearTimeout(r), r = null);
  }, l;
}
var Se = Object.defineProperty, Ce = Object.getOwnPropertyDescriptor, ct = (i, t, e, r) => {
  for (var s = r > 1 ? void 0 : r ? Ce(t, e) : t, o = i.length - 1, n; o >= 0; o--)
    (n = i[o]) && (s = (r ? n(t, e, s) : n(s)) || s);
  return r && s && Se(t, e, s), s;
};
let z = class extends P {
  constructor() {
    super(...arguments), this.value = 0;
  }
  updated(i) {
    if (super.updated(i), i.has("value")) {
      const t = parseFloat(getComputedStyle(this.indicator).getPropertyValue("r")), e = 2 * Math.PI * t, r = e - this.value / 100 * e;
      this.indicatorOffset = `${r}px`;
    }
  }
  render() {
    return _`
      <div
        class="progress-ring"
        role="progressbar"
        aria-label="Progress"
        aria-describedby="label"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow="${this.value}"
        style="--percentage: ${this.value / 100}"
      >
        <svg class="progress-ring__image">
          <circle class="progress-ring__track"></circle>
          <circle class="progress-ring__indicator" style="stroke-dashoffset: ${this.indicatorOffset}"></circle>
        </svg> 
      </div>
    `;
  }
};
z.styles = nt`
  :host { 
    display: inline-flex;
  }

  .progress-ring {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .progress-ring__image {
    width: var(--mr-loader-size);
    height: var(--mr-loader-size);
    rotate: -90deg;
    transform-origin: 50% 50%;
  }

  .progress-ring__track,
  .progress-ring__indicator {
    --radius: calc(var(--mr-loader-size) / 2 - max(var(--mr-loader-track-width), var(--mr-loader-track-width)) * 0.5);
    --circumference: calc(var(--radius) * 2 * 3.141592654);

    fill: none;
    r: var(--radius);
    cx: calc(var(--mr-loader-size) / 2);
    cy: calc(var(--mr-loader-size) / 2);
  }

  .progress-ring__track {
    stroke: var(--mr-bg);
    stroke-width: var(--mr-loader-track-width);
  }

  .progress-ring__indicator {
    stroke: var(--mr-loader-color);
    stroke-width: var(--mr-loader-track-width);
    stroke-linecap: round;
    transition-property: stroke-dashoffset;
    transition-duration: var(--indicator-transition-duration);
    stroke-dasharray: var(--circumference) var(--circumference);
    stroke-dashoffset: calc(var(--circumference) - var(--percentage) * var(--circumference));
  }
	`;
ct([
  Ct(".progress-ring__indicator")
], z.prototype, "indicator", 2);
ct([
  St()
], z.prototype, "indicatorOffset", 2);
ct([
  m({ type: Number, reflect: !0 })
], z.prototype, "value", 2);
z = ct([
  lt("mr-progress-ring")
], z);
var xe = Object.defineProperty, Te = Object.getOwnPropertyDescriptor, Oe = (i, t, e, r) => {
  for (var s = r > 1 ? void 0 : r ? Te(t, e) : t, o = i.length - 1, n; o >= 0; o--)
    (n = i[o]) && (s = (r ? n(t, e, s) : n(s)) || s);
  return r && s && xe(t, e, s), s;
};
let $t = class extends P {
  render() {
    return _`
      <svg class="spinner" role="progressbar" aria-valuetext="Loading"}>
        <circle class="spinner__track"></circle>
        <circle class="spinner__indicator"></circle>
      </svg>
    `;
  }
};
$t.styles = nt`
  .spinner {
    display: inline-flex;
    flex: 1 1 auto;
    height: 100%;
    width: 100%;
    font-size: var(--mr-loader-size);
    width: 1em;
    height: 1em;
  }

  .spinner__track,
  .spinner__indicator {
    fill: none;
    stroke-width: var(--mr-loader-track-width);
    r: calc(0.5em - var(--mr-loader-track-width) / 2);
    cx: 0.5em;
    cy: 0.5em;
    transform-origin: 50% 50%;
  }

  .spinner__track {
    stroke: var(--mr-loader-track-color);
    transform-origin: 0% 0%;
  }

  .spinner__indicator {
    stroke: var(--mr-loader-color);
    stroke-linecap: round;
    stroke-dasharray: 150% 75%;
    animation: spin var(--mr-loader-animation-duration) linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
      stroke-dasharray: 0.01em, 2.75em;
    }

    50% {
      transform: rotate(450deg);
      stroke-dasharray: 1.375em, 1.375em;
    }

    100% {
      transform: rotate(1080deg);
      stroke-dasharray: 0.01em, 2.75em;
    }
  }
`;
$t = Oe([
  lt("mr-spinner")
], $t);
var Ue = Object.defineProperty, Re = Object.getOwnPropertyDescriptor, O = (i, t, e, r) => {
  for (var s = r > 1 ? void 0 : r ? Re(t, e) : t, o = i.length - 1, n; o >= 0; o--)
    (n = i[o]) && (s = (r ? n(t, e, s) : n(s)) || s);
  return r && s && Ue(t, e, s), s;
}, se = (i, t, e) => {
  if (!t.has(i))
    throw TypeError("Cannot " + e);
}, He = (i, t, e) => (se(i, t, "read from private field"), e ? e.call(i) : t.get(i)), Me = (i, t, e) => {
  if (t.has(i))
    throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(i) : t.set(i, e);
}, qt = (i, t, e, r) => (se(i, t, "write to private field"), r ? r.call(i, e) : t.set(i, e), e), W;
let A = class extends P {
  constructor() {
    super(...arguments), this.state = "idle", this.src = "", this.fetchingProgress = 0, Me(this, W, void 0);
  }
  // function which is debounced and which sets the  
  setFetchProgress(i) {
    this.fetchingProgress = i;
  }
  willUpdate(i) {
    i.has("src") && i.get("src") !== void 0 && this.src && this.src !== "" && (this.state = "idle", this.fetchingProgress = 0, this.objectURL = "");
  }
  async load() {
    if (this.state !== "idle" && this.state !== "failure" && He(this, W) !== void 0)
      return;
    const i = re(this.setFetchProgress.bind(this), 300);
    try {
      const t = fetch(this.src);
      qt(this, W, t);
      const e = await t;
      if (!e.ok)
        throw Error("Unable to fetch");
      this.state = "fetching";
      const r = e.body.getReader(), s = +e.headers.get("Content-Length");
      let o = 0, n = [];
      for (; ; ) {
        const { done: a, value: l } = await r.read();
        if (a)
          break;
        n.push(l), o += l.length;
        const g = +(o * 100 / s).toFixed(0);
        i(g);
      }
      qt(this, W, void 0);
      let c = new Blob(n);
      this.objectURL = URL.createObjectURL(c), this.state = "done";
    } catch {
      this.state = "failure";
    }
  }
  render() {
    return this.state === "done" ? _`<img @load=${this.loadHandler} part='img' src=${this.objectURL}/>` : _`<div part='container' class='image-container'>${Pe(this.state, [
      ["idle", () => _`<mr-spinner></mr-spinner>`],
      ["fetching", () => _`<mr-progress-ring value="${this.fetchingProgress}"><mr-progress-ring >`],
      ["failure", () => _`<button class='retry-btn' @click=${this.retry}>Retry</button>`]
    ])} 
      </div>`;
  }
  loadHandler(i) {
    const t = i.target, e = window.devicePixelRatio, r = t.naturalWidth / e, s = t.naturalHeight / e;
    this.orientation = t.naturalWidth > t.naturalHeight ? "landscape" : "portrait", t.style.setProperty("--natural-width", r + "px"), t.style.setProperty("--natural-height", s + "px");
    const o = new CustomEvent("mr-image-load", {
      detail: this,
      composed: !0,
      bubbles: !0
    });
    this.dispatchEvent(o);
  }
  async retry() {
    return this.state = "idle", this.load();
  }
};
W = /* @__PURE__ */ new WeakMap();
A.styles = nt`


  :host{ 
    --mr-loader-size: 64px;
    --mr-loader-color: hotpink;
    --mr-loader-track-width: 8px;
    --mr-loader-track-color: var(--mr-bg);
    --mr-loader-animation-duration: 2s;
    --indicator-transition-duration: 300ms;

    --mr-retry-btn-bg: var(--mr-loader-color);
    --mr-retry-btn-color: white;
  }
  
  .image-container{
    box-sizing: border-box;
    width: calc(var(--mr-width) / 2) ;
    height: var(--mr-height); 
    margin-inline: auto;
    padding-top: calc(var(--mr-height) * 0.3);
    display: grid;
    align-content: start;
    justify-content: center;
  }

  .retry-btn{
    background-color: var(--mr-loader-color);
    color: white;
    font-size: 1.5em;
    padding: 0.5rem 1rem;
    border-radius: 2.5rem;
    border: none;
  }
  `;
O([
  m()
], A.prototype, "state", 2);
O([
  m()
], A.prototype, "src", 2);
O([
  St()
], A.prototype, "fetchingProgress", 2);
O([
  St()
], A.prototype, "objectURL", 2);
O([
  m({ reflect: !0 })
], A.prototype, "orientation", 2);
O([
  Ee({ passive: !0 })
], A.prototype, "loadHandler", 1);
A = O([
  lt("mr-image")
], A);
const Ne = `:host{overflow:hidden;--mr-width: 100vw;--mr-height: 100vh;--mr-indicator-prev-color: orangered;--mr-indicator-next-color: green;--mr-bg: black;--mr-webtoon-padding: 0%;--mr-scrollbar-size: 8px;--mr-scrollbar-bg-color: gray;--mr-scrollbar-track-color: darkgray;--mr-scrollbar-track-hover: #484747}*{box-sizing:border-box;overflow:auto}.container{display:grid;height:var(--mr-height);width:var(--mr-width);background:var(--mr-bg);overflow:auto}.container:not(.webtoon){scroll-snap-type:x mandatory;grid-auto-flow:column;grid-auto-columns:100%;grid-auto-rows:100%}.container.vertical{scroll-snap-type:y mandatory;grid-auto-flow:row}.page{contain:layout}.container:not(.webtoon) .page{scroll-snap-align:center;width:100%;height:100%;display:flex}.container:not(.webtoon) mr-image{width:100%;height:100%}.container:not(.webtoon) mr-image::part(img){display:block;width:auto;height:100%;margin:auto}.container.double-page mr-image{width:auto}.double-page mr-image:first-child{margin-inline:auto 0}.double-page mr-image:last-child{margin-inline:0 auto}.double-page mr-image:only-child{margin-inline:auto}.container:not(.webtoon)[data-scale-type=fit-width] mr-image{display:flex;align-items:center}.container:not(.webtoon)[data-scale-type=fit-width] mr-image::part(img){width:100%;height:auto}.container:not(.webtoon)[data-scale-type=stretch] mr-image::part(img){width:100%}.container:not(.webtoon)[data-scale-type=original-size] mr-image{display:flex}.container:not(.webtoon)[data-scale-type=original-size] mr-image::part(img){width:var(--natrual-width);height:var(--natrual-height)}.container:not(.webtoon)[data-scale-type=smart-fit] mr-image[orientation=landscape]::part(img){width:100%;height:auto}.container:not(.webtoon)[data-scale-type=smart-fit] mr-image{display:flex;align-items:center}.container:not(.webtoon)[data-scale-type=fit-screen] mr-image.fit-width::part(img){width:100%;height:auto}.container:not(.webtoon)[data-scale-type=fit-screen] mr-image.fit-width{display:flex;align-items:center}.container.webtoon{display:block;overflow-y:scroll}.webtoon mr-image::part(img){display:block;padding-inline:var(--mr-webtoon-padding);width:calc(100% - calc(2 * var(--mr-webtoon-padding)))}#touch-indicator{color:#fff;position:absolute;inset:0;display:none;opacity:.75;grid-template:1fr 1fr 1fr / 1fr 1fr 1fr;height:var(--mr-height);width:var(--mr-width)}#touch-indicator-prev,#touch-indicator-next{display:grid;place-content:center;font-size:3rem;margin:0;grid-column:span 3}#touch-indicator-prev{background:var(--mr-indicator-prev-color)}#touch-indicator-next{grid-row:3;background:var(--mr-indicator-next-color)}#touch-indicator:before{content:"";background:var(--mr-indicator-prev-color);grid-row:2}#touch-indicator:after{content:"";background:var(--mr-indicator-next-color);grid-column:3}@supports selector(::-webkit-scrollbar){.container.vertical .page{width:calc(var(--mr-width) - var(--mr-scrollbar-size))}}*::-webkit-scrollbar{display:block;width:var(--mr-scrollbar-size);height:var(--mr-scrollbar-size)}*::-webkit-scrollbar-button{display:none}*::-webkit-scrollbar-track,*::-webkit-scrollbar-track-piece{background-color:var(--mr-scrollbar-bg-color)}*::-webkit-scrollbar-thumb{background-color:var(--mr-scrollbar-track-color);border:5px solid transparent;border-radius:calc(1.5 * var(--mr-scrollbar-size));box-shadow:4px 0 0 4px #00000040 inset}*::-webkit-scrollbar-thumb:hover{background-color:var(--mr-scrollbar-track-hover);border:0px solid transparent;box-shadow:none}
`;
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const oe = "important", ze = " !" + oe, Ie = ee(class extends ie {
  constructor(i) {
    var t;
    if (super(i), i.type !== te.ATTRIBUTE || i.name !== "style" || ((t = i.strings) === null || t === void 0 ? void 0 : t.length) > 2)
      throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
  }
  render(i) {
    return Object.keys(i).reduce((t, e) => {
      const r = i[e];
      return r == null ? t : t + `${e = e.includes("-") ? e : e.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase()}:${r};`;
    }, "");
  }
  update(i, [t]) {
    const { style: e } = i.element;
    if (this.ut === void 0) {
      this.ut = /* @__PURE__ */ new Set();
      for (const r in t)
        this.ut.add(r);
      return this.render(t);
    }
    this.ut.forEach((r) => {
      t[r] == null && (this.ut.delete(r), r.includes("-") ? e.removeProperty(r) : e[r] = "");
    });
    for (const r in t) {
      const s = t[r];
      if (s != null) {
        this.ut.add(r);
        const o = typeof s == "string" && s.endsWith(ze);
        r.includes("-") || o ? e.setProperty(r, o ? s.slice(0, -11) : s, o ? oe : "") : e[r] = s;
      }
    }
    return S;
  }
});
var Le = Object.defineProperty, We = Object.getOwnPropertyDescriptor, y = (i, t, e, r) => {
  for (var s = r > 1 ? void 0 : r ? We(t, e) : t, o = i.length - 1, n; o >= 0; o--)
    (n = i[o]) && (s = (r ? n(t, e, s) : n(s)) || s);
  return r && s && Le(t, e, s), s;
}, xt = (i, t, e) => {
  if (!t.has(i))
    throw TypeError("Cannot " + e);
}, b = (i, t, e) => (xt(i, t, "read from private field"), e ? e.call(i) : t.get(i)), v = (i, t, e) => {
  if (t.has(i))
    throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(i) : t.set(i, e);
}, De = (i, t, e, r) => (xt(i, t, "write to private field"), r ? r.call(i, e) : t.set(i, e), e), h = (i, t, e) => (xt(i, t, "access private method"), e), K, H, bt, ne, wt, ae, ht, Tt, D, Q, At, le, tt, Et, ce, I, Y, ot, Ot, R, B, j, et, w, k, Ut, he, it;
const Be = ["pages", "mode", "scaleType"];
let f = class extends P {
  constructor() {
    super(...arguments), v(this, bt), v(this, wt), v(this, ht), v(this, D), v(this, At), v(this, Et), v(this, I), v(this, ot), v(this, R), v(this, j), v(this, w), v(this, Ut), this.pages = [], this.mode = "horizontal", this.dir = "ltr", this.currentPage = 1, this.scaleType = "fit-height", this.showTouchIndicator = !1, this.webtoonPadding = 0, this.preloadNo = 1, v(this, K, []), this.webtoonScrollAmount = 0.75, v(this, H, /* @__PURE__ */ new Map()), v(this, tt, (i) => {
      const t = i.key;
      if (this.mode === "webtoon") {
        const e = this.container.offsetHeight * this.webtoonScrollAmount;
        t === "ArrowUp" ? this.container.scrollBy({
          top: -1 * e,
          behavior: "smooth"
        }) : t === "ArrowDown" && this.container.scrollBy({
          top: e,
          behavior: "smooth"
        });
      } else {
        let e;
        t === "ArrowLeft" ? e = -1 : t === "ArrowRight" && (e = 1), e !== void 0 && (e *= this.dir === "rtl" ? -1 : 1, this.gotoPage(this.currentPage + e));
      }
    }), v(this, it, () => {
      this.touchIndicator.animate([{ opacity: 0 }], { duration: 500 }).onfinish = () => {
        this.showTouchIndicator = !1;
      };
    });
  }
  connectedCallback() {
    super.connectedCallback(), this.tabIndex = 0, this.addEventListener("keydown", b(this, tt));
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.removeEventListener("keydown", b(this, tt));
  }
  shouldUpdate(i) {
    var e;
    const t = Be.some((r) => i.has(r));
    return i.get("preloadNo") !== void 0 && this.preloadNo > i.get("preloadNo") && h(this, R, B).call(this), i.get("showTouchIndicator") !== void 0 && (this.showTouchIndicator ? (this.touchIndicator.style.display = "grid", this.touchIndicator.addEventListener("click", b(this, it))) : (this.touchIndicator.style.display = "none", this.touchIndicator.removeEventListener("click", b(this, it)))), i.get("dir") !== void 0 && (this.container.dir = this.dir), i.get("webtoonPadding") !== void 0 && (this.webtoonPadding > 45 || (e = this.container) == null || e.style.setProperty("--mr-webtoon-padding", this.webtoonPadding + "%")), t;
  }
  willUpdate(i) {
    if (i.has("mode") && h(this, w, k).call(this)) {
      const t = [], e = this.mode.endsWith("odd");
      e && t.push([{ url: this.pages[0], index: 0 }]);
      for (let r = e ? 1 : 0; r < this.pages.length; r += 2) {
        const s = [{ url: this.pages[r], index: r }];
        this.pages.length > r + 1 && s.push({ url: this.pages[r + 1], index: r + 1 }), t.push(s);
      }
      De(this, K, t);
    }
    i.has("pages") && b(this, H).clear();
  }
  attributeChangedCallback(i, t, e) {
    if (i === "current-page") {
      this.gotoPage(+e) && (this.currentPage = +e);
      return;
    }
    super.attributeChangedCallback(i, t, e);
  }
  firstUpdated() {
    this.container.addEventListener("mr-image-load", (i) => {
      let t = i;
      this.scaleType === "fit-screen" && this.resizeImage(t.detail);
    });
  }
  updated(i) {
    var t, e, r;
    if (i.has("mode")) {
      const s = i.get("mode");
      this.mode === "webtoon" ? ((t = this.observer) == null || t.disconnect(), this.setUpWebtoonIntersectionObserver()) : ((e = this.observer) == null || e.disconnect(), this.setUpHorizontalIntersectionObserver());
      let o = this.currentPage;
      const n = h(this, w, k).call(this);
      s && s.startsWith("double-page") && !n ? o = this.mode.endsWith("odd") ? this.currentPage * 2 - 2 : this.currentPage * 2 - 1 : s && !s.startsWith("double-page") && n && (o = this.mode.endsWith("odd") ? Math.floor(o / 2) + 1 : o = Math.ceil(o / 2)), this.gotoPage(o);
    }
    i.has("scaleType") && (this.scaleType === "fit-screen" && this.setUpResizeObserver(), i.get("scaleType") === "fit-screen" && ((r = this.resizeObserver) == null || r.disconnect()));
  }
  render() {
    const i = {
      vertical: this.mode === "vertical",
      webtoon: this.mode === "webtoon",
      "double-page": h(this, w, k).call(this)
    };
    return _`
      <div style='position: relative'>
        <div
          part='container'
          @click=${h(this, At, le)}
          style=${Ie({ "--mr-webtoon-padding": this.webtoonPadding + "%" })}
          class='container ${ke(i)}'
          dir=${this.dir}
          data-scale-type=${this.scaleType}
          >
          ${h(this, w, k).call(this) ? h(this, wt, ae).call(this) : h(this, bt, ne).call(this)}
        </div>
        <div id="touch-indicator">
          <p id="touch-indicator-prev">Previous</p>
          <p id="touch-indicator-next">Next</p>
        </div>
      </div>
      `;
  }
  /**
   * Go to a Page with a particular page number
   * and this also checks if the page should exist or not
   * This will return Boolean to indicate whether the page changed was successfull
   */
  gotoPage(i) {
    const t = h(this, I, Y).call(this, i);
    return t ? (t == null || t.scrollIntoView(), this.currentPage = i, h(this, D, Q).call(this, i), h(this, R, B).call(this), !0) : !1;
  }
  setUpHorizontalIntersectionObserver() {
    this.observer = new IntersectionObserver((i) => {
      var t;
      for (const e of i)
        if (e.isIntersecting && e.target instanceof HTMLElement) {
          const r = +((t = e.target.dataset) == null ? void 0 : t.pageNo);
          this.currentPage !== r && (this.currentPage = r, h(this, D, Q).call(this, r), h(this, Et, ce).call(this), h(this, R, B).call(this));
        }
    }, {
      root: this.container,
      threshold: 0.75
    }), this.container.querySelectorAll("div[data-page-no]").forEach((i) => this.observer.observe(i));
  }
  setUpWebtoonIntersectionObserver() {
    this.observer = new IntersectionObserver((i) => {
      var t;
      for (const e of i)
        if (e.isIntersecting && e.target instanceof HTMLElement) {
          const r = +((t = e.target.dataset) == null ? void 0 : t.vPageNo);
          this.currentPage !== r && (this.currentPage = r, h(this, D, Q).call(this, r), h(this, R, B).call(this));
        }
    }, {
      root: this.container
    }), this.container.querySelectorAll("[data-v-page-no]").forEach((i) => this.observer.observe(i));
  }
  setUpResizeObserver() {
    const i = re(() => {
      const e = this.container.querySelectorAll("mr-image");
      for (const r of e)
        this.resizeImage(r);
    }, 200), t = () => {
      const e = h(this, ot, Ot).call(this, this.currentPage);
      this.resizeImage(e), i();
    };
    this.resizeObserver = new ResizeObserver(t), t(), this.resizeObserver.observe(this.container);
  }
  resizeImage(i) {
    i.scrollHeight > i.clientHeight ? i.classList.remove("fit-width") : i.scrollWidth > i.clientWidth && i.classList.add("fit-width");
  }
};
K = /* @__PURE__ */ new WeakMap();
H = /* @__PURE__ */ new WeakMap();
bt = /* @__PURE__ */ new WeakSet();
ne = function() {
  return this.pages.map((i, t) => _`
      <div class='page' data-page-no=${t + 1}>
      ${h(this, ht, Tt).call(this, i, t)}
        ${this.mode === "webtoon" ? _`<div data-v-page-no=${t + 1}></div>` : p}
      </div>`);
};
wt = /* @__PURE__ */ new WeakSet();
ae = function() {
  return b(this, K).map((i, t) => _`
      <div class='page' data-page-no=${t + 1}>
      ${i.map(({ url: e, index: r }) => h(this, ht, Tt).call(this, e, r))} 
      </div>`);
};
ht = /* @__PURE__ */ new WeakSet();
Tt = function(i, t) {
  if (b(this, H).has(i)) {
    const s = b(this, H).get(i);
    return +s.id.replace("page-", "") !== t && (s.id = `page-${t}`), s;
  }
  const e = document.createElement("div");
  Xt(_`<mr-image id="page-${t + 1}"  src=${i}></mr-image>`, e);
  const r = e.firstElementChild;
  return b(this, H).set(i, r), r;
};
D = /* @__PURE__ */ new WeakSet();
Q = function(i) {
  const t = new CustomEvent("pagechange", {
    detail: { pageNo: i },
    composed: !0
  });
  this.dispatchEvent(t);
};
At = /* @__PURE__ */ new WeakSet();
le = function(i) {
  const t = h(this, Ut, he).call(this, i);
  if (console.log(t), this.mode === "webtoon")
    if (t === 0)
      typeof this.handleMiddleClick == "function" && this.handleMiddleClick();
    else {
      const e = t === 1 ? 1 : -1, r = this.container.offsetHeight * this.webtoonScrollAmount * e;
      this.container.scrollBy({
        top: r,
        behavior: "smooth"
      });
    }
  else if (t === 0)
    typeof this.handleMiddleClick == "function" && this.handleMiddleClick();
  else {
    let e = t;
    this.gotoPage(this.currentPage + e);
  }
};
tt = /* @__PURE__ */ new WeakMap();
Et = /* @__PURE__ */ new WeakSet();
ce = function() {
  const i = this.currentPage;
  if (i > 2) {
    const e = h(this, I, Y).call(this, i - 2);
    e.scrollTop = 0, e.scrollLeft = 0;
  }
  const t = h(this, w, k).call(this) ? b(this, K) : this.pages;
  if (i < t.length - 1) {
    const e = h(this, I, Y).call(this, i + 2);
    e.scrollTop = 0, e.scrollLeft = 0;
  }
};
I = /* @__PURE__ */ new WeakSet();
Y = function(i) {
  return this.container.querySelector(`[data-page-no="${i}"]`);
};
ot = /* @__PURE__ */ new WeakSet();
Ot = function(i) {
  return this.container.querySelector("#page-" + i);
};
R = /* @__PURE__ */ new WeakSet();
B = function() {
  var t;
  const i = (t = h(this, I, Y).call(this, this.currentPage)) == null ? void 0 : t.firstElementChild;
  i && (i.state === "done" ? h(this, j, et).call(this) : i.state === "idle" ? (i.load(), i.addEventListener("mr-image-load", () => h(this, j, et).call(this))) : i.addEventListener("mr-image-load", () => h(this, j, et).call(this)));
};
j = /* @__PURE__ */ new WeakSet();
et = function() {
  let i = h(this, w, k).call(this) ? this.mode.endsWith("odd") ? this.currentPage * 2 - 2 : this.currentPage * 2 - 1 : this.currentPage, t = 1;
  const e = this.preloadNo * (h(this, w, k).call(this) ? 2 : 1);
  for (; t <= e; ) {
    let r = i + t;
    const s = h(this, ot, Ot).call(this, r);
    if (!s)
      break;
    s.state === "idle" && s.load(), t++;
  }
};
w = /* @__PURE__ */ new WeakSet();
k = function() {
  return this.mode.startsWith("double-page");
};
Ut = /* @__PURE__ */ new WeakSet();
he = function(i) {
  const { clientX: t, clientY: e } = i, r = this.container.getBoundingClientRect(), s = t - r.left, o = e - r.top, n = r.height, c = r.width;
  let a;
  return o < n / 3 ? a = -1 : o > n * (2 / 3) ? a = 1 : s < c / 3 ? a = -1 : s > c * (2 / 3) ? a = 1 : a = 0, this.dir === "rtl" && (a === 1 ? a = -1 : a === -1 && (a = 1)), a;
};
it = /* @__PURE__ */ new WeakMap();
f.styles = nt`${Kt(Ne)}`;
y([
  m()
], f.prototype, "pages", 2);
y([
  m()
], f.prototype, "mode", 2);
y([
  m()
], f.prototype, "dir", 2);
y([
  m({ attribute: "current-page", type: Number })
], f.prototype, "currentPage", 2);
y([
  m()
], f.prototype, "scaleType", 2);
y([
  m()
], f.prototype, "showTouchIndicator", 2);
y([
  m()
], f.prototype, "webtoonPadding", 2);
y([
  m()
], f.prototype, "preloadNo", 2);
y([
  Ct(".container", !0)
], f.prototype, "container", 2);
y([
  Ct("#touch-indicator", !0)
], f.prototype, "touchIndicator", 2);
y([
  m()
], f.prototype, "webtoonScrollAmount", 2);
f = y([
  lt("manga-reader")
], f);
export {
  f as MangaReader
};
