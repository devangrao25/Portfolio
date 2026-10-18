(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Sticky header
  const header = document.getElementById("siteHeader");
  const onScrollHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  };
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  // Reveal on scroll
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  // Soft tilt on portrait
  const portrait = document.querySelector(".portrait-frame");
  if (portrait) {
    portrait.addEventListener("pointermove", (e) => {
      const rect = portrait.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      portrait.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
    });
    portrait.addEventListener("pointerleave", () => {
      portrait.style.transform = "";
    });
    portrait.style.transformStyle = "preserve-3d";
    portrait.style.transition = "transform 0.2s ease";
  }

  // Particle field
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let particles = [];
  let raf = 0;
  let reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const resize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    const count = Math.min(70, Math.floor((width * height) / 28000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      a: Math.random() * 0.45 + 0.15,
    }));
  };

  const draw = () => {
    if (reduceMotion) return;
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(45, 212, 168, ${p.a})`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(45, 212, 168, ${0.12 * (1 - dist / 120)})`;
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(draw);
  };

  if (!reduceMotion) {
    resize();
    draw();
    window.addEventListener("resize", () => {
      cancelAnimationFrame(raf);
      resize();
      draw();
    });
  }
})();
