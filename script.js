(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s) => document.querySelector(s);



  /* ---------- Pause decorative loops while off screen ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('offscreen', !e.isIntersecting)), { rootMargin: '100px 0px' });
    document.querySelectorAll('.hero, .marquee, .strip, #work, #contact').forEach((el) => io.observe(el));
  }

  /* ---------- Hero typewriter ---------- */
  const typerEl = document.getElementById('typer');
  const words = ['Shopify stores', 'WordPress sites', 'Landing pages', 'React & Next.js apps', '.NET & Laravel APIs', 'Meta & TikTok campaigns'];
  if (typerEl && !reduce) {
    let w = 0, ch = words[0].length, del = true;
    const tick = () => {
      const word = words[w];
      typerEl.textContent = word.slice(0, ch);
      if (del) { ch--; if (ch < 0) { del = false; w = (w + 1) % words.length; ch = 0; } setTimeout(tick, 38); }
      else { ch++; if (ch > words[w].length) { del = true; ch = words[w].length; setTimeout(tick, 1600); } else setTimeout(tick, 70); }
    };
    setTimeout(tick, 1800);
  }

  /* ---------- Hero demo: ad click → landing page → pixel events ---------- */
  const platforms = [
    { name: 'Instagram', src: 'instagram', fn: 'fbq', events: ["'PageView'", "'ViewContent'", "'AddToCart'"], wrap: (e) => `('track', ${e})` },
    { name: 'TikTok',    src: 'tiktok',    fn: 'ttq', events: ["'ViewContent'", "'ClickButton'", "'AddToCart'"], wrap: (e) => `.track(${e})` },
    { name: 'Facebook',  src: 'facebook',  fn: 'fbq', events: ["'PageView'", "'Lead'", "'CompleteRegistration'"], wrap: (e) => `('track', ${e})` },
  ];
  const adPlatform = $('#adPlatform'), url = $('#url'), page = $('#page'), log = $('#log'), cta = $('#adCta');
  let i = 0;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  function addLine(t, p, ev) {
    const line = document.createElement('div');
    line.className = 'log-line';
    line.innerHTML = `<span class="t">${t}</span> <span class="fn">${p.fn}</span>${p.wrap(`<span class="ev">${ev}</span>`)}`;
    log.appendChild(line);
    const lines = log.querySelectorAll('.log-line');
    if (lines.length > 4) lines[0].remove();
  }

  async function cycle() {
    if (document.hidden) return setTimeout(cycle, 1500);
    const p = platforms[i++ % platforms.length];
    adPlatform.textContent = `Sponsored · ${p.name}`;
    await wait(900);
    cta.classList.remove('tap'); void cta.offsetWidth; cta.classList.add('tap');
    await wait(450);
    page.classList.add('loading');
    url.innerHTML = `yourbrand.com/launch?<b>utm_source=${p.src}</b>&amp;utm_campaign=drop`;
    await wait(550);
    page.classList.remove('loading');
    log.querySelectorAll('.log-line').forEach((l) => l.remove());
    const times = ['00:01', '00:03', '00:07'];
    for (let k = 0; k < p.events.length; k++) {
      await wait(650);
      addLine(times[k], p, p.events[k]);
    }
    setTimeout(cycle, 2600);
  }
  if (!reduce && page && log) setTimeout(cycle, 2200);

  /* ---------- Work section nav: jump to a group and highlight the one in view ---------- */
  const workNav = document.querySelector('.work-nav');
  const navLinks = [...document.querySelectorAll('.wn')];
  if (workNav && navLinks.length) {
    const topBar = document.querySelector('.nav');
    let lockUntil = 0;
    const setActive = (a) => {
      navLinks.forEach((l) => l.classList.toggle('active', l === a));
      // keep the active chip visible inside the bar without scrolling the page
      const left = a.offsetLeft - (workNav.clientWidth - a.offsetWidth) / 2;
      workNav.scrollTo({ left: Math.max(0, left), behavior: reduce ? 'auto' : 'smooth' });
    };
    const offset = () => (topBar ? topBar.offsetHeight : 0) + workNav.offsetHeight + 28;
    navLinks.forEach((a) => {
      a.addEventListener('click', (ev) => {
        const target = document.getElementById(a.getAttribute('href').slice(1));
        if (!target) return;
        ev.preventDefault();
        setActive(a);
        lockUntil = Date.now() + 1200;
        const y = target.getBoundingClientRect().top + window.scrollY - offset();
        window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      });
    });
    const groups = navLinks.map((a) => document.getElementById(a.getAttribute('href').slice(1)));
    let ticking = false;
    const onScroll = () => {
      ticking = false;
      if (Date.now() < lockUntil) return;
      const line = offset() + 40;
      let current = 0;
      groups.forEach((g, i) => { if (g && g.getBoundingClientRect().top <= line) current = i; });
      if (!navLinks[current].classList.contains('active')) setActive(navLinks[current]);
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    navLinks[0].classList.add('active');
  }

  /* ---------- Copy buttons ---------- */
  document.querySelectorAll('.copy').forEach((btn) => {
    btn.addEventListener('click', () => {
      const el = document.getElementById(btn.dataset.copy);
      const text = el.textContent.replace(/\s+/g, el.id === 'phone' ? '' : ' ').trim();
      const done = () => { btn.textContent = 'Copied ✓'; btn.classList.add('done'); setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('done'); }, 1600); };
      const fallback = () => {
        const r = document.createRange(); r.selectNodeContents(el);
        const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        btn.textContent = 'Selected';
        setTimeout(() => (btn.textContent = 'Copy'), 1600);
      };
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, fallback);
      else fallback();
    });
  });

  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();
