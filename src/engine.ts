/**
 * Argent's own liquid-metal shader — a clean-room WebGL2 implementation of the
 * classic recipe: hard light→dark reflection banding, curvature-warped UVs,
 * time-driven simplex-noise flow, per-channel chromatic dispersion, and a rim
 * lift. No third-party shader code beyond the public-domain-style simplex
 * noise (Ashima Arts / Stefan Gustavson, MIT).
 *
 * Used when a surface sets `engine="native"`; removes the need for
 * @paper-design/shaders-react entirely.
 */

export interface NativeMetalParams {
  /** Highlight band colour (hex). */
  light: string;
  /** Shadow band colour (hex). */
  dark: string;
  /** Stripe density. */
  repetition: number;
  /** Band direction in degrees. */
  angle: number;
  /** Band edge softness 0–1. */
  softness: number;
  /** Per-channel band offset (chromatic dispersion). */
  dispersion: number;
  /** Noise warp amount. */
  distortion: number;
  /** Animation speed (0 = still). */
  speed: number;
  /** Pattern scale — higher spreads the bands out. */
  scale: number;
}

export type MetalEngine = "paper" | "native";

const VERT = `#version 300 es
void main() {
  vec2 pos = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec3 u_light;
uniform vec3 u_dark;
uniform float u_rep;
uniform float u_angle;
uniform float u_soft;
uniform float u_disp;
uniform float u_dist;
uniform float u_scale;
out vec4 outColor;

// 2D simplex noise — Ashima Arts / Stefan Gustavson (webgl-noise, MIT).
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// One reflection band: a soft triangle wave over the warped coordinate.
float stripe(float coord) {
  float f = fract(coord);
  float tri = abs(f * 2.0 - 1.0);
  return smoothstep(0.5 - u_soft, 0.5 + u_soft, tri);
}

void main() {
  vec2 uv = (gl_FragCoord.xy / u_res - 0.5);
  uv.x *= u_res.x / u_res.y;
  uv /= max(u_scale, 0.001);

  float t = u_time;

  // curvature: bands bend as if wrapping a bulged surface
  float d = length(uv);
  float bulge = 1.0 - 0.45 * d * d;

  // flowing warp — two noise octaves drifting at different rates
  float n = snoise(uv * 0.9 + vec2(0.0, -t * 0.28));
  n += 0.35 * snoise(uv * 1.8 + vec2(t * 0.1, -t * 0.45));

  // rotate so bands run along u_angle
  float c = cos(u_angle), s = sin(u_angle);
  vec2 ruv = mat2(c, -s, s, c) * uv;

  float coord = ruv.y * bulge * u_rep + n * u_dist * 2.2 - t * 0.22;

  // per-channel dispersion — the chrome fringing
  float r = stripe(coord + u_disp);
  float g = stripe(coord);
  float b = stripe(coord - u_disp);

  vec3 col = vec3(
    mix(u_dark.r, u_light.r, r),
    mix(u_dark.g, u_light.g, g),
    mix(u_dark.b, u_light.b, b)
  );

  // rim lift toward the edges
  col *= 0.94 + 0.14 * smoothstep(0.25, 0.85, d);

  outColor = vec4(col, 1.0);
}`;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((ch) => ch + ch).join("") : h;
  const n = parseInt(v, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export const NATIVE_TONES: Record<string, Omit<NativeMetalParams, "speed" | "scale">> = {
  silver: { light: "#f8fafc", dark: "#23262b", repetition: 1.8, angle: 68, softness: 0.34, dispersion: 0.03, distortion: 0.38 },
  gold: { light: "#ffe9a8", dark: "#6e5408", repetition: 1.8, angle: 68, softness: 0.34, dispersion: 0.028, distortion: 0.36 },
  gunmetal: { light: "#b6bec9", dark: "#14161a", repetition: 1.6, angle: 80, softness: 0.36, dispersion: 0.025, distortion: 0.34 },
  obsidian: { light: "#787c88", dark: "#000000", repetition: 1.4, angle: 92, softness: 0.42, dispersion: 0.02, distortion: 0.28 },
  cobalt: { light: "#dbe7ff", dark: "#16244e", repetition: 1.8, angle: 70, softness: 0.34, dispersion: 0.03, distortion: 0.36 },
  crimson: { light: "#ffd6da", dark: "#48101a", repetition: 1.8, angle: 68, softness: 0.34, dispersion: 0.03, distortion: 0.36 },
  amethyst: { light: "#e8d6ff", dark: "#2c1854", repetition: 1.8, angle: 70, softness: 0.34, dispersion: 0.03, distortion: 0.36 },
  emerald: { light: "#caffe0", dark: "#0e3a28", repetition: 1.7, angle: 74, softness: 0.34, dispersion: 0.028, distortion: 0.34 },
};

export interface MetalMount {
  update(params: Partial<NativeMetalParams>): void;
  destroy(): void;
}

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("argent shader:", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

/** Mount the native liquid-metal shader on a canvas. Returns null without WebGL2. */
export function mountMetal(canvas: HTMLCanvasElement, params: NativeMetalParams): MetalMount | null {
  const gl = canvas.getContext("webgl2", { antialias: true });
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("argent shader link:", gl.getProgramInfoLog(prog));
    return null;
  }
  gl.useProgram(prog);

  const U = (name: string) => gl.getUniformLocation(prog, name);
  const uRes = U("u_res"), uTime = U("u_time"), uLight = U("u_light"), uDark = U("u_dark");
  const uRep = U("u_rep"), uAngle = U("u_angle"), uSoft = U("u_soft");
  const uDisp = U("u_disp"), uDist = U("u_dist"), uScale = U("u_scale");

  let p = { ...params };
  let raf = 0;
  let tAcc = Math.random() * 40; // desync multiple surfaces
  let last = performance.now();
  let dead = false;

  function draw() {
    raf = 0;
    if (dead) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl!.viewport(0, 0, w, h);
    }
    const now = performance.now();
    tAcc += ((now - last) / 1000) * p.speed;
    last = now;

    gl!.uniform2f(uRes, w, h);
    gl!.uniform1f(uTime, tAcc);
    gl!.uniform3fv(uLight, hexToRgb(p.light));
    gl!.uniform3fv(uDark, hexToRgb(p.dark));
    gl!.uniform1f(uRep, p.repetition);
    gl!.uniform1f(uAngle, (p.angle * Math.PI) / 180);
    gl!.uniform1f(uSoft, Math.max(0.02, p.softness));
    gl!.uniform1f(uDisp, p.dispersion);
    gl!.uniform1f(uDist, p.distortion);
    gl!.uniform1f(uScale, p.scale);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);

    if (p.speed > 0) raf = requestAnimationFrame(draw);
  }
  draw();

  return {
    update(np) {
      p = { ...p, ...np };
      last = performance.now();
      if (!raf) raf = requestAnimationFrame(draw);
    },
    destroy() {
      dead = true;
      if (raf) cancelAnimationFrame(raf);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
