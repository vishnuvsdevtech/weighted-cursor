/* Weighted cursor.
 *
 * Not a CSS transition and not a trailing line: a real mass on a spring-damper.
 *   v += (target - pos) * k ;  v *= damping ;  pos += v
 * k is the "weight" the user feels. Low k = heavy pointer that overshoots and
 * settles; high k = tight and responsive. Squash stretches the body along its
 * own velocity vector, which is what the eye reads as momentum.
 */
(() => {
  const dot = document.getElementById('dot');
  const ring = document.getElementById('ring');
  const tilt = document.getElementById('tilt');
  const wIn = document.getElementById('w');
  const wVal = document.getElementById('wv');
  const lagOut = document.getElementById('lag');

  // No early return on pointer type: a device that reports `hover:none` still
  // gets the physics, and CSS hides the dot. Bailing here meant a headless or
  // hover-less environment got a dead page rather than a working one.

  let mx = innerWidth / 2, my = innerHeight / 2;      // true pointer
  let px = mx, py = my, vx = 0, vy = 0;               // body
  let qx = mx, qy = my, qvx = 0, qvy = 0;             // ring, heavier
  let k = parseFloat(wIn.value) / 100;
  let hovering = false;

  const magnets = [...document.querySelectorAll('[data-mag]')];

  addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

  document.addEventListener('pointerover', (e) => {
    hovering = !!(e.target.closest && e.target.closest('a,button,[data-mag],input'));
    document.body.classList.toggle('over', hovering);
  });

  addEventListener('pointerdown', () => { dot.classList.add('pop'); });
  addEventListener('pointerup', () => { dot.classList.remove('pop'); });

  wIn.addEventListener('input', () => {
    k = parseFloat(wIn.value) / 100;
    wVal.textContent = wIn.value;
  });

  // card tilt, read from the pointer rather than tracking per-element
  const stage = document.getElementById('stage');
  addEventListener('pointermove', () => {
    if (!tilt) return;
    const r = tilt.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dx = (mx - cx) / (innerWidth / 2), dy = (my - cy) / (innerHeight / 2);
    const inside = Math.abs(dx) < 1.4 && Math.abs(dy) < 1.4;
    tilt.style.transform =
      `translateX(-50%) perspective(700px) rotateY(${clamp(dx * 7, -7, 7).toFixed(2)}deg) ` +
      `rotateX(${clamp(-dy * 7, -7, 7).toFixed(2)}deg)`;
    tilt.style.borderColor = inside ? 'rgba(182,255,74,.35)' : 'rgba(220,255,240,.18)';
  }, { passive: true });

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function step() {
    // magnetic pull: the target itself is attracted toward nearby controls, so
    // the pointer feels like it wants to land there
    let tx = mx, ty = my;
    for (const el of magnets) {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const d = Math.hypot(cx - mx, cy - my);
      const R = Math.max(r.width, r.height) * 0.85;
      if (d < R && d > 0.001) {
        const f = (1 - d / R) * 0.5;
        tx += (cx - tx) * f;
        ty += (cy - ty) * f;
      }
    }

    vx += (tx - px) * k; vx *= 0.80; px += vx;
    vy += (ty - py) * k; vy *= 0.80; py += vy;

    qvx += (tx - qx) * k * 0.34; qvx *= 0.86; qx += qvx;
    qvy += (ty - qy) * k * 0.34; qvy *= 0.86; qy += qvy;

    // squash along the velocity vector: fast motion stretches the body
    const sp = Math.hypot(vx, vy);
    const ang = Math.atan2(vy, vx) * 180 / Math.PI;
    const sx = 1 + Math.min(0.55, sp * 0.030);
    const sy = 1 - Math.min(0.32, sp * 0.017);
    const base = hovering ? 1.9 : 1;

    dot.style.transform =
      `translate3d(${px}px,${py}px,0) translate(-50%,-50%) rotate(${ang}deg) ` +
      `scale(${(sx * base).toFixed(3)},${(sy * base).toFixed(3)})`;

    const rs = hovering ? 1.6 : 1;
    ring.style.transform =
      `translate3d(${qx}px,${qy}px,0) translate(-50%,-50%) scale(${rs})`;
    ring.style.opacity = hovering ? '0.9' : '0.5';

    lagOut.textContent = Math.round(Math.hypot(mx - px, my - py)) + ' px';
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
})();
