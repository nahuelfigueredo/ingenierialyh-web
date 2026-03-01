/* =========================================================
   main.js — Ingeniería L&H (LIMPIO / BLINDADO)
   - Burger menu (mobile)
   - Reveal on scroll
   - Header solid al scroll
   - Hero video slider (playlist) por tiempo
   - Side video slider por ended
   - Slider de imágenes (Obras) [data-slider]
   - Hero Carousel (Flota) imágenes [data-carousel]
   - Lightbox Galería (gallery img) [data-gallery] + [data-lightbox]
========================================================= */

(function () {
  "use strict";

  /* -------------------------
     Helpers
  -------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function uniqTruthy(arr) {
    const out = [];
    const seen = new Set();
    arr.forEach((v) => {
      const s = (v || "").trim();
      if (!s) return;
      if (seen.has(s)) return;
      seen.add(s);
      out.push(s);
    });
    return out;
  }

  function setVideoSource(videoEl, src) {
    try { videoEl.pause(); } catch (_) {}
    try {
      videoEl.removeAttribute("src");
      videoEl.load();
    } catch (_) {}
    videoEl.src = src;
    videoEl.load();
  }

  function playSafe(videoEl) {
    try {
      const p = videoEl.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch (_) {}
  }

  /* -------------------------
     Burger menu (mobile)
  -------------------------- */
  (function burgerMenu() {
    const burger = $("[data-burger]");
    const drawer = $("[data-drawer]");
    if (!burger || !drawer) return;

    function setOpen(open) {
      if (open) drawer.removeAttribute("hidden");
      else drawer.setAttribute("hidden", "");
      burger.setAttribute("aria-expanded", String(open));
    }

    burger.addEventListener("click", () => {
      const open = drawer.hasAttribute("hidden");
      setOpen(open);
    });

    drawer.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (a) setOpen(false);
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  })();

  /* -------------------------
     Reveal on scroll
  -------------------------- */
  (function revealOnScroll() {
    const revealEls = $$(".reveal");
    if (!revealEls.length) return;

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("is-visible")),
        { threshold: 0.12 }
      );
      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }
  })();

  /* -------------------------
     Header sólido al scroll
  -------------------------- */
  (function solidHeader() {
    const header = $("[data-header]");
    if (!header) return;

    const solidAt = 40;
    const onScroll = () => {
      if (window.scrollY > solidAt) header.classList.add("is-solid");
      else header.classList.remove("is-solid");
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  })();

  /* =========================================================
     HERO VIDEO SLIDER (arriba)
  ========================================================= */
  (function heroSlider() {
    const container = $(".hero-media.video");
    if (!container) return;

    const videos = $$("video.hero-video", container);
    if (videos.length < 2) return;

    const playlist = uniqTruthy([
      "assets/video/9339478-uhd_3840_2160_24fps.mp4",
    ]);
    if (playlist.length < 1) return;

    const DURATION = 12000;
    const FADE_MS = 800;

    videos.forEach((v) => {
      v.muted = true;
      v.playsInline = true;
      v.autoplay = true;
      v.preload = "auto";
      v.loop = true;
    });

    let index = 0;
    let active = 0;
    let timer = null;

    function scheduleNext() {
      clearTimeout(timer);
      if (playlist.length <= 1) return;
      timer = setTimeout(() => swapTo((index + 1) % playlist.length), DURATION);
    }

    function swapTo(nextIndex) {
      const next = 1 - active;
      const nextSrc = playlist[nextIndex];

      setVideoSource(videos[next], nextSrc);
      videos[next].loop = true;

      const onCanPlay = () => {
        try { videos[next].currentTime = 0; } catch (_) {}
        playSafe(videos[next]);

        videos[active].classList.remove("is-active");
        videos[next].classList.add("is-active");

        setTimeout(() => { try { videos[active].pause(); } catch (_) {} }, FADE_MS + 50);

        active = next;
        index = nextIndex;
        scheduleNext();
      };

      videos[next].addEventListener("canplay", onCanPlay, { once: true });
      videos[next].addEventListener("error", () => scheduleNext(), { once: true });
    }

    setVideoSource(videos[0], playlist[0]);
    videos[0].classList.add("is-active");
    playSafe(videos[0]);

    if (playlist.length > 1) setVideoSource(videos[1], playlist[1]);
    scheduleNext();
  })();

  /* =========================================================
     SIDE VIDEO SLIDER (ended)
  ========================================================= */
  (function sideSliderEnded() {
    const container = $(".side-media");
    if (!container) return;

    const videos = $$("video.side-video", container);
    if (videos.length < 2) return;

    const playlist = uniqTruthy([
      "assets/video/dron4.mp4",
      "assets/video/dron6.mp4",
    ]);
    if (playlist.length < 1) return;

    videos.forEach((v) => {
      v.muted = true;
      v.playsInline = true;
      v.autoplay = true;
      v.preload = "auto";
      v.loop = false;
    });

    let index = 0;
    let active = 0;

    function swapTo(nextIndex) {
      const next = 1 - active;
      const nextSrc = playlist[nextIndex];

      setVideoSource(videos[next], nextSrc);

      const onCanPlay = () => {
        try { videos[next].currentTime = 0; } catch (_) {}
        playSafe(videos[next]);

        videos[active].classList.remove("is-active");
        videos[next].classList.add("is-active");

        try { videos[active].pause(); } catch (_) {}
        active = next;
        index = nextIndex;
      };

      videos[next].addEventListener("canplay", onCanPlay, { once: true });
      videos[next].addEventListener("error", () => {}, { once: true });
    }

    videos.forEach((v, idx) => {
      v.addEventListener("ended", () => {
        if (idx !== active) return;
        swapTo((index + 1) % playlist.length);
      });
    });

    videos[0].classList.add("is-active");
    setVideoSource(videos[0], playlist[0]);
    playSafe(videos[0]);
    if (playlist.length > 1) setVideoSource(videos[1], playlist[1]);
  })();

  /* =========================================================
     Slider de imágenes (Obras) — SOLO dentro de [data-slider]
     (blindado para no enganchar otros botones)
  ========================================================= */
  (function worksImageSliders() {
    const sliders = $$("[data-slider]");
    if (!sliders.length) return;

    sliders.forEach((slider) => {
      const imgs = $$(".ws-img", slider);
      if (!imgs.length) return;

      const btnPrev = $("[data-prev]", slider);
      const btnNext = $("[data-next]", slider);
      const counter = $("[data-counter]", slider);

      let i = 0;

      const update = () => {
        imgs.forEach((img, idx) => img.classList.toggle("is-active", idx === i));
        if (counter) counter.textContent = `${i + 1} / ${imgs.length}`;
      };

      if (btnPrev) btnPrev.addEventListener("click", (e) => {
        e.preventDefault();
        i = (i - 1 + imgs.length) % imgs.length;
        update();
      });

      if (btnNext) btnNext.addEventListener("click", (e) => {
        e.preventDefault();
        i = (i + 1) % imgs.length;
        update();
      });

      slider.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") { e.preventDefault(); i = (i - 1 + imgs.length) % imgs.length; update(); }
        if (e.key === "ArrowRight") { e.preventDefault(); i = (i + 1) % imgs.length; update(); }
      });

      update();
    });
  })();

  /* =========================================================
     Hero Carousel (Flota) — imágenes con autoplay + swipe
     IMPORTANTE: prev/next scoped dentro del root
  ========================================================= */
  (function heroCarousel() {
    const carousels = $$("[data-carousel]");
    if (!carousels.length) return;

    carousels.forEach((root) => {
      const track = root.querySelector("[data-track]");
      const slides = Array.from(root.querySelectorAll(".hero-carousel__slide"));
      const prevBtn = root.querySelector("[data-prev]");
      const nextBtn = root.querySelector("[data-next]");
      const dots = Array.from(root.querySelectorAll("[data-dot]"));

      if (!track || slides.length < 2) return;

      let index = 0;
      let timer = null;

      function goTo(i) {
        index = (i + slides.length) % slides.length;
        track.style.transform = `translateX(-${index * 100}%)`;
        slides.forEach((s, si) => s.classList.toggle("is-active", si === index));
        dots.forEach((d, di) => d.classList.toggle("is-active", di === index));
      }

      function start() {
        stop();
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        timer = window.setInterval(() => goTo(index + 1), 6000);
      }
      function stop() {
        if (timer) window.clearInterval(timer);
        timer = null;
      }

      if (prevBtn) prevBtn.addEventListener("click", () => { goTo(index - 1); start(); });
      if (nextBtn) nextBtn.addEventListener("click", () => { goTo(index + 1); start(); });

      dots.forEach((d) => {
        d.addEventListener("click", () => {
          const to = Number(d.getAttribute("data-dot") || "0");
          goTo(to);
          start();
        });
      });

      let x0 = null;
      root.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
      root.addEventListener("touchend", (e) => {
        if (x0 == null) return;
        const x1 = e.changedTouches[0].clientX;
        const dx = x1 - x0;
        x0 = null;
        if (Math.abs(dx) < 40) return;
        goTo(dx > 0 ? index - 1 : index + 1);
        start();
      }, { passive: true });

      root.addEventListener("mouseenter", stop);
      root.addEventListener("mouseleave", start);

      goTo(0);
      start();
    });
  })();

  /* =========================================================
     Lightbox Galería — para [data-gallery] img
     Recomendado: data-lightbox-prev / data-lightbox-next
  ========================================================= */
  (function lightboxGallery() {
    const gallery = document.querySelector("[data-gallery]");
    const box = document.querySelector("[data-lightbox]");
    if (!gallery || !box) return;

    const images = Array.from(gallery.querySelectorAll("img"));
    const img = box.querySelector("[data-lightbox-img]");
    const closeBtns = box.querySelectorAll("[data-close]");

    // Cambiado para evitar choque global con otros sliders
    const prevBtn = box.querySelector("[data-lightbox-prev]") || box.querySelector("[data-prev]");
    const nextBtn = box.querySelector("[data-lightbox-next]") || box.querySelector("[data-next]");

    if (!images.length || !img) return;

    let index = 0;

    function openAt(i) {
      index = (i + images.length) % images.length;
      img.src = images[index].currentSrc || images[index].src;
      img.alt = images[index].alt || "Imagen";
      box.hidden = false;
      box.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function close() {
      box.hidden = true;
      box.setAttribute("aria-hidden", "true");
      img.src = "";
      document.body.style.overflow = "";
    }

    function prev() { openAt(index - 1); }
    function next() { openAt(index + 1); }

    images.forEach((im, i) => im.addEventListener("click", () => openAt(i)));
    closeBtns.forEach((b) => b.addEventListener("click", close));
    if (prevBtn) prevBtn.addEventListener("click", prev);
    if (nextBtn) nextBtn.addEventListener("click", next);

    window.addEventListener("keydown", (e) => {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    });
  })();
})();