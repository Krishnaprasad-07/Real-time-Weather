// Animated weather layer drawn behind the cards. main.js calls Sky.set({ theme, icon, condition }).
(() => {
  const canvas = document.getElementById("sky");
  const ctx = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const FADE_MS = 500;

  let width = 0;
  let height = 0;
  let spec = { theme: "default" };
  let scene = [];
  let frameId = 0;
  let lastTime = 0;
  let swapTimer = 0;
  let resizeTimer = 0;

  const rand = (min, max) => min + Math.random() * (max - min);
  // Particle counts scale with screen area so phones and large monitors look equally dense.
  const density = (pixelsPerParticle, max) => Math.min(Math.round((width * height) / pixelsPerParticle), max);

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  // Soft shapes are painted once into offscreen canvases and reused every frame.
  const sprite = (w, h, paint) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    paint(c.getContext("2d"));
    return c;
  };

  const softCircle = (g, x, y, r) => {
    const gradient = g.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.85)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    g.fillStyle = gradient;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  };

  const CLOUD = sprite(420, 240, (g) => {
    [[120, 150, 80], [200, 110, 95], [285, 145, 75], [205, 170, 80]]
      .forEach(([x, y, r]) => softCircle(g, x, y, r));
  });

  const MIST = sprite(800, 160, (g) => {
    g.scale(5, 1);
    softCircle(g, 80, 80, 78);
  });

  // Layers. Each returns { update(dt), draw() }; dt is in seconds.

  const sun = (strength = 1) => {
    let t = 0;
    return {
      update(dt) {
        t += dt;
      },
      draw() {
        const x = width * 0.85;
        const y = height * 0.06;
        const reach = Math.max(width, height) * 1.1;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(t * 0.02);
        const ray = ctx.createLinearGradient(0, 0, reach, 0);
        ray.addColorStop(0, `rgba(255, 255, 255, ${0.045 * strength})`);
        ray.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = ray;
        for (let i = 0; i < 12; i++) {
          ctx.rotate((Math.PI * 2) / 12);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(reach, -reach * 0.06);
          ctx.lineTo(reach, reach * 0.06);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        const brightness = (0.28 + Math.sin(t * 0.6) * 0.04) * strength;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, Math.min(width, height) * 0.45);
        glow.addColorStop(0, `rgba(255, 244, 214, ${brightness})`);
        glow.addColorStop(1, "rgba(255, 244, 214, 0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      }
    };
  };

  const stars = (amount) => {
    const list = Array.from({ length: Math.round(density(6000, 220) * amount) }, () => ({
      x: rand(0, width),
      y: rand(0, height * 0.75),
      r: rand(0.4, 1.3),
      alpha: rand(0.3, 0.9),
      phase: rand(0, Math.PI * 2),
      speed: rand(0.5, 1.8)
    }));
    const SHOT_LIFE = 0.8;
    let shooting = null;
    let nextShot = rand(6, 14);

    return {
      update(dt) {
        list.forEach((s) => { s.phase += s.speed * dt; });
        nextShot -= dt;
        if (!shooting && nextShot <= 0) {
          shooting = { x: rand(width * 0.1, width * 0.7), y: rand(0, height * 0.3), life: 0 };
          nextShot = rand(8, 18);
        }
        if (shooting) {
          shooting.life += dt;
          shooting.x += 600 * dt;
          shooting.y += 250 * dt;
          if (shooting.life > SHOT_LIFE) shooting = null;
        }
      },
      draw() {
        ctx.fillStyle = "#ffffff";
        for (const s of list) {
          ctx.globalAlpha = s.alpha * (0.65 + 0.35 * Math.sin(s.phase));
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        if (shooting) {
          const fade = 1 - shooting.life / SHOT_LIFE;
          const tailX = shooting.x - 120;
          const tailY = shooting.y - 50;
          const trail = ctx.createLinearGradient(shooting.x, shooting.y, tailX, tailY);
          trail.addColorStop(0, `rgba(255, 255, 255, ${0.7 * fade})`);
          trail.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.strokeStyle = trail;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(shooting.x, shooting.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();
        }
      }
    };
  };

  const clouds = (amount, night) => {
    const make = (anywhere) => {
      const scale = rand(0.7, 1.8);
      return {
        scale,
        x: anywhere ? rand(-CLOUD.width * scale, width) : -CLOUD.width * scale,
        y: rand(-0.1, 0.55) * height,
        speed: rand(6, 16) * scale,
        alpha: rand(0.08, 0.16) * (night ? 0.6 : 1)
      };
    };
    const list = Array.from({ length: Math.max(1, Math.round(rand(5, 7) * amount)) }, () => make(true));

    return {
      update(dt) {
        list.forEach((c, i) => {
          c.x += c.speed * dt;
          if (c.x > width) list[i] = make(false);
        });
      },
      draw() {
        for (const c of list) {
          ctx.globalAlpha = c.alpha;
          ctx.drawImage(CLOUD, c.x, c.y, CLOUD.width * c.scale, CLOUD.height * c.scale);
        }
        ctx.globalAlpha = 1;
      }
    };
  };

  const rain = (amount) => {
    const SLANT = 0.15;
    const make = (anywhere) => ({
      x: rand(-height * SLANT, width),
      y: anywhere ? rand(0, height) : rand(-60, -10),
      len: rand(12, 24),
      speed: rand(750, 1150),
      alpha: rand(0.12, 0.35)
    });
    const drops = Array.from({ length: Math.round(density(9000, 170) * amount) }, () => make(true));

    return {
      update(dt) {
        for (const d of drops) {
          d.y += d.speed * dt;
          d.x += d.speed * SLANT * dt;
          if (d.y > height) Object.assign(d, make(false));
        }
      },
      draw() {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.lineCap = "round";
        for (const d of drops) {
          ctx.globalAlpha = d.alpha;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + d.len * SLANT, d.y + d.len);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
    };
  };

  const snow = (amount) => {
    const make = (anywhere) => {
      const r = rand(1, 3.2);
      return {
        baseX: rand(0, width),
        y: anywhere ? rand(0, height) : rand(-20, -5),
        r,
        speed: 18 + r * 14,
        sway: rand(8, 28),
        phase: rand(0, Math.PI * 2),
        alpha: rand(0.45, 0.9)
      };
    };
    const flakes = Array.from({ length: Math.round(density(7000, 200) * amount) }, () => make(true));

    return {
      update(dt) {
        for (const f of flakes) {
          f.y += f.speed * dt;
          f.phase += dt * 0.8;
          if (f.y > height + 5) Object.assign(f, make(false));
        }
      },
      draw() {
        ctx.fillStyle = "#ffffff";
        for (const f of flakes) {
          ctx.globalAlpha = f.alpha;
          ctx.beginPath();
          ctx.arc(f.baseX + Math.sin(f.phase) * f.sway, f.y, f.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    };
  };

  const mist = (night) => {
    const bands = Array.from({ length: 6 }, (_, i) => ({
      x: rand(-MIST.width, width),
      y: height * (0.1 + i * 0.15) + rand(-30, 30),
      scale: rand(1, 1.8),
      speed: rand(8, 20) * (i % 2 ? -1 : 1),
      alpha: rand(0.1, 0.18) * (night ? 0.7 : 1)
    }));

    return {
      update(dt) {
        for (const b of bands) {
          const w = MIST.width * b.scale;
          b.x += b.speed * dt;
          if (b.speed > 0 && b.x > width) b.x = -w;
          if (b.speed < 0 && b.x < -w) b.x = width;
        }
      },
      draw() {
        for (const b of bands) {
          const h = MIST.height * b.scale;
          ctx.globalAlpha = b.alpha;
          ctx.drawImage(MIST, b.x, b.y - h / 2, MIST.width * b.scale, h);
        }
        ctx.globalAlpha = 1;
      }
    };
  };

  // Kept faint and infrequent (a soft glow every 6–12 s) so it is never a strobe.
  const lightning = () => {
    let flash = 0;
    let next = rand(4, 9);
    return {
      update(dt) {
        next -= dt;
        if (next <= 0) {
          flash = 1;
          next = rand(6, 12);
        }
        flash = Math.max(0, flash - dt * 2.5);
      },
      draw() {
        if (flash > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${flash * 0.12})`;
          ctx.fillRect(0, 0, width, height);
        }
      }
    };
  };

  const buildScene = ({ theme = "default", icon = "", condition = "" }) => {
    const [sky, period] = theme.split("-");
    const night = period === "night";
    const code = icon.slice(0, 2);
    const strength = /light|drizzle/.test(condition) ? 0.55 : /heavy|extreme|very/.test(condition) ? 1.5 : 1;

    switch (sky) {
      case "clear":
        return night ? [stars(1)] : [sun()];
      case "clouds": {
        const cover = { "02": 0.45, "03": 0.8, "04": 1.2 }[code] ?? 0.8;
        const behind = code === "02" ? [night ? stars(0.6) : sun(0.6)] : [];
        return [...behind, clouds(cover, night)];
      }
      case "rain":
        return [clouds(0.7, night), rain(strength)];
      case "storm":
        return [clouds(1.1, night), lightning(), rain(1.4)];
      case "snow":
        return [clouds(0.5, night), snow(strength)];
      case "mist":
        return [mist(night)];
      default:
        return [];
    }
  };

  const tick = (time) => {
    const dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    ctx.clearRect(0, 0, width, height);
    for (const layer of scene) {
      layer.update(dt);
      layer.draw();
    }
    frameId = requestAnimationFrame(tick);
  };

  const start = () => {
    cancelAnimationFrame(frameId);
    ctx.clearRect(0, 0, width, height);
    scene = reducedMotion.matches ? [] : buildScene(spec);
    if (scene.length) {
      lastTime = performance.now();
      frameId = requestAnimationFrame(tick);
    }
  };

  const keyOf = ({ theme, icon, condition }) => `${theme}|${icon}|${condition}`;

  const set = (next) => {
    if (keyOf(next) === keyOf(spec)) return;
    spec = next;
    canvas.classList.add("is-faded");
    clearTimeout(swapTimer);
    swapTimer = setTimeout(() => {
      start();
      canvas.classList.remove("is-faded");
    }, FADE_MS);
  };

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      start();
    }, 150);
  });
  reducedMotion.addEventListener?.("change", start);

  resize();
  start();

  window.Sky = { set };
})();
