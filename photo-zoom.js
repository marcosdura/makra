// photo-zoom.js — photo zoom for the MÄKRA site.
//
//   <img data-zoom>      Two-finger pinch lifts the photo over the page and it
//                        follows the fingers (Instagram style), snapping back on
//                        release. The page itself does not zoom.
//   <img data-lightbox>  Tap / click / Enter opens a full-screen viewer with the
//                        whole, uncropped photo. Inside it: pinch, double-tap,
//                        drag, mouse wheel and click all zoom.
//
// Everything is delegated from `document`, so it keeps working no matter when
// the x-dc runtime renders or re-renders the images. Both inline photos sit in
// a clipping wrapper they fill (position:absolute; inset:0), and the pinch clone
// copies that wrapper's box so it shows the same crop.
(() => {
  const reduceMotion = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const DURATION = reduceMotion ? 0 : 250;
  const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const MAX_SCALE = 5;
  const TAP_ZOOM = 2.5;

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const dist = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  const mid = (a, b) => ({ x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 });
  const closestIn = (node, sel) => (node && node.closest ? node.closest(sel) : null);

  const css = document.createElement('style');
  css.textContent = `
    img[data-zoom], img[data-lightbox] { touch-action: pan-x pan-y; -webkit-user-select: none; user-select: none; }
    img[data-lightbox] { cursor: zoom-in; }
    .pz-backdrop { position: fixed; inset: 0; z-index: 9998; background: #14160f; opacity: 0; pointer-events: none; }
    .pz-clone { position: fixed; z-index: 9999; margin: 0; object-fit: cover; pointer-events: none; will-change: transform; box-shadow: 0 24px 60px rgba(0,0,0,0.35); }
    .lb { position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center; background: rgba(20,22,15,0.97); opacity: 0; transition: opacity ${DURATION}ms ease; touch-action: none; overscroll-behavior: contain; }
    .lb.is-open { opacity: 1; }
    .lb:not(.is-open) { pointer-events: none; }
    .lb img { display: block; max-width: 100vw; max-height: 100vh; max-height: 100dvh; transform-origin: 0 0; will-change: transform; -webkit-user-drag: none; user-select: none; cursor: zoom-in; }
    .lb.is-zoomed img { cursor: grab; }
    .lb.is-dragging img { cursor: grabbing; }
    @media (min-width: 781px) { .lb img { max-width: calc(100vw - 96px); max-height: calc(100vh - 96px); } }
    .lb-close { position: absolute; top: max(14px, env(safe-area-inset-top)); right: 14px; width: 44px; height: 44px; border: none; border-radius: 50%; background: rgba(255,255,255,0.14); color: #fff; font-size: 18px; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s ease; }
    .lb-close:hover { background: rgba(255,255,255,0.26); }
    .lb-close:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
  `;
  document.head.appendChild(css);

  let suppressClickUntil = 0; // swallows the click a pinch or a lightbox tap would leave behind
  let lastTouchAt = 0;        // tells real mouse input apart from touch-emulated mouse events
  let pinchFingersDown = false; // a finger from a finished pinch is still on the screen

  // ─── Inline pinch (Instagram style) ──────────────────────────────────────
  let pinch = null;

  function startPinch(img, a, b) {
    const box = img.parentElement || img;
    const r = box.getBoundingClientRect();
    const m = mid(a, b);
    const backdrop = document.createElement('div');
    backdrop.className = 'pz-backdrop';
    const clone = document.createElement('img');
    clone.className = 'pz-clone';
    clone.src = img.currentSrc || img.src;
    clone.alt = '';
    Object.assign(clone.style, {
      left: r.left + 'px',
      top: r.top + 'px',
      width: r.width + 'px',
      height: r.height + 'px',
      borderRadius: getComputedStyle(box).borderRadius,
      transformOrigin: (m.x - r.left) + 'px ' + (m.y - r.top) + 'px',
    });
    document.body.append(backdrop, clone);
    img.style.visibility = 'hidden';
    pinch = { img, clone, backdrop, d0: Math.max(dist(a, b), 1), m0: m };
  }

  function movePinch(a, b) {
    const s = clamp(dist(a, b) / pinch.d0, 1, 4);
    const m = mid(a, b);
    pinch.clone.style.transform = `translate(${m.x - pinch.m0.x}px, ${m.y - pinch.m0.y}px) scale(${s})`;
    pinch.backdrop.style.opacity = String(Math.min(0.7, (s - 1) * 0.8));
  }

  function endPinch() {
    const p = pinch;
    pinch = null;
    // Fingers rarely lift together, and the last one can still produce a click.
    // Block clicks until every finger is up (see onTouchEnd); the 2s cap is a
    // safety net in case that final touchend never arrives.
    pinchFingersDown = true;
    suppressClickUntil = Date.now() + 2000;
    p.clone.style.transition = `transform ${DURATION}ms ${EASE}`;
    p.backdrop.style.transition = `opacity ${DURATION}ms ease`;
    p.clone.getBoundingClientRect(); // commit the transition before changing transform
    p.clone.style.transform = 'none';
    p.backdrop.style.opacity = '0';
    setTimeout(() => {
      p.clone.remove();
      p.backdrop.remove();
      p.img.style.visibility = '';
    }, DURATION + 20);
  }

  document.addEventListener('touchstart', (e) => {
    lastTouchAt = Date.now();
    if (lb || pinch || e.touches.length !== 2) return;
    const img = Array.from(e.touches).map((t) => closestIn(t.target, 'img[data-zoom]')).find(Boolean);
    if (!img) return;
    e.preventDefault();
    startPinch(img, e.touches[0], e.touches[1]);
  }, { passive: false });

  document.addEventListener('touchmove', (e) => {
    if (!pinch) return;
    e.preventDefault();
    if (e.touches.length >= 2) movePinch(e.touches[0], e.touches[1]);
  }, { passive: false });

  const onTouchEnd = (e) => {
    lastTouchAt = Date.now();
    if (pinch && e.touches.length < 2) endPinch();
    if (pinchFingersDown && e.touches.length === 0) {
      pinchFingersDown = false;
      suppressClickUntil = Date.now() + 350;
    }
  };
  document.addEventListener('touchend', onTouchEnd);
  document.addEventListener('touchcancel', onTouchEnd);

  // iOS Safari still zooms the page from its gesture events unless they're cancelled.
  const onGesture = (e) => {
    if (pinch || lb || closestIn(e.target, 'img[data-zoom]')) e.preventDefault();
  };
  document.addEventListener('gesturestart', onGesture, { passive: false });
  document.addEventListener('gesturechange', onGesture, { passive: false });

  // Capture phase, so it also stops the card links from navigating.
  document.addEventListener('click', (e) => {
    if (Date.now() < suppressClickUntil) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  // ─── Lightbox ────────────────────────────────────────────────────────────
  let lb = null;

  document.addEventListener('click', (e) => {
    if (lb) return;
    const img = closestIn(e.target, 'img[data-lightbox]');
    if (!img) return;
    e.preventDefault();
    openLightbox(img);
  });

  document.addEventListener('keydown', (e) => {
    if (lb) {
      if (e.key === 'Escape') closeLightbox();
      return;
    }
    const img = closestIn(e.target, 'img[data-lightbox]');
    if (img && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      openLightbox(img);
    }
  });

  window.addEventListener('hashchange', () => { if (lb) closeLightbox(); });
  window.addEventListener('resize', () => {
    if (!lb) return;
    lb.s = 1; lb.tx = 0; lb.ty = 0;
    apply(false);
  });

  function openLightbox(source) {
    const el = document.createElement('div');
    el.className = 'lb';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', source.alt || 'Foto');
    const img = document.createElement('img');
    img.src = source.currentSrc || source.src;
    img.alt = source.alt || '';
    img.draggable = false;
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'lb-close';
    close.setAttribute('aria-label', 'Cerrar');
    close.textContent = '✕';
    el.append(img, close);
    document.body.appendChild(el);

    lb = {
      el, img, s: 1, tx: 0, ty: 0, g: null, lastTap: null, dragMoved: false,
      returnFocus: document.activeElement,
      overflow: document.documentElement.style.overflow,
    };
    document.documentElement.style.overflow = 'hidden';

    el.addEventListener('click', onLbClick);
    el.addEventListener('touchstart', onLbTouchStart, { passive: false });
    el.addEventListener('touchmove', onLbTouchMove, { passive: false });
    el.addEventListener('touchend', onLbTouchEnd, { passive: false });
    el.addEventListener('touchcancel', onLbTouchEnd, { passive: false });
    el.addEventListener('wheel', onLbWheel, { passive: false });
    img.addEventListener('mousedown', onLbMouseDown);

    requestAnimationFrame(() => el.classList.add('is-open'));
    close.focus({ preventScroll: true });
  }

  function closeLightbox() {
    const l = lb;
    lb = null;
    suppressClickUntil = Date.now() + 400; // no ghost click on whatever sits underneath
    document.documentElement.style.overflow = l.overflow;
    l.el.classList.remove('is-open');
    setTimeout(() => l.el.remove(), DURATION);
    if (l.returnFocus && l.returnFocus.focus) l.returnFocus.focus({ preventScroll: true });
  }

  function apply(animate) {
    lb.img.style.transition = animate && DURATION ? `transform ${DURATION}ms ${EASE}` : 'none';
    lb.img.style.transform = `translate(${lb.tx}px, ${lb.ty}px) scale(${lb.s})`;
    lb.el.classList.toggle('is-zoomed', lb.s > 1.01);
  }

  // Untransformed layout box of the photo. offset* ignore transforms, so this
  // stays right even mid-animation (the overlay is fixed at the viewport origin).
  function base() {
    const i = lb.img;
    return { left: i.offsetLeft, top: i.offsetTop, width: i.offsetWidth, height: i.offsetHeight };
  }

  // Keep the photo on screen: centred on an axis where it fits, edge-to-edge
  // where it's bigger than the viewport. At (or below) 1× it resets entirely.
  function clampPan(b) {
    if (lb.s <= 1.01) {
      lb.s = 1; lb.tx = 0; lb.ty = 0;
      return;
    }
    lb.s = Math.min(lb.s, MAX_SCALE);
    const axis = (t, start, size, view) => {
      const scaled = size * lb.s;
      if (scaled <= view) return view / 2 - scaled / 2 - start;
      return clamp(t, view - scaled - start, -start);
    };
    lb.tx = axis(lb.tx, b.left, b.width, lb.el.clientWidth);
    lb.ty = axis(lb.ty, b.top, b.height, lb.el.clientHeight);
  }

  // Zoom to s1 keeping the photo point under (cx, cy) fixed on screen.
  function zoomAt(cx, cy, s1, animate) {
    const b = base();
    if (!b.width) return;
    const ux = (cx - b.left - lb.tx) / lb.s;
    const uy = (cy - b.top - lb.ty) / lb.s;
    lb.s = s1;
    lb.tx = cx - b.left - s1 * ux;
    lb.ty = cy - b.top - s1 * uy;
    clampPan(b);
    apply(animate);
  }

  function onLbTouchStart(e) {
    lastTouchAt = Date.now();
    const t = e.touches;
    if (t.length >= 2) {
      e.preventDefault();
      lb.g = { type: 'pinch', s0: lb.s, tx0: lb.tx, ty0: lb.ty, d0: Math.max(dist(t[0], t[1]), 1), m0: mid(t[0], t[1]), b: base() };
    } else if (t.length === 1) {
      lb.g = { type: 'pan', x0: t[0].clientX, y0: t[0].clientY, tx0: lb.tx, ty0: lb.ty, moved: false };
    }
  }

  function onLbTouchMove(e) {
    e.preventDefault();
    const g = lb.g;
    if (!g) return;
    const t = e.touches;
    if (g.type === 'pinch' && t.length >= 2) {
      const s1 = clamp(g.s0 * dist(t[0], t[1]) / g.d0, 0.8, MAX_SCALE);
      const m = mid(t[0], t[1]);
      const ux = (g.m0.x - g.b.left - g.tx0) / g.s0;
      const uy = (g.m0.y - g.b.top - g.ty0) / g.s0;
      lb.s = s1;
      lb.tx = m.x - g.b.left - s1 * ux;
      lb.ty = m.y - g.b.top - s1 * uy;
      apply(false);
    } else if (g.type === 'pan' && t.length === 1) {
      const dx = t[0].clientX - g.x0;
      const dy = t[0].clientY - g.y0;
      if (Math.abs(dx) + Math.abs(dy) > 8) g.moved = true;
      if (lb.s > 1.01) {
        lb.tx = g.tx0 + dx;
        lb.ty = g.ty0 + dy;
        apply(false);
      }
    }
  }

  function onLbTouchEnd(e) {
    lastTouchAt = Date.now();
    const g = lb && lb.g;
    if (!g) return;

    if (g.type === 'pinch') {
      if (e.touches.length === 1) { // one finger still down: keep panning with it
        const t = e.touches[0];
        lb.g = { type: 'pan', x0: t.clientX, y0: t.clientY, tx0: lb.tx, ty0: lb.ty, moved: true };
      } else if (e.touches.length === 0) {
        lb.g = null;
        clampPan(base());
        apply(true);
      }
      return;
    }

    lb.g = null;
    if (g.moved) {
      clampPan(base());
      apply(true);
      return;
    }

    // A tap. Handled here rather than via the synthetic click, which some
    // browsers drop once touchmove has been cancelled.
    e.preventDefault();
    if (closestIn(e.target, '.lb-close') || e.target === lb.el) {
      closeLightbox();
      return;
    }
    if (e.target !== lb.img) return;
    const p = e.changedTouches[0];
    const now = Date.now();
    const last = lb.lastTap;
    if (last && now - last.t < 300 && Math.hypot(p.clientX - last.x, p.clientY - last.y) < 30) {
      lb.lastTap = null;
      zoomAt(p.clientX, p.clientY, lb.s > 1.01 ? 1 : TAP_ZOOM, true);
    } else {
      lb.lastTap = { t: now, x: p.clientX, y: p.clientY };
    }
  }

  function onLbClick(e) {
    if (closestIn(e.target, '.lb-close') || e.target === lb.el) {
      closeLightbox();
      return;
    }
    if (e.target !== lb.img || Date.now() - lastTouchAt < 800) return;
    if (lb.dragMoved) {
      lb.dragMoved = false;
      return;
    }
    zoomAt(e.clientX, e.clientY, lb.s > 1.01 ? 1 : TAP_ZOOM, true);
  }

  function onLbWheel(e) {
    e.preventDefault();
    zoomAt(e.clientX, e.clientY, clamp(lb.s * Math.exp(-e.deltaY * 0.0015), 1, MAX_SCALE), false);
  }

  function onLbMouseDown(e) {
    if (e.button !== 0 || lb.s <= 1.01 || Date.now() - lastTouchAt < 800) return;
    e.preventDefault();
    const x0 = e.clientX, y0 = e.clientY, tx0 = lb.tx, ty0 = lb.ty;
    lb.dragMoved = false;
    lb.el.classList.add('is-dragging');
    const move = (ev) => {
      if (!lb) return;
      const dx = ev.clientX - x0, dy = ev.clientY - y0;
      if (Math.abs(dx) + Math.abs(dy) > 4) lb.dragMoved = true;
      lb.tx = tx0 + dx;
      lb.ty = ty0 + dy;
      apply(false);
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      if (!lb) return;
      lb.el.classList.remove('is-dragging');
      clampPan(base());
      apply(true);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }
})();
