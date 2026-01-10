/* =========================================================
   main.js — Ingeniería L&H (PRO)
   - Burger menu (mobile)
   - Reveal on scroll
   - Header solid al scroll (sobre hero)
   - Hero video slider (playlist) con fade + rotación por tiempo
   - Side video slider (columna derecha) con rotación por END (ended)
========================================================= */

(function () {
  "use strict";

  /* -------------------------
     Burger menu (mobile)
  -------------------------- */
  const burger = document.querySelector("[data-burger]");
  const drawer = document.querySelector("[data-drawer]");

  if (burger && drawer) {
    burger.addEventListener("click", () => {
      const isHidden = drawer.hasAttribute("hidden");
      if (isHidden) drawer.removeAttribute("hidden");
      else drawer.setAttribute("hidden", "");
      burger.setAttribute("aria-expanded", String(isHidden));
    });
  }

  /* -------------------------
     Reveal on scroll
  -------------------------- */
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  if (revealEls.length) {
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) e.target.classList.add("is-visible");
          });
        },
        { threshold: 0.12 }
      );
      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }
  }

  /* -------------------------
     Header sólido al scroll
     Requiere: <header data-header ...>
  -------------------------- */
  const header = document.querySelector("[data-header]");
  if (header) {
    const solidAt = 40;
    const onScroll = () => {
      if (window.scrollY > solidAt) header.classList.add("is-solid");
      else header.classList.remove("is-solid");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* =========================================================
     HERO VIDEO SLIDER (arriba)
     Rotación por tiempo (DURATION)
     Requiere:
     <div class="hero-media video">
       <video class="hero-video is-active" ...></video>
       <video class="hero-video" ...></video>
     </div>
  ========================================================= */
  (function heroSlider() {
    const container = document.querySelector(".hero-media.video");
    if (!container) return;

    const videos = Array.from(container.querySelectorAll("video.hero-video"));
    if (videos.length < 2) {
      console.warn("[hero-slider] Necesitás 2 <video class='hero-video'>. Encontrados:", videos.length);
      return;
    }

    // ✅ EDITÁ ACÁ tus rutas reales
    const playlist = [
      "assets/video/9339478-uhd_3840_2160_24fps.mp4",
      
    ];

    if (playlist.length < 1) return;

    const DURATION = 12000; // ms por video
    const FADE_MS = 800;    // debe coincidir con CSS (opacity transition)

    videos.forEach((v) => {
      v.muted = true;
      v.playsInline = true;
      v.autoplay = true;
      v.preload = "auto";
      v.loop = true; // evita freeze si el clip termina antes del timer
    });

    let index = 0;
    let active = 0;
    let timer = null;

    function setSource(videoEl, src) {
      try {
        videoEl.pause();
        videoEl.removeAttribute("src");
        videoEl.load();
        videoEl.src = src;
        videoEl.load();
      } catch (e) {
        console.warn("[hero-slider] setSource error:", e);
      }
    }

    function playSafe(videoEl) {
      const p = videoEl.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }

    function scheduleNext() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const nextIndex = (index + 1) % playlist.length;
        swapTo(nextIndex);
      }, DURATION);
    }

    function swapTo(nextIndex) {
      const next = 1 - active;
      const nextSrc = playlist[nextIndex];

      setSource(videos[next], nextSrc);
      videos[next].loop = true;

      const onCanPlay = () => {
        try { videos[next].currentTime = 0; } catch (_) {}
        playSafe(videos[next]);

        videos[active].classList.remove("is-active");
        videos[next].classList.add("is-active");

        setTimeout(() => {
          try { videos[active].pause(); } catch (_) {}
        }, FADE_MS + 50);

        active = next;
        index = nextIndex;

        scheduleNext();
      };

      const onError = () => {
        console.warn("[hero-slider] No se pudo cargar:", nextSrc);
        const fallback = (nextIndex + 1) % playlist.length;
        swapTo(fallback);
      };

      videos[next].addEventListener("canplay", onCanPlay, { once: true });
      videos[next].addEventListener("error", onError, { once: true });
    }

    // START
    setSource(videos[0], playlist[0]);
    videos[0].classList.add("is-active");
    playSafe(videos[0]);

    if (playlist.length > 1) setSource(videos[1], playlist[1]);
    if (playlist.length > 1) scheduleNext();
  })();

  /* =========================================================
     SIDE VIDEO SLIDER (columna derecha)
     Rotación por fin del video (ended)
     Requiere:
     <aside class="side-media">
       <video class="side-video is-active" ...></video>
       <video class="side-video" ...></video>
     </aside>
  ========================================================= */
  (function sideSliderEnded() {
    const container = document.querySelector(".side-media");
    if (!container) return;

    const videos = Array.from(container.querySelectorAll("video.side-video"));
    if (videos.length < 2) {
      console.warn("[side-slider] Necesitás 2 <video class='side-video'>. Encontrados:", videos.length);
      return;
    }

    // ✅ EDITÁ ACÁ tus rutas reales
    const playlist = [
      "assets/video/dron4.mp4",
      
     
      "assets/video/dron6.mp4"
    ];

    if (playlist.length < 1) return;

    // Asegurar autoplay
    videos.forEach((v) => {
      v.muted = true;
      v.playsInline = true;
      v.autoplay = true;
      v.preload = "auto";
      v.loop = false; // IMPORTANTE: queremos usar ended
    });

    let index = 0;
    let active = 0;

    function load(videoEl, src) {
      videoEl.pause();
      videoEl.removeAttribute("src");
      videoEl.load();
      videoEl.src = src;
      videoEl.load();
    }

    function playSafe(videoEl) {
      const p = videoEl.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }

    function swapTo(nextIndex) {
      const next = 1 - active;

      load(videos[next], playlist[nextIndex]);

      videos[next].addEventListener(
        "canplay",
        () => {
          try { videos[next].currentTime = 0; } catch (_) {}
          playSafe(videos[next]);

          videos[active].classList.remove("is-active");
          videos[next].classList.add("is-active");

          videos[active].pause();

          active = next;
          index = nextIndex;
        },
        { once: true }
      );

      videos[next].addEventListener(
        "error",
        () => {
          console.warn("[side-slider] No se pudo cargar:", playlist[nextIndex]);
          const fallback = (nextIndex + 1) % playlist.length;
          swapTo(fallback);
        },
        { once: true }
      );
    }

    // Cuando termina el video ACTIVO → pasar al siguiente
    videos.forEach((v) => {
      v.addEventListener("ended", () => {
        const nextIndex = (index + 1) % playlist.length;
        swapTo(nextIndex);
      });
    });

    // START
    videos[0].classList.add("is-active");
    load(videos[0], playlist[0]);
    playSafe(videos[0]);

    // Precarga del segundo si existe (mejora)
    if (playlist.length > 1) load(videos[1], playlist[1]);
  })();
})();


(function(){
  const sliders = document.querySelectorAll('[data-slider]');

  sliders.forEach(slider => {
    const imgs = Array.from(slider.querySelectorAll('.ws-img'));
    const btnPrev = slider.querySelector('[data-prev]');
    const btnNext = slider.querySelector('[data-next]');
    const counter = slider.querySelector('[data-counter]');

    if (!imgs.length) return;

    let i = 0;

    const update = () => {
      imgs.forEach((img, idx) => img.classList.toggle('is-active', idx === i));
      if (counter) counter.textContent = `${i + 1} / ${imgs.length}`;
    };

    const prev = () => { i = (i - 1 + imgs.length) % imgs.length; update(); };
    const next = () => { i = (i + 1) % imgs.length; update(); };

    btnPrev && btnPrev.addEventListener('click', prev);
    btnNext && btnNext.addEventListener('click', next);

    // Teclado: flechas
    slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    });

    // Inicial
    update();
  });
})();
