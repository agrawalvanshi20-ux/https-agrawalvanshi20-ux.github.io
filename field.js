/* Immunofluorescence hero.
   Three stains composite onto a dark slide in sequence as the page loads:
   nuclei first, then the branching cells, then the third channel.
   After the merge the field holds still apart from a very slow flicker.
   Reduced motion gets the merged image straight away. */

(function () {
  var canvas = document.getElementById('field');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var CH = {
    dapi: [76, 141, 255],
    fitc: [53, 240, 163],
    cy3: [255, 73, 195]
  };

  // reveal windows in ms: [start, end]
  var REVEAL = {
    dapi: [120, 1500],
    fitc: [900, 2500],
    cy3: [1900, 3400]
  };

  var cells = [];
  var w = 0, h = 0, dpr = 1;
  var start = null;
  var raf = null;

  // deterministic noise so the field looks the same on every load
  var seed = 20261109;
  function rnd() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  }

  function build() {
    cells = [];
    var area = w * h;
    var density = Math.max(0.55, Math.min(1.5, area / 1100000));

    push('dapi', Math.round(52 * density), 3.5, 8.5, false);
    push('fitc', Math.round(20 * density), 9, 22, true);
    push('cy3', Math.round(22 * density), 5, 14, true);

    function push(ch, n, rmin, rmax, branched) {
      for (var i = 0; i < n; i++) {
        var r = rmin + rnd() * (rmax - rmin);
        var c = {
          x: rnd() * w,
          y: rnd() * h,
          r: r,
          ch: ch,
          core: 0.55 + rnd() * 0.45,
          phase: rnd() * Math.PI * 2,
          period: 9000 + rnd() * 11000,
          arms: []
        };
        if (branched) {
          var n2 = 3 + Math.floor(rnd() * 4);
          for (var a = 0; a < n2; a++) {
            var ang = rnd() * Math.PI * 2;
            var len = r * (1.6 + rnd() * 2.6);
            c.arms.push({
              ang: ang,
              len: len,
              bend: (rnd() - 0.5) * 1.1,
              wid: Math.max(0.8, r * 0.16)
            });
          }
        }
        cells.push(c);
      }
    }

    // nuclei read as brighter than the rest, so draw them last
    cells.sort(function (a, b) {
      return (a.ch === 'dapi' ? 1 : 0) - (b.ch === 'dapi' ? 1 : 0);
    });
  }

  function size() {
    var rect = canvas.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = Math.max(1, Math.round(rect.width));
    h = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  function ease(t) {
    return t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3);
  }

  function rgba(ch, a) {
    var c = CH[ch];
    return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a.toFixed(3) + ')';
  }

  function draw(elapsed) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';

    for (var i = 0; i < cells.length; i++) {
      var c = cells[i];
      var win = REVEAL[c.ch];
      var reveal = reduce ? 1 : ease((elapsed - win[0]) / (win[1] - win[0]));
      if (reveal <= 0) continue;

      // slow flicker, the way a stain bleaches unevenly under the lamp
      var flick = reduce ? 1 : 0.92 + 0.08 * Math.sin(c.phase + elapsed / c.period * Math.PI * 2);
      var a = c.core * reveal * flick;

      // branches
      for (var j = 0; j < c.arms.length; j++) {
        var arm = c.arms[j];
        var ex = c.x + Math.cos(arm.ang) * arm.len;
        var ey = c.y + Math.sin(arm.ang) * arm.len;
        var mx = c.x + Math.cos(arm.ang + arm.bend) * arm.len * 0.55;
        var my = c.y + Math.sin(arm.ang + arm.bend) * arm.len * 0.55;
        ctx.strokeStyle = rgba(c.ch, a * 0.2);
        ctx.lineWidth = arm.wid;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.quadraticCurveTo(mx, my, ex, ey);
        ctx.stroke();
      }

      // body: tight core inside a soft halo
      var halo = c.r * 3.1;
      var g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, halo);
      g.addColorStop(0, rgba(c.ch, a * 0.95));
      g.addColorStop(0.22, rgba(c.ch, a * 0.5));
      g.addColorStop(0.55, rgba(c.ch, a * 0.13));
      g.addColorStop(1, rgba(c.ch, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(c.x, c.y, halo, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = rgba(c.ch, a * 0.85);
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r * 0.62, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  function frame(ts) {
    if (start === null) start = ts;
    draw(ts - start);
    raf = window.requestAnimationFrame(frame);
  }

  function run() {
    if (reduce) {
      draw(99999);
      return;
    }
    if (raf) window.cancelAnimationFrame(raf);
    raf = window.requestAnimationFrame(frame);
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      size();
      if (reduce) draw(99999);
    }, 180);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (raf) { window.cancelAnimationFrame(raf); raf = null; }
    } else if (!reduce && !raf) {
      raf = window.requestAnimationFrame(frame);
    }
  });

  size();
  run();
})();
