'use strict';

// ── DOM ──────────────────────────────────────────────────────────────────────

function makeEl() {
  const style = {};
  const cl = {
    _s: new Set(),
    add(...cs) { cs.forEach(c => this._s.add(c)); },
    remove(...cs) { cs.forEach(c => this._s.delete(c)); },
    contains(c) { return this._s.has(c); },
    toggle(c) { this._s.has(c) ? this._s.delete(c) : this._s.add(c); },
  };
  let _text = '', _html = '', _children = [];
  const el = {
    style,
    classList: cl,
    get textContent() { return _text; },
    set textContent(v) { _text = String(v ?? ''); },
    get innerHTML() { return _html; },
    set innerHTML(v) { _html = String(v ?? ''); _children = []; },
    get childElementCount() { return _children.length; },
    get children() { return _children; },
    get scrollTop() { return 0; },
    set scrollTop(_) {},
    get scrollHeight() { return 0; },
    get value() { return ''; },
    set value(_) {},
    dataset: {},
    appendChild(c) { _children.push(c); return c; },
    addEventListener() {},
    setAttribute() {},
    getContext() { return { getExtension() { return null; } }; },
    getBoundingClientRect() { return { left: 0, top: 0, width: 1280, height: 720 }; },
    querySelectorAll() { return { forEach() {} }; },
    focus() {},
    blur() {},
  };
  return el;
}

const elMap = new Map();
function getOrMake(id) {
  if (!elMap.has(id)) elMap.set(id, makeEl());
  return elMap.get(id);
}

global.document = {
  getElementById(id) { return getOrMake(id); },
  querySelector(sel) { return makeEl(); },
  createElement(_tag) { return makeEl(); },
};

// ── Window / globals ─────────────────────────────────────────────────────────

global.window = {
  structuredClone: typeof structuredClone !== 'undefined' ? structuredClone : null,
  devicePixelRatio: 1,
  innerWidth: 1280,
  innerHeight: 720,
  addEventListener() {},
};

global.innerWidth = 1280;
global.innerHeight = 720;
global.devicePixelRatio = 1;
global.addEventListener = () => {};

// requestAnimationFrame must NOT invoke the callback — stops the render loop
global.requestAnimationFrame = () => {};

// ── THREE ─────────────────────────────────────────────────────────────────────

class Color {
  constructor(hex) { this._h = hex || 0; }
  setHex(h) { this._h = h; return this; }
}

function vec3(x = 0, y = 0, z = 0) {
  return {
    x, y, z,
    set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; },
    setScalar(s) { this.x = s; this.y = s; this.z = s; return this; },
    copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; },
    clone() { return vec3(this.x, this.y, this.z); },
    subVectors(a, b) { this.x = a.x - b.x; this.y = a.y - b.y; this.z = a.z - b.z; return this; },
    length() { return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2); },
    normalize() { const l = this.length() || 1; this.x /= l; this.y /= l; this.z /= l; return this; },
    addScaledVector(v, s) { this.x += v.x * s; this.y += v.y * s; this.z += v.z * s; return this; },
  };
}

function rot3() { return { x: 0, y: 0, z: 0 }; }
function scale3() {
  return {
    x: 1, y: 1, z: 1,
    set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; },
    setScalar(s) { this.x = s; this.y = s; this.z = s; return this; },
  };
}

function makeShadow() {
  return {
    mapSize: { width: 512, height: 512, set(w, h) { this.width = w; this.height = h; } },
    camera: { left: 0, right: 0, top: 0, bottom: 0, near: 0.1, far: 2000 },
    bias: 0,
  };
}

class Scene {
  constructor() { this.fog = null; this.children = []; }
  add() {}
  remove() {}
  traverse(fn) { fn(this); }
}

class Group {
  constructor() { this.position = vec3(); this.rotation = rot3(); this.scale = scale3(); this.children = []; this.userData = {}; }
  add(c) { this.children.push(c); }
  remove(c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); }
  traverse(fn) { fn(this); this.children.forEach(ch => ch.traverse && ch.traverse(fn)); }
}

class Mesh {
  constructor(geo, mat) {
    this.geometry = geo || {}; this.material = mat || {};
    this.position = vec3(); this.rotation = rot3(); this.scale = scale3();
    this.castShadow = false; this.receiveShadow = false; this.visible = true; this.userData = {};
    this.children = [];
  }
  add(c) { this.children.push(c); }
  traverse(fn) { fn(this); this.children.forEach(ch => ch.traverse && ch.traverse(fn)); }
}

class WebGLRenderer {
  constructor(opts = {}) {
    this.domElement = opts.canvas || makeEl();
    this.shadowMap = { enabled: false, type: 0 };
    this.outputEncoding = 0;
  }
  setPixelRatio() {}
  setSize() {}
  render() {}
}

class OrthographicCamera {
  constructor(l, r, t, b, n, f) {
    this.left = l; this.right = r; this.top = t; this.bottom = b; this.near = n; this.far = f;
    this.position = vec3();
  }
  lookAt() {}
  updateProjectionMatrix() {}
}

class HemisphereLight {
  constructor(sky, ground, i) { this.color = new Color(sky); this.groundColor = new Color(ground); this.intensity = i || 0; this.position = vec3(); }
}

class DirectionalLight {
  constructor(color, i) { this.color = new Color(color); this.intensity = i || 0; this.position = vec3(); this.castShadow = false; this.shadow = makeShadow(); }
}

class PointLight {
  constructor(color, i) { this.color = new Color(color); this.intensity = i || 0; this.position = vec3(); }
}

class AmbientLight {
  constructor(color, i) { this.color = new Color(color); this.intensity = i || 0; }
}

class Fog {
  constructor(color, near, far) { this.color = new Color(color); this.near = near; this.far = far; }
}

class Raycaster {
  setFromCamera() {}
  intersectObjects() { return []; }
}

class Clock {
  constructor() { this._start = Date.now(); this._last = this._start; this.elapsedTime = 0; }
  getDelta() {
    const now = Date.now(), dt = (now - this._last) / 1000;
    this._last = now; this.elapsedTime = (now - this._start) / 1000; return dt;
  }
}

class Vector2 {
  constructor(x = 0, y = 0) { this.x = x; this.y = y; }
  set(x, y) { this.x = x; this.y = y; return this; }
}

class Vector3 {
  constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
  set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
  setScalar(s) { this.x = s; this.y = s; this.z = s; return this; }
  copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
  clone() { return new Vector3(this.x, this.y, this.z); }
  subVectors(a, b) { this.x = a.x - b.x; this.y = a.y - b.y; this.z = a.z - b.z; return this; }
  length() { return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2); }
  normalize() { const l = this.length() || 1; this.x /= l; this.y /= l; this.z /= l; return this; }
  addScaledVector(v, s) { this.x += v.x * s; this.y += v.y * s; this.z += v.z * s; return this; }
}

// Geometry stubs — just constructible with dispose()
for (const name of ['BoxGeometry','PlaneGeometry','CylinderGeometry','SphereGeometry','ConeGeometry',
  'RingGeometry','OctahedronGeometry','IcosahedronGeometry','TetrahedronGeometry','DodecahedronGeometry']) {
  global[name] = class { constructor() {} dispose() {} };
}

// Material stubs
class MeshStandardMaterial {
  constructor(opts = {}) {
    this.color = new Color(opts.color); this.emissive = new Color(opts.emissive);
    this.emissiveIntensity = opts.emissiveIntensity ?? 0; this.roughness = opts.roughness ?? 1;
    this.transparent = opts.transparent ?? false; this.opacity = opts.opacity ?? 1;
    this.side = opts.side ?? 0; this.flatShading = opts.flatShading ?? false;
  }
  dispose() {}
}
class MeshBasicMaterial {
  constructor(opts = {}) {
    this.color = new Color(opts.color); this.transparent = opts.transparent ?? false;
    this.opacity = opts.opacity ?? 1; this.side = opts.side ?? 0;
  }
  dispose() {}
}

global.THREE = {
  // Classes
  Scene, Group, Mesh, WebGLRenderer,
  OrthographicCamera,
  HemisphereLight, DirectionalLight, AmbientLight, PointLight,
  Fog, Raycaster, Clock,
  Vector2, Vector3, Color,
  MeshStandardMaterial, MeshBasicMaterial,
  // Geometries
  BoxGeometry, PlaneGeometry: global.PlaneGeometry, CylinderGeometry: global.CylinderGeometry,
  SphereGeometry: global.SphereGeometry, ConeGeometry: global.ConeGeometry,
  RingGeometry: global.RingGeometry, OctahedronGeometry: global.OctahedronGeometry,
  IcosahedronGeometry: global.IcosahedronGeometry, TetrahedronGeometry: global.TetrahedronGeometry,
  DodecahedronGeometry: global.DodecahedronGeometry,
  // Constants
  DoubleSide: 2,
  PCFSoftShadowMap: 2,
  sRGBEncoding: 3001,
};
