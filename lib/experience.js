// Original scene shaders and choreography, migrated to npm libraries and React lifecycle.
import { gsap as baseGsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import BaseLenis from "lenis";
import BaseSwiper from "swiper/bundle";

export function mountExperience(root, navigate) {
  let disposed = false;
  const cleanups = [],
    observers = [],
    animations = new Set(),
    timers = new Set(),
    frames = new Set(),
    tickers = new Set();
  const listen = (target, type, fn, options) => {
    if (!target) return;
    target.addEventListener(type, fn, options);
    cleanups.push(() => target.removeEventListener(type, fn, options));
  };
  const requestAnimationFrame = (fn) => {
    const id = window.requestAnimationFrame((time) => {
      frames.delete(id);
      if (!disposed) fn(time);
    });
    frames.add(id);
    return id;
  };
  const setTimeout = (fn, delay, ...args) => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      if (!disposed) fn(...args);
    }, delay);
    timers.add(id);
    return id;
  };
  const setInterval = (fn, delay) => {
    const id = window.setInterval(() => {
      if (!disposed) fn();
    }, delay);
    cleanups.push(() => window.clearInterval(id));
    return id;
  };
  const trackedObserver = (Base) =>
    class extends Base {
      constructor(...args) {
        super(...args);
        observers.push(this);
      }
    };
  const ResizeObserver = trackedObserver(window.ResizeObserver),
    IntersectionObserver = trackedObserver(window.IntersectionObserver),
    MutationObserver = trackedObserver(window.MutationObserver);
  class Lenis extends BaseLenis {
    constructor(...args) {
      super(...args);
      cleanups.push(() => this.destroy());
    }
  }
  class Swiper extends BaseSwiper {
    constructor(...args) {
      super(...args);
      cleanups.push(() => this.destroy(true, true));
    }
  }
  const gsap = new Proxy(baseGsap, {
    get(target, key) {
      if (
        ["to", "from", "fromTo", "set", "timeline", "delayedCall"].includes(key)
      )
        return (...args) => {
          const result = target[key](...args);
          animations.add(result);
          return result;
        };
      if (key === "ticker")
        return {
          ...target.ticker,
          add(fn, ...args) {
            tickers.add(fn);
            return target.ticker.add(fn, ...args);
          },
        };
      return target[key];
    },
  });
  gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText, Flip);
  gsap.config({ nullTargetWarn: false });
  let lenis = null,
    breakPoint = 992,
    resizeTimeout = null,
    globalSceneManager = null,
    durS = 0.4,
    durM = 0.8,
    durL = 1.2,
    stagger = 0.1,
    delayReveal = 0.2;
  const isDayTime = true;
  CustomEase.create("InOut", "0.76,0,0.24,1");
  CustomEase.create("Out", "0.25,1,0.5,1");
  CustomEase.create("In", "0.5,0,0.75,0");
  CustomEase.create("Ease", "0.25,0.1,0.25,1");
  CustomEase.create("Write", "0.333,0,0.667,1");
  const framesPromise =
    window.innerWidth >= breakPoint && root.querySelector("[data-scroll-video]")
      ? Promise.all(
          Array.from(
            { length: 120 },
            (_, index) =>
              new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
                img.src = `/assets/assets.sondaven.com/hero-video-new/${String(index).padStart(3, "0")}.webp`;
              }),
          ),
        )
      : Promise.resolve([]);

  function animateTransition(e) {
    const t = document.querySelector(".transition"),
      o = t.querySelectorAll(".transition_cell"),
      n = t.querySelectorAll(".transition_over");
    switch (e) {
      case "in":
        gsap
          .timeline()
          .set(t, {
            display: "flex",
          })
          .fromTo(
            o,
            {
              scaleX: 0,
            },
            {
              scaleX: 1,
              duration: durS,
              ease: "InOut",
              stagger: {
                each: 0.03,
                from: "end",
                grid: [20, 12],
              },
            },
          )
          .fromTo(
            n,
            {
              opacity: 0,
            },
            {
              opacity: 1,
              duration: durL,
              ease: "InOut",
            },
            0,
          );
        break;
      case "out":
        gsap
          .timeline({
            onComplete: () => {
              gsap.set(t, {
                display: "none",
              });
            },
          })
          .set(t, {
            display: "flex",
          })
          .fromTo(
            o,
            {
              scaleX: 1,
            },
            {
              scaleX: 0,
              duration: durS,
              ease: "InOut",
              stagger: {
                each: 0.03,
                from: "end",
                grid: [20, 12],
              },
            },
          )
          .fromTo(
            n,
            {
              opacity: 1,
            },
            {
              opacity: 0,
              duration: durL,
              ease: "InOut",
            },
            0,
          );
        break;
      case "init":
        (gsap.set(t, {
          display: "flex",
        }),
          gsap.set(o, {
            scaleX: 1,
          }),
          gsap.set(n, {
            opacity: 1,
          }));
    }
  }
  function initScripts() {
    (initThemeChange(),
      initHeaderHide(),
      initForm(),
      initPlayPauseVideoScroll(),
      initIndexCounter(),
      initNextEntityCard(),
      initOther(),
      initAllParallax(),
      initSectionTransition(),
      initScrollElementsReveal(),
      initHighlightText(),
      initMagneticEffect(),
      initMapPins(),
      initNavItemHover(),
      initMenuItemHover(),
      initMarquee(),
      initSoundToggle(),
      initBenefitCard(),
      initAccordion(),
      initLoadMore(),
      initSlider(),
      initSliderText(),
      initSliderFreemode(),
      initTabs(),
      initTabsHilight(),
      initTabsText(),
      initSummerWinterSwitcher(),
      initModalCta(),
      initModalMedia(),
      initModalMenu(),
      initFloatingTips(),
      initScrollVideo(),
      initModalVimVideo());
  }
  function initAllScenes() {
    (globalSceneManager && globalSceneManager.destroy(),
      (globalSceneManager = initSceneManager()),
      initSceneHeroOver(),
      initSceneHeroBg(),
      initSceneProlog(),
      initSceneAbout(),
      initSceneSeasons(),
      initSceneBenefitsIntro(),
      initSceneBenefitsOutro(),
      initSceneFin(),
      initSceneDevOver(),
      initSceneDevBg(),
      initSceneFactoid(),
      initSceneFaq(),
      initSceneFooter(),
      initSceneArticleDark(),
      initSceneArticleLight(),
      initSceneError());
  }
  function initLenis() {
    (lenis && (lenis.destroy(), (lenis = null)),
      (lenis = new Lenis({
        wrapper: window,
        duration: 1.2,
        smoothWheel: !0,
        touchMultiplier: 2,
        easing: (e) => Math.min(1, 1.001 - Math.pow(2, -10 * e)),
        infinite: !1,
      })),
      lenis.on("scroll", ScrollTrigger.update),
      gsap.ticker.add((e) => lenis.raf(1e3 * e)),
      gsap.ticker.lagSmoothing(0),
      document.querySelectorAll("[data-lenis-scroll]").forEach((e) => {
        function t(e) {
          (o.raf(e), requestAnimationFrame(t));
        }
        const o = new Lenis({
          wrapper: e,
          duration: 0.6,
          smoothWheel: !0,
          touchMultiplier: 2,
          easing: (e) => Math.min(1, 1.001 - Math.pow(2, -10 * e)),
          infinite: !1,
        });
        requestAnimationFrame(t);
      }));
  }
  function initThemeChange() {
    function e(e, o, n) {
      "none" !== getComputedStyle(e).display &&
        t.forEach((t) => {
          const i = t.offsetHeight,
            r = t.getBoundingClientRect().top;
          ScrollTrigger.create({
            trigger: e,
            start: () => `top top+=${r + i / 2}`,
            end: () => `bottom top+=${r + i / 2}`,
            onEnter: () => {
              (t.classList.add(o), t.classList.remove(...n));
            },
            onEnterBack: () => {
              (t.classList.add(o), t.classList.remove(...n));
            },
          });
        });
    }
    const t = document.querySelectorAll("[theme]");
    t.length &&
      (document.querySelectorAll('[bg="color"]').forEach((t) => {
        e(t, "theme_on-dark", ["theme_on-light"]);
      }),
      document.querySelectorAll('[bg="light"]').forEach((t) => {
        e(t, "theme_on-light", ["theme_on-dark"]);
      }),
      document.querySelectorAll('[bg="dark"]').forEach((t) => {
        e(t, "theme_on-dark", ["theme_on-light"]);
      }));
  }
  function initHeaderHide() {
    const e = document.querySelector(".header");
    if (!e) return;
    const t = e.querySelector(".header_bg");
    let o = window.scrollY,
      n = !1,
      i = window.scrollY > 1e3;
    (gsap.set(t, {
      opacity: i ? 1 : 0,
    }),
      ScrollTrigger.create({
        start: "top top",
        end: "max",
        onUpdate: (r) => {
          const a = r.scroll(),
            s = Math.abs(a - o),
            c =
              document.documentElement.scrollHeight - (a + window.innerHeight);
          if (
            (a > 1e3
              ? ((i = !0),
                gsap.to(t, {
                  opacity: 1,
                  duration: durS,
                  ease: "Out",
                }))
              : gsap.to(t, {
                  opacity: 0,
                  duration: durS,
                  ease: "Out",
                }),
            !(s < 40))
          ) {
            if (
              (a > o && i && !n
                ? gsap.to(e, {
                    yPercent: -100,
                    duration: durM,
                    ease: "Out",
                    onComplete: () => (n = !0),
                  })
                : a < o &&
                  n &&
                  gsap.to(e, {
                    yPercent: 0,
                    duration: durM,
                    ease: "Out",
                    onComplete: () => (n = !1),
                  }),
              c <= 160)
            )
              return (
                gsap.to(e, {
                  yPercent: 0,
                  duration: durM,
                  ease: "Out",
                  onComplete: () => (n = !1),
                }),
                void (o = a)
              );
            o = a;
          }
        },
      }));
  }
  function animateTextH(e, t, o) {
    const n = gsap.utils.toArray(e);
    n.length &&
      n.forEach((e, n) => {
        e._split ||
          (e._split = new SplitText(e, {
            type: "words",
            tag: "span",
            wordsClass: "split-word",
            smartWrap: !0,
          }));
        const i = n * stagger * 0.5;
        switch (t) {
          case "reveal":
            gsap.fromTo(
              e._split.words,
              {
                yPercent: gsap.utils.wrap([-150, 75, -75, 150]),
                scale: 0,
                opacity: 0,
              },
              {
                yPercent: 0,
                scale: 1,
                opacity: 1,
                duration: durL,
                delay: (o ?? delayReveal) + i,
                stagger: {
                  each: 0.25 * stagger,
                  from: "random",
                },
                ease: "Out",
                overwrite: !0,
              },
            );
            break;
          case "hide":
            gsap.to(e._split.words, {
              yPercent: gsap.utils.wrap([75, -75, 75, -75]),
              scale: 0,
              opacity: 0,
              duration: durS,
              delay: o ?? 0,
              stagger: {
                each: 0.25 * stagger,
                from: "random",
              },
              ease: "In",
              overwrite: !0,
            });
            break;
          case "initial":
            gsap.set(e._split.words, {
              yPercent: gsap.utils.wrap([-150, 75, -75, 150]),
              scale: 0,
              opacity: 0,
            });
        }
      });
  }
  function animateTextP(e, t, o) {
    const n = gsap.utils.toArray(e);
    n.length &&
      n.forEach((e, n) => {
        e._split ||
          ((e._split = new SplitText(e, {
            type: "lines",
            linesClass: "split-line",
            aria: "none",
          })),
          document.querySelectorAll(".split-line").forEach((e) => {
            "" === e.textContent.trim() &&
              e.replaceWith(document.createElement("br"));
          }));
        const i = n * stagger * 0.25;
        switch (t) {
          case "reveal":
            gsap.fromTo(
              e._split.lines,
              {
                yPercent: 250,
                opacity: 0,
              },
              {
                yPercent: 0,
                opacity: 1,
                duration: durL,
                delay: (o ?? delayReveal) + i,
                stagger: 0.5 * stagger,
                ease: "Out",
                overwrite: !0,
              },
            );
            break;
          case "hide":
            gsap.to(e._split.lines, {
              yPercent: 0,
              opacity: 0,
              duration: durS,
              delay: o ?? 0,
              stagger: 0.5 * stagger,
              ease: "In",
              overwrite: !0,
            });
            break;
          case "initial":
            gsap.set(e._split.lines, {
              yPercent: 0,
              opacity: 0,
            });
        }
      });
  }
  function animateCtn(e, t, o) {
    const n = gsap.utils.toArray(e);
    if (n.length)
      switch (t) {
        case "reveal":
          gsap.fromTo(
            n,
            {
              opacity: 0,
              yPercent: 100,
            },
            {
              opacity: 1,
              yPercent: 0,
              duration: durL,
              delay: o ?? delayReveal,
              stagger: 0.5 * stagger,
              ease: "Out",
              overwrite: !0,
            },
          );
          break;
        case "hide":
          gsap.to(n, {
            opacity: 0,
            yPercent: 0,
            duration: durS,
            delay: o ?? 0,
            stagger: 0.5 * stagger,
            ease: "In",
            overwrite: !0,
          });
          break;
        case "initial":
          gsap.set(n, {
            opacity: 0,
            yPercent: 0,
          });
      }
  }
  function animateLine(e, t, o) {
    const n = gsap.utils.toArray(e);
    if (n.length)
      switch (t) {
        case "reveal":
          gsap.fromTo(
            n,
            {
              clipPath: "inset(0% 100% -1px 0%)",
            },
            {
              clipPath: "inset(0% 0% -1px 0%)",
              duration: durL,
              delay: o ?? delayReveal,
              stagger: stagger,
              ease: "Out",
              overwrite: !0,
            },
          );
          break;
        case "hide":
          gsap.to(n, {
            clipPath: "inset(0% 0% -1px 100%)",
            duration: durS,
            delay: o ?? 0,
            stagger: 0.5 * stagger,
            ease: "In",
            overwrite: !0,
          });
          break;
        case "initial":
          gsap.set(n, {
            clipPath: "inset(0% 0% -1px 100%)",
          });
      }
  }
  function initPlayPauseVideoScroll() {
    gsap.utils.toArray('[data-video="playpause"]').forEach((e) => {
      const t = e.querySelector("video");
      t &&
        (t.load(),
        (t.currentTime = 0),
        ScrollTrigger.create({
          trigger: e,
          start: "top bottom",
          end: "bottom top",
          onEnter: () => t.play().catch(() => {}),
          onEnterBack: () => t.play().catch(() => {}),
          onLeave: () => t.pause(),
          onLeaveBack: () => t.pause(),
        }));
    });
  }
  function handleAnchorOnEnter() {
    const e = sessionStorage.getItem("scrollTo");
    if (!e) return;
    sessionStorage.removeItem("scrollTo");
    const t = document.querySelector(e);
    t &&
      gsap.delayedCall(delayReveal, () => {
        lenis.scrollTo(t, {
          duration: durL,
        });
      });
  }
  function lockScroll() {
    const e = window.innerWidth - document.documentElement.clientWidth;
    (document.documentElement.style.setProperty("--scrollbar-width", `${e}px`),
      (document.body.style.paddingRight = "var(--scrollbar-width)"),
      (document.documentElement.style.overflow = "hidden"),
      lenis.stop());
  }
  function unlockScroll() {
    (document.documentElement.style.removeProperty("--scrollbar-width"),
      (document.body.style.paddingRight = ""),
      (document.documentElement.style.overflow = ""),
      lenis.start());
  }
  function initIndexCounter() {
    const e = document.querySelectorAll("[index-w]");
    e.length &&
      e.forEach((e) => {
        const t = Array.from(e.children);
        let o = 0;
        t.forEach((e) => {
          const t = e.querySelector('[index="text"]');
          if (!t) return;
          o++;
          const n = String(o).padStart(2, "0");
          t.textContent = n;
        });
      });
  }
  function initNextEntityCard() {
    document.querySelectorAll('[next-nav="w"]').forEach((e) => {
      const t = Array.from(e.querySelectorAll("[next-nav]")),
        o = window.location.pathname.split("/").filter(Boolean).pop(),
        n =
          (t.findIndex((e) => e.getAttribute("next-nav") === o) + 1) % t.length;
      t.length <= 1
        ? (e.style.display = "none")
        : (t.forEach((e) => (e.style.display = "none")),
          t[n] && ((t[n].style.display = "block"), ScrollTrigger.refresh()));
    });
  }
  function initOther() {
    const e = document.querySelectorAll(".year");
    if (e.length) {
      const t = new Date().getFullYear();
      e.forEach((e) => {
        e.textContent = t;
      });
    }
    const t = document.querySelectorAll("[first-tag]");
    t.length &&
      t.forEach((e) => {
        const t = e.getAttribute("first-tag");
        if (!t) return;
        const o = document.querySelector(`[tag-list="${t}"]`);
        o && o.insertBefore(e, o.firstChild);
      });
    const o = document.querySelectorAll("[data-last-updated]");
    o.length &&
      o.forEach((e) => {
        const t = e.querySelector("[data-source]"),
          o = e.querySelector("[data-target]");
        t && o && (o.textContent = t.textContent);
      });
    const n = document.querySelector("[data-btn-back]");
    n && listen(n, "click", () => history.back());
    const i = document.querySelector('[data-scroll-trigger="refresh"]');
    if (i) {
      new IntersectionObserver(([e]) => {
        e.isIntersecting && ScrollTrigger.refresh();
      }).observe(i);
    }
    const r = document.querySelectorAll('[data-view-all="w"]');
    r.length &&
      r.forEach((e) => {
        const t = e.querySelectorAll('[data-view-all="item"]'),
          o = e.querySelectorAll('[data-view-all="btn"]');
        o.length &&
          t.length <= 1 &&
          gsap.set(o, {
            display: "none",
          });
      });
    const a = document.querySelector(".news-slider-cms_list");
    if (a) {
      const e = document.querySelector('[floating-tip="drag"]'),
        t = a.querySelectorAll(".news-slider-cms_list_item");
      e && (e.style.visibility = t.length <= 2 ? "hidden" : "visible");
    }
  }
  function initAllParallax() {
    (gsap.utils.toArray('[parallax="img"]').forEach((e) => {
      const t = e.closest('[parallax="w"]');
      t &&
        gsap.fromTo(
          e,
          {
            yPercent: -20,
          },
          {
            yPercent: 20,
            ease: "none",
            scrollTrigger: {
              trigger: t,
              start: "top bottom",
              ease: "none",
              scrub: !0,
            },
          },
        );
    }),
      gsap.utils.toArray('[parallax="img-out"]').forEach((e) => {
        const t = e.closest('[parallax="w"]');
        t &&
          gsap.fromTo(
            e,
            {
              yPercent: -10,
            },
            {
              yPercent: 30,
              ease: "none",
              scrollTrigger: {
                trigger: t,
                start: "top 50%",
                end: "bottom top",
                scrub: !0,
              },
            },
          );
      }),
      gsap.utils.toArray('[parallax="ctn-down"]').forEach((e) => {
        if (!e) return;
        const t = "false" === e.getAttribute("mob"),
          o = window.innerWidth < breakPoint;
        (t && o) ||
          gsap.fromTo(
            e,
            {
              yPercent: -10,
            },
            {
              yPercent: 10,
              ease: "none",
              scrollTrigger: {
                trigger: e,
                start: "top bottom",
                end: "bottom top",
                scrub: !0,
              },
            },
          );
      }),
      gsap.utils.toArray('[parallax="ctn-up"]').forEach((e) => {
        if (!e) return;
        const t = "false" === e.getAttribute("mob"),
          o = window.innerWidth < breakPoint;
        (t && o) ||
          gsap.fromTo(
            e,
            {
              yPercent: 10,
            },
            {
              yPercent: -10,
              ease: "none",
              scrollTrigger: {
                trigger: e,
                start: "top bottom",
                end: "bottom top",
                scrub: !0,
              },
            },
          );
      }),
      gsap.utils.toArray('[parallax="h1"]').forEach((e) => {
        const t = Array.from(e.children);
        0 !== t.length &&
          gsap.fromTo(
            t,
            {
              xPercent: gsap.utils.wrap([5, -1, -5]),
            },
            {
              xPercent: gsap.utils.wrap([-5, 1, 5]),
              ease: "none",
              scrollTrigger: {
                trigger: e,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
              },
            },
          );
      }));
  }
  function initSectionTransition() {
    const e = document.querySelector(".about-s_img");
    if (e) {
      const t = e.querySelector(".img-w");
      gsap.fromTo(
        t,
        {
          scale: 1,
          transformOrigin: "center bottom",
        },
        {
          scale: 1.25,
          ease: "none",
          scrollTrigger: {
            trigger: e,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        },
      );
    }
    const t = document.querySelector(".benefits-w");
    if (t) {
      const e = t.querySelector(".benefits-s_title-w"),
        o = t.querySelector(".benefits-s_title"),
        n = t.querySelector(".benefits-s_scene-intro"),
        i = t.querySelector(".benefits-s_scene-outro"),
        r = t.querySelector(".benefits-s_gap");
      (e &&
        gsap.fromTo(
          e,
          {
            scale: 0,
          },
          {
            scale: 1,
            ease: "InOut",
            scrollTrigger: {
              trigger: r,
              start: "top bottom",
              end: "bottom bottom",
              scrub: !0,
            },
          },
        ),
        gsap.fromTo(
          [o, n],
          {
            opacity: 1,
          },
          {
            opacity: 0,
            ease: "Out",
            scrollTrigger: {
              trigger: i,
              start: "bottom top",
              end: "200% top",
              scrub: !0,
            },
          },
        ));
    }
    (ScrollTrigger.matchMedia({
      [`(min-width: ${breakPoint}px)`]: function () {
        const e = document.querySelector(".benefits-s_cms");
        if (e) {
          const t = e.querySelector(".benefits-cms_list"),
            o = t.querySelectorAll(".benefits-cms_list_item"),
            n = gsap.to(t, {
              xPercent: -100,
              ease: "none",
              scrollTrigger: {
                trigger: e,
                scrub: !0,
                start: "top top",
                end: "bottom bottom",
              },
            });
          o.forEach((e, t) => {
            const o = {
              x: (10 * Math.random() + 20) * (Math.random() < 0.5 ? 1 : -1),
              y: (0 * Math.random() + 5) * (Math.random() < 0.5 ? 1 : -1),
              rotation:
                (5 * Math.random() + 5) * (Math.random() < 0.5 ? 1 : -1),
            };
            gsap.fromTo(
              e,
              {
                rotation: o.rotation,
                xPercent: o.x,
                yPercent: o.y + 75 + (t % 2 == 0 ? 15 : -15),
              },
              {
                rotation: -o.rotation,
                xPercent: -o.x,
                yPercent: -o.y - 75 + (t % 2 == 0 ? -15 : 15),
                ease: "none",
                scrollTrigger: {
                  trigger: e,
                  containerAnimation: n,
                  start: "left 120%",
                  end: "right -20%",
                  scrub: !0,
                },
              },
            );
          });
        }
      },
    }),
      ScrollTrigger.matchMedia({
        [`(min-width: ${breakPoint}px)`]: function () {
          const e = document.querySelector(".footer");
          if (e) {
            const t = e.querySelector(".footer-w"),
              o = e.querySelector(".footer-w_bg");
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: e,
                  start: "top top",
                  end: "bottom bottom",
                  scrub: !0,
                },
              })
              .fromTo(
                t,
                {
                  scale: 2,
                  translateZ: 10,
                  transformOrigin: "center 10%",
                },
                {
                  scale: 1,
                  ease: "none",
                },
              )
              .fromTo(
                o,
                {
                  scale: 0.75,
                  translateZ: 10,
                  transformOrigin: "center 10%",
                },
                {
                  scale: 1,
                  ease: "none",
                },
                "<",
              );
          }
        },
      }));
  }
  function initScrollElementsReveal() {
    const e = document.querySelectorAll('[data-scroll-reveal="h"]');
    e.length &&
      e.forEach((e) => {
        const t = e.closest('[data-scroll-reveal="w"]');
        (animateTextH(e, "initial"),
          gsap.set(e, {
            visibility: "visible",
          }),
          ScrollTrigger.create({
            trigger: t || e,
            start: "top bottom",
            once: !0,
            onEnter: () => {
              animateTextH(e, "reveal", 0);
            },
          }));
      });
    const t = document.querySelectorAll('[data-scroll-reveal="p"]');
    t.length &&
      t.forEach((e) => {
        const t = e.closest('[data-scroll-reveal="w"]');
        (animateTextP(e, "initial"),
          gsap.set(e, {
            visibility: "visible",
          }),
          ScrollTrigger.create({
            trigger: t || e,
            start: "top bottom",
            once: !0,
            onEnter: () => {
              animateTextP(e, "reveal", 0);
            },
          }));
      });
    const o = document.querySelectorAll('[data-scroll-reveal="ctn"]');
    o.length &&
      o.forEach((e) => {
        const t = e.closest('[data-scroll-reveal="w"]');
        (animateCtn(e, "initial"),
          gsap.set(e, {
            visibility: "visible",
          }),
          ScrollTrigger.create({
            trigger: t || e,
            start: "top bottom",
            once: !0,
            onEnter: () => {
              animateCtn(e, "reveal", 0);
            },
          }));
      });
    const n = document.querySelectorAll('[data-scroll-reveal="line"]');
    n.length &&
      n.forEach((e) => {
        const t = e.closest('[data-scroll-reveal="w"]');
        (animateLine(e, "initial"),
          gsap.set(e, {
            visibility: "visible",
          }),
          ScrollTrigger.create({
            trigger: t || e,
            start: "top bottom",
            once: !0,
            onEnter: () => {
              animateLine(e, "reveal", 0);
            },
          }));
      });
    const i = document.querySelectorAll('[data-scroll-reveal="card"]');
    (i.length &&
      i.forEach((e) => {
        const t = e.closest('[data-scroll-reveal="w"]');
        (gsap.set(e, {
          transformPerspective: 1e3,
          visibility: "visible",
        }),
          gsap
            .timeline({
              scrollTrigger: {
                trigger: t || e,
                start: "top bottom",
                toggleActions: "play none none reset",
              },
            })
            .from(e, {
              scale: 0,
              rotateY: -90,
              rotate: -25,
              duration: durL,
              delay: delayReveal,
              ease: "Out",
            }));
      }),
      document.querySelectorAll('[data-slider-reveal="true"]').forEach((e) => {
        const t = Array.from(e.children);
        t.length &&
          (gsap.set(t, {
            visibility: "visible",
          }),
          gsap
            .timeline({
              scrollTrigger: {
                trigger: e,
                start: "top bottom",
                end: "top 80%",
                toggleActions: "play none none none",
              },
            })
            .from(t, {
              opacity: 0,
              xPercent: 50,
              duration: durL,
              delay: delayReveal,
              stagger: stagger,
              ease: "Out",
            }),
          gsap.set(t, {
            visibility: "visible",
          }));
      }));
    const r = document.querySelector("[header]");
    r &&
      (gsap.timeline({}).from(r, {
        yPercent: -100,
        duration: durL,
        ease: "InOut",
      }),
      gsap.set(r, {
        visibility: "visible",
      }));
    const a = document.querySelector("[cookies]");
    a &&
      (gsap.timeline({}).from(a, {
        yPercent: 100,
        duration: durL,
        ease: "InOut",
      }),
      gsap.set(a, {
        visibility: "visible",
      }));
    const s = document.querySelector(".sound-w");
    s &&
      (gsap.from(s, {
        yPercent: 125,
        duration: durL,
        ease: "InOut",
      }),
      gsap.set(s, {
        visibility: "visible",
      }));
  }
  function initHighlightText() {
    const e = Array.from(document.querySelectorAll("[data-highlight-text]"));
    e.length &&
      e.forEach((e) => {
        const t = new SplitText(e, {
          type: "chars",
          smartWrap: !0,
          charsClass: "split-char",
        }).chars;
        if (!t || !t.length) return;
        const o = e.closest("[data-highlight-wrapper]") || e;
        gsap
          .timeline({
            scrollTrigger: {
              trigger: o,
              start: "top 75%",
              end: "bottom 50%",
              scrub: !0,
            },
          })
          .from(t, {
            opacity: 0.1,
            duration: durS,
            ease: "Out",
            stagger: stagger,
          });
      });
  }
  function initMagneticEffect() {
    ScrollTrigger.matchMedia({
      [`(min-width: ${breakPoint}px)`]: function () {
        const e = document.querySelectorAll("[data-magnetic-strength]");
        if (window.innerWidth <= 991) return;
        const t = (e, t) => {
            e &&
              (gsap.killTweensOf(e),
              (t ? gsap.set : gsap.to)(e, {
                x: "0em",
                y: "0em",
                rotate: "0deg",
                clearProps: "all",
                ...(!t && {
                  ease: "elastic.out(1, 0.3)",
                  duration: 1.6,
                }),
              }));
          },
          o = (e) => {
            const o = e.currentTarget;
            (t(o, !0),
              o
                .querySelectorAll("[data-magnetic-inner-target]")
                .forEach((e) => t(e, !0)));
          },
          n = (e) => {
            const t = e.currentTarget,
              o = t.getBoundingClientRect(),
              n = parseFloat(t.getAttribute("data-magnetic-strength")) || 25,
              i = t.querySelectorAll("[data-magnetic-inner-target]"),
              r =
                parseFloat(t.getAttribute("data-magnetic-strength-inner")) || n,
              a = ((e.clientX - o.left) / t.offsetWidth - 0.5) * (n / 16),
              s = ((e.clientY - o.top) / t.offsetHeight - 0.5) * (n / 16);
            (gsap.to(t, {
              x: a + "em",
              y: s + "em",
              rotate: "0.001deg",
              ease: "power4.out",
              duration: 1.6,
            }),
              i.length &&
                i.forEach((n) => {
                  const i =
                      ((e.clientX - o.left) / t.offsetWidth - 0.5) * (r / 16),
                    a = ((e.clientY - o.top) / t.offsetHeight - 0.5) * (r / 16);
                  gsap.to(n, {
                    x: i + "em",
                    y: a + "em",
                    rotate: "0.001deg",
                    ease: "power4.out",
                    duration: 2,
                  });
                }));
          },
          i = (e) => {
            const t = e.currentTarget,
              o = t.querySelectorAll("[data-magnetic-inner-target]");
            (gsap.to(t, {
              x: "0em",
              y: "0em",
              ease: "elastic.out(1, 0.3)",
              duration: 1.6,
              clearProps: "all",
            }),
              o.length &&
                o.forEach((e) => {
                  gsap.to(e, {
                    x: "0em",
                    y: "0em",
                    ease: "elastic.out(1, 0.3)",
                    duration: 2,
                    clearProps: "all",
                  });
                }));
          };
        e.forEach((e) => {
          (listen(e, "mouseenter", o),
            listen(e, "mousemove", n),
            listen(e, "mouseleave", i));
        });
      },
    });
  }
  function initMapPins() {
    ScrollTrigger.matchMedia({
      [`(min-width: ${breakPoint}px)`]: function () {
        function e(e, t, o, n) {
          return Math.sqrt(Math.pow(o - e, 2) + Math.pow(n - t, 2));
        }
        function t(t) {
          const o = t.clientX,
            n = t.clientY;
          i.forEach((t) => {
            const i = t.getBoundingClientRect(),
              s = i.left + i.width / 2,
              c = i.top + i.height / 2,
              l = e(o, n, s, c),
              d = l < a ? r - (l / a) * (r - 1) : 1;
            gsap.to(t, {
              scale: d,
              duration: durL,
              ease: "Out",
            });
          });
        }
        function o() {
          i.forEach((e) => {
            gsap.to(e, {
              scale: 1,
              duration: durL,
              ease: "Out",
            });
          });
        }
        const n = document.querySelector("[map]"),
          i = n?.querySelectorAll("[pin]");
        if (!n || 0 === i.length) return;
        const r = 1.5,
          a = 240;
        (listen(n, "mousemove", t), listen(n, "mouseleave", o));
      },
    });
  }
  function initNavItemHover() {
    ScrollTrigger.matchMedia({
      [`(min-width: ${breakPoint}px)`]: function () {
        document.querySelectorAll("[hover-nav-item]").forEach((e) => {
          function t() {
            (gsap.fromTo(
              i.chars,
              {
                opacity: 1,
                yPercent: 0,
                scale: 1,
              },
              {
                opacity: 0,
                yPercent: -75,
                scale: 0,
                duration: durM,
                ease: "Out",
                stagger: {
                  each: 0.25 * stagger,
                  from: "random",
                },
                overwrite: !0,
              },
            ),
              gsap.fromTo(
                r.chars,
                {
                  opacity: 0,
                  yPercent: 75,
                  scale: 0,
                },
                {
                  opacity: 1,
                  yPercent: 0,
                  scale: 1,
                  duration: durM,
                  delay: delayReveal,
                  ease: "Out",
                  stagger: {
                    each: 0.25 * stagger,
                    from: "random",
                  },
                  overwrite: !0,
                },
              ));
          }
          function o() {
            (gsap.to(i.chars, {
              opacity: 1,
              yPercent: 0,
              scale: 1,
              duration: durM,
              delay: delayReveal,
              ease: "Out",
              stagger: {
                each: 0.25 * stagger,
                from: "random",
              },
              overwrite: !0,
            }),
              gsap.to(r.chars, {
                opacity: 0,
                yPercent: 75,
                scale: 0,
                duration: durM,
                ease: "Out",
                stagger: {
                  each: 0.25 * stagger,
                  from: "random",
                },
                overwrite: !0,
              }));
          }
          const n = e.querySelectorAll("[hover='text']");
          if (n.length < 2) return;
          const i = new SplitText(n[0], {
              type: "chars",
              tag: "span",
              charsClass: "split-char",
              smartWrap: !0,
            }),
            r = new SplitText(n[1], {
              type: "chars",
              tag: "span",
              charsClass: "split-char",
              smartWrap: !0,
            });
          gsap.set(r.chars, {
            yPercent: 75,
            opacity: 0,
            scale: 0,
          });
          const a = e.closest("[hover-nav-item-trigger]") || e;
          (listen(a, "mouseenter", t), listen(a, "mouseleave", o));
        });
      },
    });
  }
  function initMenuItemHover() {
    ScrollTrigger.matchMedia({
      [`(min-width: ${breakPoint}px)`]: function () {
        const e = document.querySelectorAll("[hover-menu-item]");
        e.forEach((t) => {
          (listen(t, "mouseenter", () => {
            e.forEach((e) => {
              e !== t &&
                (gsap.to(e, {
                  opacity: 0.2,
                  duration: durM,
                  ease: "Out",
                  overwrite: !0,
                }),
                gsap.to(t, {
                  opacity: 1,
                  duration: 0.25 * durS,
                  ease: "Out",
                  overwrite: !0,
                }));
            });
          }),
            listen(t, "mouseleave", () => {
              e.forEach((e) => {
                gsap.to(e, {
                  opacity: 1,
                  duration: durS,
                  ease: "Out",
                  overwrite: !0,
                });
              });
            }));
        });
      },
    });
  }
  function initMarquee() {
    document.querySelectorAll("[data-marquee]").forEach((e) => {
      const t = e.querySelectorAll('[data-marquee="list"]');
      if (!t.length) return;
      const o = gsap
        .timeline({
          repeat: -1,
        })
        .to(t, {
          duration: 24,
          xPercent: -100,
          ease: "linear",
        });
      ScrollTrigger.create({
        trigger: e,
        start: "top bottom",
        end: "bottom top",
        onEnter: () => o.play(),
        onLeave: () => o.pause(),
        onEnterBack: () => o.play(),
        onLeaveBack: () => o.pause(),
        onUpdate: (e) => {
          const t = 0.01 * e.getVelocity();
          o.timeScale(1 + t);
        },
      });
    });
  }
  function initBenefitCard() {
    document.querySelectorAll("[hover-benefit-card]").forEach((e) => {
      function t() {
        (gsap.set(e, {
          zIndex: 16,
        }),
          i.classList.add("is-open", "theme_on-dark"),
          gsap.fromTo(
            n,
            {
              display: "block",
              clipPath: "inset(0% 0% 100% 0%)",
              scale: 1.1,
            },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              scale: 1,
              duration: durL,
              ease: "Out",
              overwrite: !0,
            },
          ),
          gsap.to(r, {
            rotate: 90,
            duration: durS,
            ease: "InOut",
            overwrite: !0,
          }),
          animateTextH(a, "reveal"),
          animateTextP(s, "reveal"),
          animateLine(c, "reveal"));
      }
      function o() {
        (gsap.set(e, {
          zIndex: "",
        }),
          i.classList.remove("is-open", "theme_on-dark"),
          gsap.to(n, {
            clipPath: "inset(100% 0% 0% 0%)",
            scale: 0.75,
            duration: durM,
            delay: delayReveal,
            ease: "InOut",
            onComplete: () =>
              gsap.set(n, {
                display: "none",
              }),
            overwrite: !0,
          }),
          gsap.to(r, {
            rotate: 0,
            duration: durS,
            ease: "InOut",
            overwrite: !0,
          }),
          animateTextH(a, "hide"),
          animateTextP(s, "hide"),
          animateLine(c, "hide"));
      }
      const n = e.querySelector("[hover='info']"),
        i = e.querySelector("[hover='name']"),
        r = e.querySelector("[hover='ico-ver']"),
        a = e.querySelectorAll("[hover='h']"),
        s = e.querySelectorAll("[hover='p']"),
        c = e.querySelectorAll("[hover='line']");
      let l = !1;
      (gsap.set(n, {
        display: "none",
      }),
        listen(e, "click", () => {
          l ? (o(), (l = !1)) : (t(), (l = !0));
        }));
    });
  }
  function initAccordion() {
    let e = null;
    document.querySelectorAll("[accordion-btn]").forEach((t) => {
      function o() {
        (gsap.to(r, {
          height: "auto",
          duration: durL,
          ease: "Out",
          onComplete: () => {
            ScrollTrigger.refresh();
          },
        }),
          gsap.fromTo(
            a,
            {
              rotate: 0,
            },
            {
              rotate: 90,
              duration: durM,
              ease: "InOut",
              overwrite: !0,
            },
          ),
          animateTextP(s, "reveal"));
      }
      function n() {
        (gsap.to(r, {
          height: 0,
          duration: durL,
          ease: "Out",
          onComplete: () => {
            ScrollTrigger.refresh();
          },
          overwrite: !0,
        }),
          gsap.to(a, {
            rotate: 180,
            duration: durM,
            ease: "InOut",
            overwrite: !0,
          }),
          animateTextP(s, "hide"));
      }
      const i = t.getAttribute("accordion-btn"),
        r = document.querySelector(`[accordion-desc="${i}"]`),
        a = document.querySelector(`[accordion-icon-ver="${i}"]`),
        s = document.querySelectorAll(`[accordion-paragraph="${i}"]`);
      r &&
        (gsap.set(r, {
          height: 0,
          overflow: "hidden",
        }),
        listen(t, "click", () => {
          (e && e !== t && e.closeFunc(),
            e !== t ? (o(), (e = t)) : (n(), (e = null)));
        }),
        (t.closeFunc = n));
    });
  }
  function initLoadMore() {
    const e = document.querySelectorAll("[data-load-more]");
    e.length &&
      e.forEach((e) => {
        function t() {
          ((d = Array.from(s.children)),
            d.forEach((e, t) => {
              t >= c && (e.style.display = "none");
            }),
            (l = c),
            n(),
            ScrollTrigger.refresh());
        }
        function o() {
          (d.slice(l, l + c).forEach((e) => {
            ((e.style.display = ""),
              gsap.fromTo(
                e,
                {
                  opacity: 0,
                  yPercent: 15,
                },
                {
                  opacity: 1,
                  yPercent: 0,
                  duration: durM,
                  ease: "Out",
                },
              ),
              ScrollTrigger.refresh());
          }),
            (l += c),
            n());
        }
        function n() {
          l >= d.length && (a.style.display = "none");
        }
        const i = e.getAttribute("device"),
          r = window.innerWidth >= breakPoint;
        if ("desk" === i && !r) return;
        if ("mob" === i && r) return;
        const a = e.querySelector('[data-load-more="btn"]'),
          s = e.querySelector('[data-load-more="list"]');
        if (!a || !s) return;
        const c = 4;
        let l = 0,
          d = [];
        (listen(a, "click", o), t());
      });
  }
  function initSlider() {
    const e = gsap.utils.toArray("[slider]");
    e.length &&
      e.forEach((e) => {
        function t() {
          n.$current &&
            n.$total &&
            ((n.$current.textContent = n.current + 1),
            (n.$total.textContent = n.length));
        }
        function o(e) {
          ((n.$slides[n.prev].style.zIndex = 1),
            (n.$slides[n.current].style.zIndex = 2),
            gsap.timeline().fromTo(
              n.$imgs[n.prev],
              {
                scale: 1,
              },
              {
                duration: durL,
                scale: 1.5,
                ease: "Ease",
              },
              "<",
            ),
            gsap
              .timeline()
              .fromTo(
                n.$slides[n.current],
                {
                  clipPath: e ? i : r,
                },
                {
                  clipPath: a,
                  duration: durL,
                  ease: "Ease",
                  onComplete: () => {
                    ((n.$slides[n.prev].style.zIndex = "auto"),
                      (n.$slides[n.current].style.zIndex = 1),
                      (n.animating = !1));
                  },
                },
              )
              .fromTo(
                n.$imgs[n.current],
                {
                  scale: 1.5,
                },
                {
                  scale: 1,
                  duration: durL,
                  ease: "Ease",
                },
                "<",
              ));
        }
        const n = {
          $slides: e.querySelectorAll('[slider="slide"]'),
          $imgs: e.querySelectorAll('[slider="slide"] [slider="img"]'),
          $pag: e.querySelector('[slider="pag"]'),
          $prev: e.querySelector('[slider="prev"]'),
          $next: e.querySelector('[slider="next"]'),
          $current: e.querySelector('[slider="current"]'),
          $total: e.querySelector('[slider="total"]'),
          current: 0,
          prev: null,
          animating: !1,
        };
        if (((n.length = n.$slides.length), !n.length || !n.$prev || !n.$next))
          return;
        if (1 === n.length) return void (n.$pag.style.display = "none");
        const i = "inset(0% 0% 0% 100%)",
          r = "inset(0% 100% 0% 0%)",
          a = "inset(0% 0% 0% 0%)";
        (gsap.set(n.$slides, {
          clipPath: r,
        }),
          gsap.set(n.$slides[n.current], {
            clipPath: a,
          }),
          t(),
          listen(n.$prev, "click", () => {
            n.animating ||
              ((n.animating = !0),
              (n.prev = n.current),
              (n.current = 0 === n.current ? n.length - 1 : n.current - 1),
              t(),
              o(!1));
          }),
          listen(n.$next, "click", () => {
            n.animating ||
              ((n.animating = !0),
              (n.prev = n.current),
              (n.current = n.current === n.length - 1 ? 0 : n.current + 1),
              t(),
              o(!0));
          }));
      });
  }
  function initSliderText() {
    const e = gsap.utils.toArray("[slider-text]");
    e.length &&
      e.forEach((e) => {
        function t() {
          ((a.$slides[a.prev].style.zIndex = 0),
            (a.$slides[a.current].style.zIndex = 1),
            gsap
              .timeline({
                onComplete: () => {
                  ((a.$slides[a.prev].style.zIndex = "auto"),
                    (a.$slides[a.current].style.zIndex = 1),
                    (a.animating = !1));
                },
              })
              .call(() => {
                (animateTextH(a.$headlines[a.prev], "hide", 0),
                  animateTextP(a.$paragraphs[a.prev], "hide", 0));
              }, 0)
              .to(
                a.$circles[a.prev],
                {
                  opacity: 0,
                  scale: 1.25,
                  duration: durS,
                  ease: "In",
                },
                0,
              )
              .set(a.$slides[a.prev], {
                display: "none",
                position: "absolute",
                delay: 0.1,
              })
              .set(a.$slides[a.current], {
                display: "block",
                position: "relative",
              })
              .call(() => {
                (animateTextH(a.$headlines[a.current], "reveal", 0),
                  animateTextP(a.$paragraphs[a.current], "reveal", 0));
              })
              .fromTo(
                a.$circles[a.current],
                {
                  opacity: 0,
                  scale: 0,
                },
                {
                  opacity: 1,
                  scale: 1,
                  duration: durL,
                  ease: "Out",
                },
                "<",
              ));
        }
        function o() {
          a.$current &&
            a.$total &&
            ((a.$current.textContent = a.current + 1),
            (a.$total.textContent = a.length));
        }
        function n() {
          if (!a.$progressLines.length) return;
          const e = a.$progressLines[a.current],
            t = e.r.baseVal.value,
            o = 2 * Math.PI * t;
          ((e.style.strokeDasharray = o),
            (e.style.strokeDashoffset = o),
            gsap.fromTo(
              e,
              {
                strokeDashoffset: o,
              },
              {
                strokeDashoffset: 0,
                duration: a.autoplayDuration - durM,
                ease: "none",
                delay: durM,
              },
            ));
        }
        function i() {
          a.isInViewport &&
            (n(),
            (a.autoplayInterval = setInterval(() => {
              a.animating ||
                ((a.animating = !0),
                (a.prev = a.current),
                (a.current = a.current === a.length - 1 ? 0 : a.current + 1),
                o(),
                t(!0),
                n());
            }, 1e3 * a.autoplayDuration)));
        }
        function r() {
          (a.autoplayInterval &&
            (clearInterval(a.autoplayInterval), (a.autoplayInterval = null)),
            a.$progressLines.length &&
              gsap.killTweensOf(a.$progressLines[a.current]));
        }
        const a = {
          $slides: e.querySelectorAll('[slider="slide"]'),
          $headlines: e.querySelectorAll('[slider="slide"] [slider="ctn"]'),
          $paragraphs: e.querySelectorAll('[slider="slide"] [slider="p"]'),
          $circles: e.querySelectorAll('[slider="slide"] [slider="circle"]'),
          $progressLines: e.querySelectorAll(
            '[slider="slide"] [slider="progress-line"]',
          ),
          $pag: e.querySelector('[slider="pag"]'),
          $prev: e.querySelector('[slider="prev"]'),
          $next: e.querySelector('[slider="next"]'),
          $current: e.querySelector('[slider="current"]'),
          $total: e.querySelector('[slider="total"]'),
          current: 0,
          prev: null,
          animating: !1,
          autoplayDuration: 6,
          autoplayInterval: null,
          isInViewport: !1,
        };
        if (((a.length = a.$slides.length), !a.length || !a.$prev || !a.$next))
          return;
        if (1 === a.length) return void (a.$pag.style.display = "none");
        (gsap.set(a.$slides, {
          display: "none",
          position: "absolute",
        }),
          gsap.set(a.$slides[a.current], {
            display: "block",
            position: "relative",
          }));
        (new IntersectionObserver(
          (e) => {
            e.forEach((e) => {
              e.isIntersecting
                ? ((a.isInViewport = !0), i())
                : ((a.isInViewport = !1), r());
            });
          },
          {
            threshold: 0,
          },
        ).observe(e),
          listen(a.$prev, "click", () => {
            a.animating ||
              (r(),
              (a.animating = !0),
              (a.prev = a.current),
              (a.current = 0 === a.current ? a.length - 1 : a.current - 1),
              o(),
              t(!1),
              i());
          }),
          listen(a.$next, "click", () => {
            a.animating ||
              (r(),
              (a.animating = !0),
              (a.prev = a.current),
              (a.current = a.current === a.length - 1 ? 0 : a.current + 1),
              o(),
              t(!0),
              i());
          }),
          o());
      });
  }
  function initSliderFreemode() {
    document.querySelectorAll("[slider-id]").forEach((e) => {
      const t = e.getAttribute("slider-id"),
        o = e.querySelector(".swiper");
      if (!o) return;
      new Swiper(o, {
        direction: "horizontal",
        freeMode: {
          enabled: !0,
          momentum: !0,
          momentumRatio: 1,
          momentumBounce: !0,
          momentumBounceRatio: 1,
          sticky: !1,
        },
        a11y: {
          enabled: !1,
        },
        slidesPerView: "auto",
        grabCursor: !0,
        mousewheel: {
          forceToAxis: !0,
        },
        navigation: {
          nextEl: `[slider-id="${t}"] [slider="next"]`,
          prevEl: `[slider-id="${t}"] [slider="prev"]`,
        },
        speed: 800,
      });
    });
  }
  function initTabs() {
    const e = document.querySelectorAll("[data-tabs]");
    e.length &&
      e.forEach((e) => {
        const t = e.querySelectorAll("[data-tab-trigger]");
        e.querySelectorAll("[data-tab-content]");
        let o = t[0]?.getAttribute("data-tab-trigger"),
          n = !1;
        (t[0] && t[0].classList.add("is-active"),
          t.forEach((t) => {
            listen(t, "click", () => {
              const i = t.getAttribute("data-tab-trigger");
              if (i === o) return;
              const r = e.querySelector(`[data-tab-trigger="${o}"]`),
                a = e.querySelector(`[data-tab-content="${o}"]`),
                s = e.querySelector(`[data-tab-content="${i}"]`);
              (gsap.killTweensOf([a, s]),
                (n = !0),
                gsap.set(a, {
                  display: "block",
                  position: "absolute",
                  transformOrigin: "top bottom",
                }),
                gsap.set(s, {
                  display: "block",
                  position: "relative",
                  transformOrigin: "top bottom",
                  xPercent: 125,
                  rotate: -15,
                }),
                ScrollTrigger.refresh(),
                gsap.to(a, {
                  xPercent: -125,
                  rotate: 15,
                  duration: durL,
                  ease: "InOut",
                  onComplete: () => {
                    n && (a.style.display = "none");
                  },
                }),
                gsap.to(s, {
                  xPercent: 0,
                  rotate: 0,
                  duration: durL,
                  ease: "InOut",
                  onComplete: () => {
                    n = !1;
                  },
                }),
                r.classList.remove("is-active"),
                t.classList.add("is-active"),
                (o = i));
            });
          }));
      });
  }
  function initTabsHilight() {
    const e = document.querySelectorAll("[data-tabs-hilight]");
    e.length &&
      e.forEach((e) => {
        function t() {
          const t = e.querySelector("[data-tab].is-active");
          t &&
            gsap
              .timeline()
              .to(n, {
                x: t.offsetLeft,
                width: t.offsetWidth,
                duration: durM,
                ease: "InOut",
              })
              .add(() => {
                (o.forEach((e) => e.classList.remove("theme_on-light")),
                  t.classList.add("theme_on-light"));
              }, "<50%");
        }
        const o = e.querySelectorAll("[data-tab]"),
          n = e.querySelector("[data-tab-hilight]");
        o.length &&
          n &&
          (t(),
          o.forEach((e) => {
            listen(e, "click", () => {
              (o.forEach((e) => e.classList.remove("is-active")),
                e.classList.add("is-active"),
                t(e));
            });
          }));
      });
  }
  function initTabsText() {
    const e = document.querySelectorAll("[data-tabs-text]");
    e.length &&
      e.forEach((e) => {
        const t = e.querySelectorAll("[data-tab-trigger]");
        e.querySelectorAll("[data-tab-content]");
        let o = t[0]?.getAttribute("data-tab-trigger"),
          n = !1;
        (t[0] && t[0].classList.add("is-active"),
          t.forEach((t) => {
            listen(t, "click", () => {
              const i = t.getAttribute("data-tab-trigger");
              if (i === o) return;
              const r = e.querySelector(`[data-tab-trigger="${o}"]`),
                a = e.querySelector(`[data-tab-content="${o}"]`),
                s = a.querySelectorAll('[data-content="h"]'),
                c = a.querySelectorAll('[data-content="ctn"]'),
                l = e.querySelector(`[data-tab-content="${i}"]`),
                d = l.querySelectorAll('[data-content="h"]'),
                u = l.querySelectorAll('[data-content="ctn"]');
              (gsap.killTweensOf([a, l]),
                (n = !0),
                gsap
                  .timeline({
                    onComplete: () => {
                      ((n = !1), ScrollTrigger.refresh());
                    },
                  })
                  .call(() => {
                    (animateTextH(s, "hide", 0), animateCtn(c, "hide", 0));
                  })
                  .set(a, {
                    display: "none",
                    position: "absolute",
                    delay: durM,
                  })
                  .set(l, {
                    display: "block",
                    position: "relative",
                  })
                  .call(() => {
                    (animateTextH(d, "reveal", 0), animateCtn(u, "reveal", 0));
                  }),
                r.classList.remove("is-active"),
                t.classList.add("is-active"),
                (o = i));
            });
          }));
      });
  }
  function initSummerWinterSwitcher() {
    function e(e) {
      const t = l.getPointAtLength(e * v);
      return {
        x: t.x,
        y: t.y,
      };
    }
    function t(e) {
      let t = null;
      (e < 0.4 ? (t = "summer") : e > 0.5 && (t = "winter"),
        t !== f &&
          ("summer" === t && g ? g.click() : "winter" === t && p && p.click(),
          (f = t)));
    }
    function o(e) {
      gsap.to(
        {
          progress: y,
        },
        {
          progress: e,
          duration: durM,
          ease: "Ease",
          onUpdate: function () {
            ((y = this.targets()[0].progress), a(y), t(y));
          },
        },
      );
    }
    function n() {
      ((h = !0), (c.style.cursor = "grabbing"));
    }
    function i(o) {
      if (!h) return;
      const n = o.clientX || o.touches?.[0]?.clientX,
        i = o.clientY || o.touches?.[0]?.clientY,
        r = s.getBoundingClientRect(),
        c = n - r.left,
        l = i - r.top;
      let d = 0,
        u = 1 / 0;
      for (let t = 0; t <= 100; t++) {
        const o = t / 100,
          n = e(o),
          i = Math.sqrt(Math.pow(n.x - c, 2) + Math.pow(n.y - l, 2));
        i < u && ((u = i), (d = o));
      }
      ((y = d), a(y), t(y));
    }
    function r() {
      if (!h) return;
      ((h = !1), (c.style.cursor = "grab"));
      o(y < 0.5 ? 0 : 1);
    }
    function a(t) {
      const o = e(t);
      gsap.set(c, {
        cx: o.x,
        cy: o.y,
      });
    }
    const s = document.querySelector("[data-line-animation]");
    if (!s) return;
    const c = s.querySelector("[data-active]"),
      l = s.querySelector("[data-path]"),
      d = s.querySelector("[data-start]"),
      u = s.querySelector("[data-end]"),
      g = document.querySelector("[data-summer-btn]"),
      p = document.querySelector("[data-winter-btn]"),
      m = l.getPointAtLength(0);
    let h = !1,
      y = 0,
      f = null;
    const v = l.getTotalLength();
    (gsap.set(c, {
      cx: m.x,
      cy: m.y,
    }),
      listen(d, "click", () => {
        o(0);
      }),
      listen(u, "click", () => {
        o(1);
      }),
      (c.style.cursor = "grab"),
      (d.style.cursor = "pointer"),
      (u.style.cursor = "pointer"),
      listen(c, "mousedown", n),
      listen(c, "touchstart", n),
      listen(document, "mousemove", i),
      listen(document, "touchmove", i),
      listen(document, "mouseup", r),
      listen(document, "touchend", r));
  }
  function initModalCta() {
    document.querySelectorAll("[modal-cta-open]").forEach((e) => {
      function t() {
        (gsap.set([i, a], {
          display: "block",
        }),
          gsap.fromTo(
            r,
            {
              scale: 0,
              rotateX: -90,
              yPercent: -100,
              rotate: -25,
            },
            {
              scale: 1,
              rotateX: 0,
              yPercent: 0,
              rotate: 0,
              duration: durL,
              ease: "Out",
              overwrite: !0,
            },
          ),
          gsap.fromTo(
            a,
            {
              opacity: 0,
            },
            {
              opacity: 1,
              duration: durL,
              ease: "Out",
              overwrite: !0,
            },
          ),
          animateTextH(s, "reveal"),
          animateCtn(c, "reveal", 0.3),
          animateLine(l, "reveal", 0.3),
          lockScroll());
      }
      function o() {
        (gsap.to(r, {
          scale: 1,
          rotateX: 90,
          yPercent: 200,
          rotate: 25,
          duration: durM,
          ease: "In",
          overwrite: !0,
        }),
          gsap.to(a, {
            opacity: 0,
            duration: durM,
            ease: "In",
            onComplete: () => {
              gsap.set([i, a], {
                display: "none",
              });
            },
            overwrite: !0,
          }),
          unlockScroll());
      }
      const n = e.getAttribute("modal-cta-open"),
        i = document.querySelector(`[modal-cta="${n}"]`),
        r = document.querySelector(`[modal-cta-main="${n}"]`),
        a = document.querySelector(`[modal-cta-over="${n}"]`),
        s = document.querySelectorAll(`[modal-cta-headline="${n}"]`),
        c = document.querySelectorAll(`[modal-cta-container="${n}"]`),
        l = document.querySelectorAll(`[modal-cta-line="${n}"]`),
        d = document.querySelectorAll(`[modal-cta-close="${n}"]`);
      if (!i) return;
      let u = !1;
      (gsap.set(i, {
        display: "none",
      }),
        gsap.set(r, {
          transformPerspective: 1e3,
        }),
        listen(e, "click", () => {
          u || (t(), (u = !0));
        }),
        d.forEach((e) => {
          listen(e, "click", () => {
            u && (o(), (u = !1));
          });
        }));
    });
  }
  function initModalMedia() {
    document.querySelectorAll("[modal-media-open]").forEach((e) => {
      function t() {
        (gsap.set(i, {
          display: "block",
          opacity: 1,
        }),
          r &&
            ((r.src = l),
            (r.muted = !1),
            (r.controls = !1),
            (r.volume = 0.25),
            (r.currentTime = 0),
            r.play().catch(() => {}),
            gsap.fromTo(
              r,
              {
                scale: 2,
              },
              {
                scale: 1,
                duration: durL,
                ease: "Out",
                overwrite: !0,
              },
            )),
          a &&
            gsap.fromTo(
              a,
              {
                scale: 2,
              },
              {
                scale: 1,
                duration: durL,
                ease: "Out",
                overwrite: !0,
              },
            ),
          gsap.fromTo(
            i,
            {
              display: "block",
              "--mask-y": "200%",
              "--mask-size": "100% 400%",
              opacity: 1,
            },
            {
              "--mask-y": "0%",
              "--mask-size": "100% 400%",
              duration: 1.5 * durL,
              ease: "Out",
              overwrite: !0,
            },
          ),
          lockScroll());
      }
      function o() {
        (gsap.to(i, {
          opacity: 0,
          duration: durS,
          ease: "In",
          onComplete: () => {
            (gsap.set(i, {
              display: "none",
            }),
              r && (r.pause(), r.removeAttribute("src"), r.load()));
          },
          overwrite: !0,
        }),
          r &&
            gsap.to(r, {
              scale: 1.25,
              duration: durS,
              ease: "In",
              overwrite: !0,
            }),
          a &&
            gsap.to(a, {
              scale: 1.25,
              duration: durS,
              ease: "In",
              overwrite: !0,
            }),
          unlockScroll());
      }
      const n = e.getAttribute("modal-media-open"),
        i = document.querySelector(`[modal-media="${n}"]`),
        r = document.querySelector(`[modal-media-video="${n}"]`),
        a = document.querySelector(`[modal-media-gallery="${n}"]`),
        s = document.querySelectorAll(`[modal-media-close="${n}"]`);
      if (!i) return;
      let c = !1;
      const l = "/assets/assets.sondaven.com/son-daven.MP4";
      (r && (r.removeAttribute("src"), r.load()),
        gsap.set(i, {
          display: "none",
        }),
        listen(e, "click", () => {
          c || (t(), (c = !0));
        }),
        s.forEach((e) => {
          listen(e, "click", () => {
            c && (o(), (c = !1));
          });
        }));
    });
  }
  function initModalMenu() {
    document.querySelectorAll("[modal-menu-open]").forEach((e) => {
      function t() {
        (c.classList.add("theme_on-dark"),
          u.forEach((e) => e.classList.toggle("d-none")),
          gsap.fromTo(
            i,
            {
              display: "block",
              "--mask-y": "200%",
              "--mask-size": "100% 400%",
              opacity: 1,
            },
            {
              "--mask-y": "0%",
              "--mask-size": "100% 400%",
              duration: 1.5 * durL,
              ease: "Out",
              overwrite: !0,
            },
          ),
          gsap
            .timeline({
              defaults: {
                duration: durM,
                ease: "InOut",
              },
            })
            .to(l, {
              rotate: 45,
              yPercent: 10,
              overwrite: !0,
            })
            .to(
              d,
              {
                rotate: -45,
                yPercent: -10,
                overwrite: !0,
              },
              "<",
            ),
          gsap
            .timeline({
              defaults: {
                duration: durS,
                ease: "InOut",
              },
            })
            .to(g, {
              yPercent: 15,
              overwrite: !0,
            })
            .to(
              m,
              {
                yPercent: -15,
                overwrite: !0,
              },
              "<",
            )
            .to(
              p,
              {
                scaleX: 0,
                overwrite: !0,
              },
              "<",
            )
            .to(g, {
              rotate: 45,
            })
            .to(
              m,
              {
                rotate: -45,
              },
              "<",
            ),
          animateTextH(a, "reveal", 0.4),
          animateCtn(s, "reveal", 0.4),
          lockScroll());
      }
      function o() {
        (c.classList.remove("theme_on-dark"),
          u.forEach((e) => e.classList.toggle("d-none")),
          gsap.to(i, {
            opacity: 0,
            duration: durM,
            ease: "Out",
            delay: 0.4,
            onComplete: () =>
              gsap.set(i, {
                display: "none",
              }),
            overwrite: !0,
          }),
          gsap
            .timeline({
              defaults: {
                duration: durM,
                ease: "InOut",
              },
            })
            .to(l, {
              rotate: 0,
              yPercent: 0,
              overwrite: !0,
            })
            .to(
              d,
              {
                rotate: 0,
                yPercent: 0,
                overwrite: !0,
              },
              "<",
            ),
          gsap
            .timeline({
              defaults: {
                duration: durS,
                ease: "InOut",
              },
            })
            .to(g, {
              rotate: 0,
              overwrite: !0,
            })
            .to(
              m,
              {
                rotate: 0,
                overwrite: !0,
              },
              "<",
            )
            .to(g, {
              yPercent: 0,
            })
            .to(
              p,
              {
                scaleX: 1,
                overwrite: !0,
              },
              "<",
            )
            .to(
              m,
              {
                yPercent: 0,
              },
              "<",
            ),
          animateTextH(a, "hide"),
          animateCtn(s, "hide"),
          unlockScroll());
      }
      const n = e.getAttribute("modal-menu-open"),
        i = document.querySelector(`[modal-menu="${n}"]`),
        r = document.querySelectorAll(`[modal-menu-close="${n}"]`),
        a = document.querySelectorAll(`[modal-menu-headline="${n}"]`),
        s = document.querySelectorAll(`[modal-menu-ctn="${n}"]`),
        c = document.querySelector(".header"),
        l = document.querySelector(".menu-btn_ico_line.top"),
        d = document.querySelector(".menu-btn_ico_line.bot"),
        u = document.querySelectorAll(".menu-btn_label"),
        g = document.querySelector(".mob_menu-btn_ico_line.top"),
        p = document.querySelector(".mob_menu-btn_ico_line.center"),
        m = document.querySelector(".mob_menu-btn_ico_line.bot");
      if (!i) return;
      let h = !1;
      (gsap.set(i, {
        display: "none",
      }),
        listen(e, "click", () => {
          h ? (o(), (h = !1)) : (t(), (h = !0));
        }),
        r.forEach((e) => {
          listen(e, "click", () => {
            h && (o(), (h = !1));
          });
        }));
    });
  }
  function initFloatingTips() {
    ScrollTrigger.matchMedia({
      [`(min-width: ${breakPoint}px)`]: function () {
        function e(e) {
          return (
            e * parseFloat(getComputedStyle(document.documentElement).fontSize)
          );
        }
        function t(e, t, o) {
          (gsap.killTweensOf(e),
            gsap.set(e, {
              display: "flex",
              scale: 2,
              opacity: 1,
              clipPath: "inset(0% 50% 0% 50% round var(--_units---u-24))",
              x: t + a,
              y: o + a,
            }),
            gsap.to(e, {
              scale: 1,
              clipPath: "inset(0% 0% 0% 0% round var(--_units---u-24))",
              duration: durM,
              ease: "Out",
            }));
        }
        function o(e) {
          (gsap.killTweensOf(e),
            gsap.to(e, {
              scale: 0.5,
              opacity: 0,
              clipPath: "inset(0% 0% 0% 0% round var(--_units---u-24))",
              duration: durS,
              ease: "In",
              onComplete: () => {
                e.style.display = "none";
              },
            }));
        }
        function n(e) {
          r.forEach((t) => {
            gsap.to(t, {
              x: e.clientX + a,
              y: e.clientY + a,
              duration: durL,
              ease: "power3",
            });
          });
        }
        const i = {},
          r = new Set();
        document.querySelectorAll("[floating-tip]").forEach((e) => {
          const t = e.getAttribute("floating-tip");
          i[t] = e;
        });
        const a = e(1.388);
        (listen(document, "mousemove", n),
          document.querySelectorAll("[floating-tip-btn]").forEach((e) => {
            const n = e.getAttribute("floating-tip-btn"),
              a = i[n];
            a &&
              (listen(e, "mouseenter", (e) => {
                (r.add(a), t(a, e.clientX, e.clientY));
              }),
              listen(e, "mouseleave", () => {
                (r.delete(a), o(a));
              }));
          }));
      },
    });
  }
  function initScrollVideo() {
    (ScrollTrigger.matchMedia({
      [`(min-width: ${breakPoint}px)`]: function () {
        const e = document.querySelector("[data-scroll-video-container]");
        if (!e) return;
        const t = e.querySelector("[data-scroll-video]"),
          o = t.getContext("2d"),
          n = [],
          i = (e) => {
            ((t.width = t.offsetWidth), (t.height = t.offsetHeight));
            const n = Math.max(t.width / e.width, t.height / e.height),
              i = (t.width - e.width * n) / 2,
              r = (t.height - e.height * n) / 2;
            o.drawImage(e, i, r, e.width * n, e.height * n);
          };
        framesPromise.then((t) => {
          (n.push(...t.filter(Boolean)),
            i(n[0]),
            gsap.to(
              {
                frame: 0,
              },
              {
                frame: n.length - 1,
                snap: "frame",
                ease: "none",
                scrollTrigger: {
                  trigger: e,
                  start: "top top",
                  end: "75% bottom",
                  scrub: 0.25,
                },
                onUpdate() {
                  i(n[Math.round(this.targets()[0].frame)]);
                },
              },
            ));
        });
      },
    }),
      ScrollTrigger.matchMedia({
        [`(min-width: ${breakPoint}px)`]: function () {
          const e = document.querySelector(".hero-scroll-area");
          if (e) {
            const t = e.querySelector(".hero-w"),
              o = e.querySelector(".hero-s"),
              n = e.querySelector(".hero-s_t");
            (gsap.to(n, {
              scrollTrigger: {
                trigger: e,
                start: "top top",
                end: "50% bottom",
                scrub: 0.25,
              },
              yPercent: -100,
              scale: 0.5,
              opacity: 0,
              ease: "none",
            }),
              gsap
                .timeline({
                  scrollTrigger: {
                    trigger: e,
                    start: "70% bottom",
                    end: "bottom bottom",
                    scrub: 1,
                  },
                })
                .to(
                  t,
                  {
                    scale: 0.3,
                    ease: "Out",
                    duration: 1,
                  },
                  0,
                )
                .to(
                  o,
                  {
                    opacity: 0,
                    ease: "Out",
                    duration: 0.33,
                  },
                  0,
                ));
          }
        },
      }));
  }
  function initCanvasEffect(e, t, o = {}) {
    const n = "string" == typeof e ? document.querySelectorAll(e) : [e];
    if (!n.length) return;
    const i = Array.from(n)
      .map((e) => createCanvasInstance(e, t, o))
      .filter(Boolean);
    return {
      destroy: () => i.forEach((e) => e.destroy()),
      loaded: Promise.all(i.map((e) => e.loaded)),
    };
  }
  function createCanvasInstance(e, t, o = {}) {
    if (!e) return null;
    const n = 1.5,
      i = 2,
      r = 1e3 / (o.fps || 60),
      a = {
        ...{
          blur: 0,
          gamma: 1,
          blackPoint: 0,
          whitePoint: 255,
          threshold: 255,
          ySquares: 100,
          xSquares: 100,
          minSquareWidth: "-2%",
          maxSquareWidth: "102%",
          fps: 60,
          x: 0,
          y: 0,
          width: "100%",
          height: "100%",
          bgOpacity: 1,
          fillOpacity: 1,
        },
        ...o,
      },
      s = {
        vertex:
          "\n      attribute vec2 a_position;\n      attribute vec2 a_texCoord;\n      varying vec2 v_texCoord;\n      void main() {\n        gl_Position = vec4(a_position, 0.0, 1.0);\n        v_texCoord = a_texCoord;\n      }\n    ",
        fragment: `\n      precision mediump float;\n      uniform sampler2D u_texture;\n      uniform vec2 u_resolution;\n      uniform vec2 u_texSize;\n      uniform vec2 u_gridSize;\n      uniform float u_minWidth;\n      uniform float u_maxWidth;\n      uniform float u_threshold;\n      uniform float u_gamma;\n      uniform float u_blackPoint;\n      uniform float u_whitePoint;\n      uniform vec3 u_bgColor;\n      uniform vec3 u_fillColor;\n      uniform float u_bgOpacity;\n      uniform float u_fillOpacity;\n      uniform vec4 u_bounds;\n      varying vec2 v_texCoord;\n\n      void main() {\n        vec2 p = gl_FragCoord.xy;\n        vec2 b0 = u_bounds.xy;\n        vec2 b1 = u_bounds.zw;\n\n        if (p.x < b0.x || p.x > b1.x || p.y < b0.y || p.y > b1.y) discard;\n\n        vec2 lc = (p - b0) / (b1 - b0);\n        vec2 cs = 1.0 / u_gridSize;\n        vec2 ci = floor(lc / cs);\n        vec2 cc = (ci + 0.5) * cs;\n\n        vec4 tc = texture2D(u_texture, cc);\n        if (tc.a < 0.01 || (tc.r < 0.01 && tc.g < 0.01 && tc.b < 0.01)) discard;\n\n        vec2 texelSize = 1.0 / u_texSize;\n        vec4 neighbor;\n        ${((
          e,
        ) => {
          let t = "";
          for (let o = -e; o <= e; o++)
            for (let n = -e; n <= e; n++)
              (0 === o && 0 === n) ||
                (t += `\n          neighbor = texture2D(u_texture, cc + vec2(${o.toFixed(1)}, ${n.toFixed(1)}) * texelSize);\n          if (neighbor.a < 0.01 || (neighbor.r < 0.01 && neighbor.g < 0.01 && neighbor.b < 0.01)) {\n            discard;\n          }\n        `);
          return t;
        })(
          i,
        )}\n\n        vec3 rgb = tc.rgb;\n        if (u_gamma != 1.0) rgb = pow(rgb, vec3(u_gamma));\n\n        float range = u_whitePoint - u_blackPoint;\n        if (range != 0.0) {\n          rgb = clamp((rgb * 255.0 - u_blackPoint) / range, 0.0, 1.0);\n        }\n\n        float br = dot(rgb, vec3(0.333)) * tc.a;\n        if (br > u_threshold / 255.0) {\n          gl_FragColor = vec4(u_bgColor, u_bgOpacity);\n          return;\n        }\n\n        vec2 cl = (lc - ci * cs) / cs;\n        float lw = ((1.0 - br) * (u_maxWidth - u_minWidth) + u_minWidth) \n          / (b1.x - b0.x) * u_gridSize.x;\n\n        gl_FragColor = abs(cl.x - 0.5) < lw * 0.5 \n          ? vec4(u_fillColor, u_fillOpacity) \n          : vec4(u_bgColor, u_bgOpacity);\n      }\n    `,
      },
      c = (e, t) =>
        "string" != typeof e
          ? e
          : e.endsWith("%")
            ? (parseFloat(e) / 100) * t
            : e.endsWith("vw")
              ? (parseFloat(e) / 100) *
                q *
                Math.min(window.devicePixelRatio || 1, n)
              : parseFloat(e),
      l = (e) => {
        if (!e) return [0, 0, 0];
        const t = e.replace("#", "").trim(),
          o = 3 === t.length ? t[0] + t[0] + t[1] + t[1] + t[2] + t[2] : t;
        return [
          parseInt(o.slice(0, 2), 16) / 255,
          parseInt(o.slice(2, 4), 16) / 255,
          parseInt(o.slice(4, 6), 16) / 255,
        ];
      },
      d = () => {
        const e = getComputedStyle(document.documentElement);
        return {
          bg: l(
            e.getPropertyValue("--_colors---base-0--100").trim() || "#000000",
          ),
          fill: l(
            e.getPropertyValue("--_colors---base-1000--100").trim() ||
              "#ffffff",
          ),
        };
      },
      u = e.getContext("webgl", {
        alpha: !0,
        antialias: !1,
        premultipliedAlpha: !1,
        preserveDrawingBuffer: !1,
        powerPreference: "high-performance",
      });
    if (!u) return null;
    const g = (e, t) => {
        const o = u.createShader(e);
        return (u.shaderSource(o, t), u.compileShader(o), o);
      },
      p = (e, t) => {
        const o = u.createProgram();
        return (
          u.attachShader(o, e),
          u.attachShader(o, t),
          u.linkProgram(o),
          o
        );
      },
      m = p(g(u.VERTEX_SHADER, s.vertex), g(u.FRAGMENT_SHADER, s.fragment));
    if (!m) return null;
    u.useProgram(m);
    const h = {
        aPos: u.getAttribLocation(m, "a_position"),
        aUV: u.getAttribLocation(m, "a_texCoord"),
        uTex: u.getUniformLocation(m, "u_texture"),
        uRes: u.getUniformLocation(m, "u_resolution"),
        uTexSize: u.getUniformLocation(m, "u_texSize"),
        uGrid: u.getUniformLocation(m, "u_gridSize"),
        uMinW: u.getUniformLocation(m, "u_minWidth"),
        uMaxW: u.getUniformLocation(m, "u_maxWidth"),
        uThr: u.getUniformLocation(m, "u_threshold"),
        uGam: u.getUniformLocation(m, "u_gamma"),
        uBP: u.getUniformLocation(m, "u_blackPoint"),
        uWP: u.getUniformLocation(m, "u_whitePoint"),
        uBg: u.getUniformLocation(m, "u_bgColor"),
        uFill: u.getUniformLocation(m, "u_fillColor"),
        uBgOpacity: u.getUniformLocation(m, "u_bgOpacity"),
        uFillOpacity: u.getUniformLocation(m, "u_fillOpacity"),
        uBounds: u.getUniformLocation(m, "u_bounds"),
      },
      y = (e) => {
        const t = u.createBuffer();
        return (
          u.bindBuffer(u.ARRAY_BUFFER, t),
          u.bufferData(u.ARRAY_BUFFER, e, u.STATIC_DRAW),
          t
        );
      },
      f = {
        position: y(new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])),
        texCoord: y(new Float32Array([0, 1, 1, 1, 0, 0, 1, 0])),
      };
    (u.bindBuffer(u.ARRAY_BUFFER, f.position),
      u.enableVertexAttribArray(h.aPos),
      u.vertexAttribPointer(h.aPos, 2, u.FLOAT, !1, 0, 0),
      u.bindBuffer(u.ARRAY_BUFFER, f.texCoord),
      u.enableVertexAttribArray(h.aUV),
      u.vertexAttribPointer(h.aUV, 2, u.FLOAT, !1, 0, 0),
      u.enable(u.BLEND),
      u.blendFunc(u.SRC_ALPHA, u.ONE_MINUS_SRC_ALPHA),
      u.pixelStorei(u.UNPACK_FLIP_Y_WEBGL, !0),
      u.pixelStorei(u.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !1),
      u.activeTexture(u.TEXTURE0),
      u.uniform1i(h.uTex, 0));
    const v = d();
    (u.uniform3fv(h.uBg, v.bg), u.uniform3fv(h.uFill, v.fill));
    const b = new Float32Array(16);
    b.fill(NaN);
    let S = null,
      w = 0,
      x = !1,
      P = [],
      E = 0,
      T = 0,
      q = e.offsetWidth;
    const k = new ResizeObserver((t) => {
      const o = t[0];
      if (!o) return;
      const i = Math.min(window.devicePixelRatio || 1, n),
        r = Math.round(o.contentRect.width * i),
        a = Math.round(o.contentRect.height * i);
      (e.width === r && e.height === a) ||
        ((e.width = r),
        (e.height = a),
        (E = r),
        (T = a),
        (q = o.contentRect.width),
        u.viewport(0, 0, r, a),
        u.uniform2f(h.uRes, r, a),
        b.fill(NaN),
        x && W());
    });
    k.observe(e);
    const A = Math.min(window.devicePixelRatio || 1, n);
    ((E = Math.round(e.offsetWidth * A)),
      (T = Math.round(e.offsetHeight * A)),
      (e.width = E),
      (e.height = T),
      u.viewport(0, 0, E, T),
      u.uniform2f(h.uRes, E, T));
    const _ = new IntersectionObserver(
      (e) => {
        const t = x;
        if (((x = e[0].isIntersecting), t !== x)) {
          for (let e = 0; e < P.length; e++) {
            const t = P[e];
            "video" === t.type &&
              (x
                ? t.el.paused && t.el.play().catch(() => {})
                : t.el.paused || t.el.pause());
          }
          x ? B() : (S && cancelAnimationFrame(S), (S = null));
        }
      },
      {
        threshold: 0.01,
        rootMargin: "20% 0px 20% 0px",
      },
    );
    _.observe(e);
    const O = () => {
        const e = u.createTexture();
        return (
          u.bindTexture(u.TEXTURE_2D, e),
          u.texParameteri(u.TEXTURE_2D, u.TEXTURE_WRAP_S, u.CLAMP_TO_EDGE),
          u.texParameteri(u.TEXTURE_2D, u.TEXTURE_WRAP_T, u.CLAMP_TO_EDGE),
          u.texParameteri(u.TEXTURE_2D, u.TEXTURE_MIN_FILTER, u.LINEAR),
          u.texParameteri(u.TEXTURE_2D, u.TEXTURE_MAG_FILTER, u.LINEAR),
          e
        );
      },
      L = (e) =>
        new Promise((t) => {
          const o = new Image();
          ((o.crossOrigin = "anonymous"), (o.decoding = "async"));
          let n = !1;
          ((o.onload = () => {
            const n = O();
            (u.texImage2D(u.TEXTURE_2D, 0, u.RGBA, u.RGBA, u.UNSIGNED_BYTE, o),
              t({
                type: "image",
                el: o,
                tex: n,
                config: e.config || {},
                width: o.width,
                height: o.height,
              }));
          }),
            (o.onerror = () => {
              if (!n)
                return ((n = !0), (o.crossOrigin = null), void (o.src = e.src));
              t(null);
            }),
            (o.src = e.src));
        }),
      M = () =>
        Promise.all(t.map((e) => ("image" === e.type ? L(e) : I(e)))).then(
          (e) => e.filter(Boolean),
        ),
      $ = (e, t) => {
        const o = [];
        if (Array.isArray(t.sources))
          o.push(
            ...t.sources
              .filter((e) => e?.src)
              .map((e) => ({
                src: e.src,
                type: e.type || "",
              })),
          );
        else if (t.src) {
          const e = t.src.includes(".webm"),
            n = t.src.includes(".mp4") ? "video/mp4" : e ? "video/webm" : "";
          if (e) {
            const e = t.src.replace(/\.webm(\?.*)?$/i, ".mp4$1");
            e !== t.src &&
              o.push({
                src: e,
                type: "video/mp4",
              });
          }
          o.push({
            src: t.src,
            type: n,
          });
        }
        ((e.innerHTML = ""),
          o.forEach(({ src: t, type: o }) => {
            const n = document.createElement("source");
            ((n.src = t), o && (n.type = o), e.appendChild(n));
          }));
      },
      I = (e) =>
        new Promise((t) => {
          const o = document.createElement("video");
          ((o.crossOrigin = "anonymous"),
            (o.muted = !0),
            (o.autoplay = !1),
            (o.loop = !1 !== e.loop),
            (o.playsInline = !0),
            (o.preload = "auto"),
            ["muted", "playsinline", "webkit-playsinline"].forEach((e) =>
              o.setAttribute(e, ""),
            ),
            $(o, e));
          const n = O();
          let i = !1;
          const r = {
              type: "video",
              el: o,
              tex: n,
              config: e.config || {},
              isReady: () => i,
              width: 1920,
              height: 1080,
              lastVideoTime: -1,
            },
            a = () => {
              !i &&
                o.readyState >= o.HAVE_CURRENT_DATA &&
                ((i = !0),
                (r.width = o.videoWidth || 1920),
                (r.height = o.videoHeight || 1080),
                u.bindTexture(u.TEXTURE_2D, n),
                u.texImage2D(
                  u.TEXTURE_2D,
                  0,
                  u.RGBA,
                  u.RGBA,
                  u.UNSIGNED_BYTE,
                  o,
                ),
                x && o.play().catch(() => {}),
                t(r));
            },
            s = () => {
              i || ((i = !0), t(r));
            };
          (listen(o, "loadeddata", a),
            listen(o, "canplay", a),
            listen(o, "error", s),
            o.load(),
            setTimeout(() => {
              i || ((i = !0), t(r));
            }, 5e3));
        }),
      C = (e) => {
        if (!e.isReady() || e.el.readyState < e.el.HAVE_CURRENT_DATA) return;
        const t = e.el.currentTime;
        if (t !== e.lastVideoTime) {
          e.lastVideoTime = t;
          try {
            u.texSubImage2D(
              u.TEXTURE_2D,
              0,
              0,
              0,
              u.RGBA,
              u.UNSIGNED_BYTE,
              e.el,
            );
          } catch (t) {
            try {
              u.texImage2D(
                u.TEXTURE_2D,
                0,
                u.RGBA,
                u.RGBA,
                u.UNSIGNED_BYTE,
                e.el,
              );
            } catch (e) {}
          }
        }
      },
      R = (e) => {
        const t = e.config;
        (u.bindTexture(u.TEXTURE_2D, e.tex), "video" === e.type && C(e));
        const o = "video" === e.type ? e.el.videoWidth || 1920 : e.width,
          n = "video" === e.type ? e.el.videoHeight || 1080 : e.height;
        (b[0] === o && b[1] === n) ||
          ((b[0] = o), (b[1] = n), u.uniform2f(h.uTexSize, o, n));
        const i = void 0 !== t.xSquares ? t.xSquares : a.xSquares,
          r = void 0 !== t.ySquares ? t.ySquares : a.ySquares;
        (b[2] === i && b[3] === r) ||
          ((b[2] = i), (b[3] = r), u.uniform2f(h.uGrid, i, r));
        const s = c(void 0 !== t.x ? t.x : a.x, E),
          l = c(void 0 !== t.y ? t.y : a.y, T),
          d = c(void 0 !== t.width ? t.width : a.width, E),
          g = c(void 0 !== t.height ? t.height : a.height, T),
          p = d / i,
          m = c(
            void 0 !== t.minSquareWidth ? t.minSquareWidth : a.minSquareWidth,
            p,
          ),
          y = c(
            void 0 !== t.maxSquareWidth ? t.maxSquareWidth : a.maxSquareWidth,
            p,
          );
        (b[4] === m && b[5] === y) ||
          ((b[4] = m),
          (b[5] = y),
          u.uniform1f(h.uMinW, m),
          u.uniform1f(h.uMaxW, y));
        const f = void 0 !== t.threshold ? t.threshold : a.threshold,
          v = void 0 !== t.gamma ? t.gamma : a.gamma,
          S = void 0 !== t.blackPoint ? t.blackPoint : a.blackPoint,
          w = void 0 !== t.whitePoint ? t.whitePoint : a.whitePoint,
          x = void 0 !== t.bgOpacity ? t.bgOpacity : a.bgOpacity,
          P = void 0 !== t.fillOpacity ? t.fillOpacity : a.fillOpacity;
        (b[6] !== f && ((b[6] = f), u.uniform1f(h.uThr, f)),
          b[7] !== v && ((b[7] = v), u.uniform1f(h.uGam, v)),
          b[8] !== S && ((b[8] = S), u.uniform1f(h.uBP, S)),
          b[9] !== w && ((b[9] = w), u.uniform1f(h.uWP, w)),
          b[10] !== x && ((b[10] = x), u.uniform1f(h.uBgOpacity, x)),
          b[11] !== P && ((b[11] = P), u.uniform1f(h.uFillOpacity, P)));
        const q = T - l - g,
          k = s + d,
          A = q + g;
        ((b[12] === s && b[13] === q && b[14] === k && b[15] === A) ||
          ((b[12] = s),
          (b[13] = q),
          (b[14] = k),
          (b[15] = A),
          u.uniform4f(h.uBounds, s, q, k, A)),
          u.drawArrays(u.TRIANGLE_STRIP, 0, 4));
      },
      W = () => {
        if (P.length && x) {
          (u.clearColor(0, 0, 0, 0), u.clear(u.COLOR_BUFFER_BIT), b.fill(NaN));
          for (let e = 0; e < P.length; e++) {
            const t = P[e];
            ("video" !== t.type || t.isReady()) && R(t, e);
          }
        }
      },
      F = (e) => {
        (e - w >= r && ((w = e), x && W()), (S = requestAnimationFrame(F)));
      },
      B = () => {
        (S && cancelAnimationFrame(S), (w = 0), (S = requestAnimationFrame(F)));
      };
    return {
      destroy: () => {
        (S && cancelAnimationFrame(S), k.disconnect(), _.disconnect());
        for (let e = 0; e < P.length; e++) {
          const t = P[e];
          (t.tex && u.deleteTexture(t.tex),
            "video" === t.type &&
              (t.el.pause(),
              t.el.removeAttribute("src"),
              (t.el.innerHTML = ""),
              t.el.load()));
        }
        (u.deleteBuffer(f.position),
          u.deleteBuffer(f.texCoord),
          u.deleteProgram(m),
          (P = []));
      },
      loaded: M().then((e) => {
        ((P = e), B());
      }),
    };
  }
  function initSceneManager() {
    function e(e, t) {
      const o = document.querySelectorAll(e);
      o.length &&
        o.forEach((o, n) => {
          const a = o.dataset.sceneId || `${e}-${n}`;
          o.dataset.sceneId = a;
          const s = t(o);
          (i.set(a, s), s?.loaded && r.push(s.loaded));
        });
    }
    function t(e) {
      const t = r.length;
      if (!t) return;
      let o = 0;
      r.forEach((n) => {
        n.then(() => e(++o, t));
      });
    }
    function o() {
      return Promise.all(r);
    }
    function n() {
      (i.forEach((e) => {
        e?.destroy && e.destroy();
      }),
        i.clear());
    }
    const i = new Map(),
      r = [];
    return {
      init: e,
      destroy: n,
      ready: o,
      progress: t,
    };
  }
  function initSceneHeroOver() {
    if (!globalSceneManager) return;
    const e = globalSceneManager,
      t = window.innerWidth >= breakPoint,
      o = t ? 33.33 : 66.66;
    e.init("[data-intro-over-scene]", (e) => {
      const n = [
          {
            type: "image",
            src: "/assets/cdn.prod.website-files.com/6940a0abd735a1e3a640d042/697bfe61104a60fa63e1f7b2_19804f2b1c9ceedd0cd04ed721b36ef6_intro_mauntain.avif",
            config: {
              x: "0%",
              y: "40%",
              width: "100%",
              height: "60%",
              blackPoint: 25,
              whitePoint: 200,
              threshold: 255,
              bgOpacity: 1,
              fillOpacity: 1,
            },
          },
          {
            type: "image",
            src: "/assets/cdn.prod.website-files.com/6940a0abd735a1e3a640d042/697e2b5ea694ae5f751655ec_95efa55632b52e963bc2cbf7f0447122_hero_hay.avif",
            config: {
              x: "56%",
              y: "66%",
              width: "14%",
              height: "12%",
              blackPoint: 25,
              whitePoint: 200,
              threshold: 255,
              bgOpacity: 1,
              fillOpacity: 1,
            },
          },
          {
            type: "video",
            skip: !t,
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/hero_tree-c.mp4",
                type: "video/mp4",
              },
            ],
            config: {
              x: "70%",
              y: "42%",
              width: "43.5%",
              height: "52%",
              blackPoint: 55,
              whitePoint: 175,
              threshold: 255,
              ySquares: 100,
              xSquares: 150,
              bgOpacity: 1,
              fillOpacity: 1,
            },
          },
          {
            type: "video",
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/hero_sheeps-c.mp4",
                type: "video/mp4",
              },
            ],
            config: {
              x: "0%",
              y: "72%",
              width: "72%",
              height: "32%",
              blackPoint: 15,
              whitePoint: 255,
              threshold: 255,
              ySquares: 150,
              xSquares: 200,
              bgOpacity: 1,
              fillOpacity: 1,
            },
          },
          {
            type: "video",
            skip: !t,
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/claudes_02.mp4",
                type: "video/mp4",
              },
            ],
            config: {
              x: "5%",
              y: "25%",
              width: "65%",
              height: "45vw",
              blackPoint: 25,
              whitePoint: 255,
              threshold: 255,
              bgOpacity: 1,
              fillOpacity: 1,
            },
          },
          {
            type: "video",
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/birds_04.hevc.mp4",
                type: "video/mp4",
              },
            ],
            config: {
              x: -1 * o + "%",
              y: "30%",
              width: `${o}%`,
              height: `${o}vw`,
              blackPoint: 255,
              whitePoint: 0,
              threshold: 255,
              bgOpacity: 1,
              fillOpacity: 1,
            },
          },
        ],
        i = initCanvasEffect(
          e,
          n.filter((e) => !e.skip),
        ),
        r = gsap
          .timeline({
            scrollTrigger: {
              trigger: e,
              start: "50% bottom",
              end: "bottom top",
              scrub: !0,
            },
          })
          .to(
            n[0].config,
            {
              blackPoint: 45,
              whitePoint: 175,
              ease: "none",
            },
            0,
          )
          .to(
            n[1].config,
            {
              blackPoint: 75,
              whitePoint: 150,
              ease: "none",
            },
            0,
          ),
        a = t
          ? gsap
              .timeline({
                scrollTrigger: {
                  trigger: e,
                  start: "top bottom",
                  end: "bottom 50%",
                  scrub: !0,
                },
              })
              .to(
                n[4].config,
                {
                  x: "-30%",
                  ease: "none",
                },
                0,
              )
          : null,
        s = gsap
          .timeline({
            paused: !0,
          })
          .to(
            n[5].config,
            {
              x: "100%",
              duration: 5,
              ease: "none",
              delay: 5,
              repeat: -1,
              repeatDelay: 5,
            },
            0,
          ),
        c = new IntersectionObserver(
          (e) => {
            e.forEach((e) => {
              e.isIntersecting
                ? s.paused() && s.play()
                : s.paused() || s.pause();
            });
          },
          {
            threshold: 0.01,
            rootMargin: "20% 0px 20% 0px",
          },
        );
      return (
        c.observe(e),
        {
          destroy: () => {
            (r.scrollTrigger?.kill(),
              r.kill(),
              a?.scrollTrigger?.kill(),
              a?.kill(),
              s.kill(),
              c.disconnect(),
              i?.destroy());
          },
          loaded: i?.loaded,
        }
      );
    });
  }
  function initSceneHeroBg() {
    if (window.innerWidth < breakPoint) return;
    if (!globalSceneManager) return;
    globalSceneManager.init("[data-intro-bg-scene]", (e) => {
      const t = [
          {
            type: "image",
            src: "/assets/cdn.prod.website-files.com/6940a0abd735a1e3a640d042/697c00f3737120e569370c7a_98c738340828600251b32ef432d3de26_hero_mauntain-bg.avif",
            config: {
              x: "0%",
              y: "45%",
              width: "100%",
              height: "60%",
              blackPoint: 0,
              whitePoint: 255,
              threshold: 255,
              bgOpacity: 1,
              fillOpacity: 1,
            },
          },
          {
            type: "video",
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/claudes_03.mp4",
                type: "video/mp4",
              },
            ],
            config: {
              x: "30%",
              y: "0%",
              width: "65%",
              height: "45vw",
              blackPoint: 25,
              whitePoint: 255,
              threshold: 255,
              bgOpacity: 1,
              fillOpacity: 1,
            },
          },
          {
            type: "video",
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/birds_03.hevc.mp4",
                type: "video/mp4",
              },
            ],
            config: {
              x: "-33.33%",
              y: "0%",
              width: "33.33%",
              height: "33.33vw",
              blackPoint: 255,
              whitePoint: 0,
              threshold: 255,
              bgOpacity: 1,
              fillOpacity: 1,
            },
          },
        ],
        o = initCanvasEffect(e, t),
        n = gsap
          .timeline({
            scrollTrigger: {
              trigger: e,
              start: "top bottom",
              end: "bottom 50%",
              scrub: !0,
            },
          })
          .to(
            t[1].config,
            {
              x: "60%",
              ease: "none",
            },
            0,
          ),
        i = gsap
          .timeline({
            paused: !0,
          })
          .to(
            t[2].config,
            {
              x: "100%",
              duration: 5,
              ease: "none",
              repeat: -1,
              repeatDelay: 5,
            },
            0,
          ),
        r = new IntersectionObserver(
          (e) => {
            e.forEach((e) => {
              e.isIntersecting
                ? i.paused() && i.play()
                : i.paused() || i.pause();
            });
          },
          {
            threshold: 0.01,
            rootMargin: "20% 0px 20% 0px",
          },
        );
      return (
        r.observe(e),
        {
          destroy: () => {
            (n.scrollTrigger?.kill(),
              n.kill(),
              i.kill(),
              r.disconnect(),
              o?.destroy());
          },
          loaded: o?.loaded,
        }
      );
    });
  }
  function initSceneProlog() {
    if (window.innerWidth < breakPoint) return;
    if (!globalSceneManager) return;
    const e = {
        desk: {
          width: 44,
          leftX: -14,
          rightX: 70,
        },
        mob: {
          width: 88,
          leftX: -25.5,
          rightX: 37.5,
        },
      },
      t = () => window.innerWidth >= breakPoint,
      o = () => (t() ? e.desk.width : e.mob.width),
      n = () => (t() ? e.desk.leftX : e.mob.leftX),
      i = () => (t() ? e.desk.rightX : e.mob.rightX);
    globalSceneManager.init("[data-prolog-scene]", (e) =>
      initCanvasEffect(e, [
        {
          type: "video",
          sources: [
            {
              src: "/assets/assets.sondaven.com/scenes/prolog-l-c.mp4",
              type: "video/mp4",
            },
          ],
          loop: !1,
          config: {
            x: `${n()}%`,
            y: "3%",
            width: `${o()}%`,
            height: "96%",
            blackPoint: 200,
            whitePoint: 25,
            threshold: 255,
            ySquares: 150,
            xSquares: 125,
            bgOpacity: 1,
            fillOpacity: 1,
          },
        },
        {
          type: "video",
          sources: [
            {
              src: "/assets/assets.sondaven.com/scenes/prolog-r-c.mp4",
              type: "video/mp4",
            },
          ],
          loop: !1,
          config: {
            x: `${i()}%`,
            y: "3%",
            width: `${o()}%`,
            height: "96%",
            blackPoint: 200,
            whitePoint: 25,
            threshold: 255,
            ySquares: 150,
            xSquares: 125,
            bgOpacity: 1,
            fillOpacity: 1,
          },
        },
      ]),
    );
  }
  function initSceneAbout() {
    if (window.innerWidth < breakPoint) return;
    if (!globalSceneManager) return;
    const e = globalSceneManager,
      t = window.innerWidth >= breakPoint ? 33.33 : 100;
    e.init("[data-about-scene]", (e) => {
      const o = [
          {
            type: "video",
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/birds_02-c.mp4",
                type: "video/mp4",
              },
            ],
            config: {
              x: -1 * t + "%",
              y: "10%",
              width: `${t}%`,
              height: `${t}vw`,
              blackPoint: 255,
              whitePoint: 0,
              threshold: 255,
              bgOpacity: 1,
              fillOpacity: 1,
            },
          },
          {
            type: "video",
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/about_stork-c.mp4",
                type: "video/mp4",
              },
            ],
            config: {
              x: "45%",
              y: "65%",
              width: "40%",
              height: "36vw",
              blackPoint: 160,
              whitePoint: 0,
              threshold: 255,
              bgOpacity: 1,
              fillOpacity: 1,
            },
          },
        ],
        n = gsap
          .timeline({
            paused: !0,
          })
          .to(o[0].config, {
            x: "100%",
            duration: 5,
            ease: "none",
            repeat: -1,
            repeatDelay: 5,
          })
          .to(
            o[1].config,
            {
              x: "-40%",
              y: "0%",
              duration: 6,
              ease: "none",
              delay: 4,
              repeat: -1,
              repeatDelay: 6,
            },
            "<",
          ),
        i = initCanvasEffect(e, o),
        r = new IntersectionObserver(
          (e) => {
            e.forEach((e) => {
              e.isIntersecting
                ? n.paused() && n.play()
                : n.paused() || n.pause();
            });
          },
          {
            threshold: 0.01,
            rootMargin: "20% 0px 20% 0px",
          },
        );
      return (
        r.observe(e),
        {
          destroy: () => {
            (n.kill(), r.disconnect(), i?.destroy());
          },
          loaded: i?.loaded,
        }
      );
    });
  }
  function initSceneSeasons() {
    if (window.innerWidth < breakPoint) return;
    if (!globalSceneManager) return;
    globalSceneManager.init("[data-seasons-scene]", (e) => {
      const t = e.closest("[data-tabs-text]");
      if (!t) return;
      const o = t.querySelector('[data-tab-trigger="summer"]'),
        n = t.querySelector('[data-tab-trigger="winter"]'),
        i = [
          {
            type: "video",
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/seasons_summer.mp4",
                type: "video/mp4",
              },
            ],
            config: {
              x: "16%",
              y: "0%",
              width: "84%",
              height: "100%",
              blackPoint: 0,
              whitePoint: 255,
              threshold: 255,
              bgOpacity: 1,
              fillOpacity: 0,
            },
          },
          {
            type: "video",
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/seasons_winter.mp4",
                type: "video/mp4",
              },
            ],
            config: {
              x: "4%",
              y: "-8%",
              width: "50%",
              height: "100%",
              blackPoint: 0,
              whitePoint: 1,
              threshold: 255,
              bgOpacity: 1,
              fillOpacity: 0,
            },
          },
        ],
        r = initCanvasEffect(e, i),
        a = () => {
          (gsap.to(i[0].config, {
            blackPoint: 0,
            whitePoint: 255,
            duration: durL,
          }),
            gsap.to(i[1].config, {
              blackPoint: 254,
              whitePoint: 255,
              duration: durL,
            }));
        },
        s = () => {
          (gsap.to(i[0].config, {
            blackPoint: 254,
            whitePoint: 255,
            duration: durL,
          }),
            gsap.to(i[1].config, {
              blackPoint: 25,
              whitePoint: 150,
              duration: durL,
            }));
        },
        c = () => {
          o?.classList.contains("is-active")
            ? a()
            : n?.classList.contains("is-active") && s();
        };
      return (
        listen(o, "click", a),
        listen(n, "click", s),
        c(),
        {
          destroy: () => {
            (o.removeEventListener("click", a),
              n.removeEventListener("click", s),
              r?.destroy());
          },
          loaded: r?.loaded,
        }
      );
    });
  }
  function initSceneBenefitsIntro() {
    if (!globalSceneManager) return;
    const e = {
        desk: {
          initial: 128,
          final: 189.44,
        },
        mob: {
          initial: 100,
          final: 156,
        },
      },
      t = {
        desk: {
          initial: 30,
          final: 230,
        },
        mob: {
          initial: 15,
          final: 215,
        },
      },
      o = () => window.innerWidth >= breakPoint,
      n = () => (o() ? e.desk.initial : e.mob.initial),
      i = () => (o() ? e.desk.final : e.mob.final),
      r = () => (o() ? t.desk.initial : t.mob.initial),
      a = () => (o() ? t.desk.final : t.mob.final);
    globalSceneManager.init("[data-benefits-intro-scene]", (e) => {
      const t = [
          {
            type: "image",
            src: "/assets/cdn.prod.website-files.com/6940a0abd735a1e3a640d042/697656035b94c920c471d4de_ac179cd8d062e41260b178efc691b568_benefits-intro_hole.avif",
            config: {
              x: "0%",
              y: "0%",
              width: "100%",
              height: `${n()}%`,
              gamma: 1,
              blackPoint: 10,
              whitePoint: 225,
              threshold: 255,
              bgOpacity: 0,
              fillOpacity: 1,
            },
          },
          {
            type: "video",
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/benefits-intro_persons-cc.mp4",
                type: "video/mp4",
              },
            ],
            config: {
              x: `${r()}%`,
              y: "10%",
              width: "81%",
              height: "116%",
              blackPoint: 25,
              whitePoint: 200,
              threshold: 255,
              ySquares: 136,
              xSquares: 136,
              bgOpacity: 1,
              fillOpacity: 1,
            },
          },
          {
            type: "video",
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/benefits-intro_birds-c.mp4",
                type: "video/mp4",
              },
            ],
            config: {
              x: "-4%",
              y: "40%",
              width: "60%",
              height: "72%",
              blackPoint: 255,
              whitePoint: 75,
              threshold: 255,
              ySquares: 136,
              xSquares: 136,
              bgOpacity: 1,
              fillOpacity: 1,
            },
          },
        ],
        o = gsap
          .timeline({
            scrollTrigger: {
              trigger: e,
              start: "bottom bottom",
              end: "bottom -50%",
              scrub: !0,
              onRefresh: (e) => {
                e.progress > 0 && o.progress(e.progress);
              },
              invalidateOnRefresh: !0,
            },
          })
          .to(
            t[0].config,
            {
              x: "-25%",
              y: "-30%",
              width: "148%",
              height: `${i()}%`,
              blackPoint: 0,
              whitePoint: 1,
              ease: "InOut",
            },
            0,
          )
          .to(
            t[1].config,
            {
              x: `${a()}%`,
              y: "-50%",
              width: "324%",
              height: "464%",
              ease: "In",
            },
            "<",
          )
          .to(
            t[2].config,
            {
              x: "-204%",
              y: "-20%",
              width: "240%",
              height: "288%",
              ease: "In",
            },
            "<",
          ),
        s = initCanvasEffect(e, t);
      return (
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        }),
        {
          destroy: () => {
            (o.scrollTrigger?.kill(), o.kill(), s?.destroy());
          },
          loaded: s?.loaded,
        }
      );
    });
  }
  function initSceneBenefitsOutro() {
    if (window.innerWidth < breakPoint) return;
    if (!globalSceneManager) return;
    const e = globalSceneManager,
      t = window.innerWidth >= breakPoint ? 33.33 : 100;
    e.init("[data-benefits-outro-scene]", (e) => {
      const o = [
          {
            type: "video",
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/benefits-outro_sheeps.mp4",
                type: "video/mp4",
              },
            ],
            config: {
              x: "-8%",
              y: "55%",
              width: "68%",
              height: "50%",
              blackPoint: 256,
              whitePoint: 255,
              threshold: 255,
              xSquares: 150,
              ySquares: 50,
              bgOpacity: 0,
              fillOpacity: 1,
            },
          },
          {
            type: "video",
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/birds_05-c.mp4",
                type: "video/mp4",
              },
            ],
            config: {
              x: -1 * t + "%",
              y: "-5%",
              width: `${t}%`,
              height: `${t}vw`,
              blackPoint: 256,
              whitePoint: 255,
              threshold: 255,
              bgOpacity: 0,
              fillOpacity: 1,
            },
          },
          {
            type: "video",
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/benefits-outro_tree-c.mp4",
                type: "video/mp4",
              },
            ],
            loop: !1,
            config: {
              x: "35%",
              y: "-25%",
              width: "76%",
              height: "96%",
              blackPoint: -1,
              whitePoint: 0,
              threshold: 255,
              xSquares: 150,
              ySquares: 100,
              bgOpacity: 0,
              fillOpacity: 1,
            },
          },
        ],
        n = initCanvasEffect(e, o),
        i = gsap
          .timeline({
            scrollTrigger: {
              trigger: e,
              start: "top top",
              end: "bottom top",
              scrub: !0,
            },
          })
          .to(
            o[0].config,
            {
              blackPoint: 150,
              whitePoint: 0,
              ease: "none",
            },
            0,
          )
          .to(
            o[1].config,
            {
              blackPoint: 200,
              whitePoint: 55,
              ease: "none",
            },
            0,
          )
          .to(
            o[2].config,
            {
              blackPoint: 55,
              whitePoint: 200,
              ease: "none",
            },
            0,
          );
      let r = null;
      const a = document.querySelector(".benefits-s_cms");
      a &&
        (r = gsap
          .timeline({
            scrollTrigger: {
              trigger: a,
              start: "top top",
              end: "bottom top",
              scrub: !0,
            },
          })
          .to(
            o[0].config,
            {
              x: "-18%",
              y: "30%",
              ease: "In",
            },
            0,
          )
          .to(
            o[2].config,
            {
              x: "50%",
              y: "-100%",
              ease: "In",
            },
            0,
          ));
      const s = gsap
          .timeline({
            paused: !0,
          })
          .to(
            o[1].config,
            {
              x: "100%",
              duration: 5,
              ease: "none",
              repeat: -1,
              repeatDelay: 5,
            },
            0,
          ),
        c = new IntersectionObserver(
          (e) => {
            e.forEach((e) => {
              e.isIntersecting
                ? s.paused() && s.play()
                : s.paused() || s.pause();
            });
          },
          {
            threshold: 0.01,
            rootMargin: "20% 0px 20% 0px",
          },
        );
      return (
        c.observe(e),
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        }),
        {
          destroy: () => {
            (i.scrollTrigger?.kill(),
              i.kill(),
              r && (r.scrollTrigger?.kill(), r.kill()),
              s.kill(),
              c.disconnect(),
              n?.destroy());
          },
          loaded: n?.loaded,
        }
      );
    });
  }
  function initSceneFin() {
    if (!globalSceneManager) return;
    globalSceneManager.init("[data-fin-scene]", (e) =>
      initCanvasEffect(e, [
        {
          type: "image",
          src: "/assets/cdn.prod.website-files.com/6940a0abd735a1e3a640d042/69ca6aa1e460a649ef2a7972_fin_mounain.avif",
          config: {
            x: "0%",
            y: "0%",
            width: "80%",
            height: "100%",
            blackPoint: 200,
            whitePoint: 75,
            threshold: 255,
            bgOpacity: 1,
            fillOpacity: 1,
          },
        },
      ]),
    );
  }
  function initSceneDevOver() {
    if (window.innerWidth < breakPoint) return;
    if (!globalSceneManager) return;
    globalSceneManager.init("[data-dev-over-scene]", (e) => {
      const t = [
          {
            type: "video",
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/claudes_01.mp4",
                type: "video/mp4",
              },
            ],
            config: {
              x: "30%",
              y: "0%",
              width: "65%",
              height: "45vw",
              blackPoint: 25,
              whitePoint: 255,
              threshold: 255,
              bgOpacity: 1,
              fillOpacity: 1,
            },
          },
        ],
        o = initCanvasEffect(e, t),
        n = gsap
          .timeline({
            scrollTrigger: {
              trigger: e,
              start: "top bottom",
              end: "bottom top",
              scrub: !0,
            },
          })
          .to(t[0].config, {
            x: "60%",
            ease: "none",
          });
      return {
        destroy: () => {
          (n.scrollTrigger?.kill(), n.kill(), o?.destroy());
        },
        loaded: o?.loaded,
      };
    });
  }
  function initSceneDevBg() {
    if (window.innerWidth < breakPoint) return;
    if (!globalSceneManager) return;
    const e = globalSceneManager,
      t = window.innerWidth >= breakPoint ? 33.33 : 100;
    e.init("[data-dev-bg-scene]", (e) => {
      const o = [
          {
            type: "video",
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/claudes_02.mp4",
                type: "video/mp4",
              },
            ],
            config: {
              x: "5%",
              y: "35%",
              width: "65%",
              height: "45vw",
              blackPoint: 25,
              whitePoint: 255,
              threshold: 255,
              bgOpacity: 1,
              fillOpacity: 1,
            },
          },
          {
            type: "video",
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/birds_03.hevc.mp4",
                type: "video/mp4",
              },
            ],
            config: {
              x: -1 * t + "%",
              y: "5%",
              width: `${t}%`,
              height: `${t}vw`,
              blackPoint: 0,
              whitePoint: 255,
              threshold: 255,
              bgOpacity: 1,
              fillOpacity: 1,
            },
          },
          {
            type: "video",
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/birds_02-c.mp4",
                type: "video/mp4",
              },
            ],
            config: {
              x: -1 * t + "%",
              y: "50%",
              width: `${t}%`,
              height: `${t}vw`,
              blackPoint: 0,
              whitePoint: 255,
              threshold: 255,
              bgOpacity: 1,
              fillOpacity: 1,
            },
          },
          {
            type: "video",
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/birds_04.hevc.mp4",
                type: "video/mp4",
              },
            ],
            config: {
              x: -1 * t + "%",
              y: "80%",
              width: `${t}%`,
              height: `${t}vw`,
              blackPoint: 0,
              whitePoint: 255,
              threshold: 255,
              bgOpacity: 1,
              fillOpacity: 1,
            },
          },
        ],
        n = initCanvasEffect(e, o),
        i = gsap
          .timeline({
            scrollTrigger: {
              trigger: e,
              start: "top bottom",
              end: "bottom top",
              scrub: !0,
            },
          })
          .to(o[0].config, {
            x: "-30%",
            ease: "none",
          }),
        r = gsap
          .timeline({
            paused: !0,
          })
          .to(
            o[1].config,
            {
              x: "100%",
              duration: 5,
              ease: "none",
              repeat: -1,
              repeatDelay: 5,
            },
            "<",
          )
          .to(
            o[3].config,
            {
              x: "100%",
              duration: 5,
              ease: "none",
              repeat: -1,
              repeatDelay: 5,
            },
            "<",
          )
          .to(
            o[2].config,
            {
              x: "100%",
              duration: 5,
              ease: "none",
              delay: 5,
              repeat: -1,
              repeatDelay: 5,
            },
            "<",
          ),
        a = new IntersectionObserver(
          (e) => {
            e.forEach((e) => {
              e.isIntersecting
                ? r.paused() && r.play()
                : r.paused() || r.pause();
            });
          },
          {
            threshold: 0.01,
            rootMargin: "20% 0px 20% 0px",
          },
        );
      return (
        a.observe(e),
        {
          destroy: () => {
            (i.scrollTrigger?.kill(),
              i.kill(),
              r.kill(),
              a.disconnect(),
              n?.destroy());
          },
          loaded: n?.loaded,
        }
      );
    });
  }
  function initSceneFactoid() {
    if (!globalSceneManager) return;
    globalSceneManager.init("[data-factoid-scene]", (e) =>
      initCanvasEffect(e, [
        {
          type: "video",
          sources: [
            {
              src: "/assets/assets.sondaven.com/scenes/factoids_river-c.mp4",
              type: "video/mp4",
            },
          ],
          config: {
            x: "0%",
            y: "0%",
            width: "100%",
            height: "100%",
            blackPoint: 75,
            whitePoint: 175,
            threshold: 255,
            bgOpacity: 1,
            fillOpacity: 1,
          },
        },
        {
          type: "video",
          sources: [
            {
              src: "/assets/assets.sondaven.com/scenes/factoids_sheeps-c.mp4",
              type: "video/mp4",
            },
          ],
          config: {
            x: "15%",
            y: "15%",
            width: "60%",
            height: "40%",
            blackPoint: 25,
            whitePoint: 255,
            threshold: 255,
            bgOpacity: 1,
            fillOpacity: 1,
          },
        },
        {
          type: "video",
          sources: [
            {
              src: "/assets/assets.sondaven.com/scenes/factoids_person-cc.mp4",
              type: "video/mp4",
            },
          ],
          config: {
            x: "32.5%",
            y: "32.5%",
            width: "35%",
            height: "50%",
            blackPoint: 25,
            whitePoint: 225,
            threshold: 255,
            bgOpacity: 1,
            fillOpacity: 1,
          },
        },
      ]),
    );
  }
  function initSceneFaq() {
    if (!globalSceneManager) return;
    const e = globalSceneManager,
      t = window.innerWidth >= breakPoint ? 33.33 : 100;
    e.init("[data-faq-scene]", (e) => {
      const o = [
          {
            type: "video",
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/birds_03.hevc.mp4",
                type: "video/mp4",
              },
            ],
            config: {
              x: -1 * t + "%",
              y: "0%",
              width: `${t}%`,
              height: `${t}vw`,
              blackPoint: 0,
              whitePoint: 255,
              threshold: 255,
              bgOpacity: 1,
              fillOpacity: 1,
            },
          },
          {
            type: "video",
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/birds_02-c.mp4",
                type: "video/mp4",
              },
            ],
            config: {
              x: -1 * t + "%",
              y: "55%",
              width: `${t}%`,
              height: `${t}vw`,
              blackPoint: 0,
              whitePoint: 255,
              threshold: 255,
              bgOpacity: 1,
              fillOpacity: 1,
            },
          },
        ],
        n = initCanvasEffect(e, o),
        i = gsap
          .timeline({
            paused: !0,
            repeat: -1,
          })
          .to(o[0].config, {
            x: "100%",
            duration: window.innerWidth >= breakPoint ? 5 : 2.5,
            ease: "none",
          })
          .to(o[1].config, {
            x: "100%",
            duration: window.innerWidth >= breakPoint ? 5 : 2.5,
            ease: "none",
          })
          .to(
            {},
            {
              duration: 5,
            },
          ),
        r = new IntersectionObserver(
          (e) => {
            e.forEach((e) => {
              e.isIntersecting
                ? i.paused() && i.play()
                : i.paused() || i.pause();
            });
          },
          {
            threshold: 0.01,
            rootMargin: "20% 0px 20% 0px",
          },
        );
      return (
        r.observe(e),
        {
          destroy: () => {
            (i.kill(), r.disconnect(), n?.destroy());
          },
          loaded: n?.loaded,
        }
      );
    });
  }
  function initSceneFooter() {
    if (!globalSceneManager) return;
    globalSceneManager.init("[data-footer-scene]", (e) =>
      initCanvasEffect(e, [
        {
          type: "video",
          sources: [
            {
              src: "/assets/assets.sondaven.com/scenes/footer_mountain.hevc.mp4",
              type: "video/mp4",
            },
          ],
          config: {
            x: "0%",
            y: "67.5%",
            width: "100%",
            height: "32.5%",
            blackPoint: 240,
            whitePoint: 50,
            threshold: 255,
            bgOpacity: 1,
            fillOpacity: 0,
          },
        },
        {
          type: "video",
          sources: [
            {
              src: "/assets/assets.sondaven.com/scenes/footer_sheeps-c.mp4",
              type: "video/mp4",
            },
          ],
          config: {
            x: "30%",
            y: "5%",
            width: "40%",
            height: "95%",
            blackPoint: 0,
            whitePoint: 215,
            threshold: 255,
            ySquares: 125,
            xSquares: 150,
            bgOpacity: 1,
            fillOpacity: 1,
          },
        },
      ]),
    );
  }
  function initSceneArticleDark() {
    if (!globalSceneManager) return;
    const e = globalSceneManager,
      t = window.innerWidth >= breakPoint ? 33.33 : 100;
    e.init("[data-article-dark-scene]", (e) => {
      const o = [
          {
            type: "video",
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/birds_03.hevc.mp4",
                type: "video/mp4",
              },
            ],
            config: {
              x: -1 * t + "%",
              y: "0%",
              width: `${t}%`,
              height: `${t}vw`,
              blackPoint: 0,
              whitePoint: 255,
              threshold: 255,
              bgOpacity: 1,
              fillOpacity: 1,
            },
          },
          {
            type: "video",
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/birds_02-c.mp4",
                type: "video/mp4",
              },
            ],
            config: {
              x: -1 * t + "%",
              y: "55%",
              width: `${t}%`,
              height: `${t}vw`,
              blackPoint: 0,
              whitePoint: 255,
              threshold: 255,
              bgOpacity: 1,
              fillOpacity: 1,
            },
          },
        ],
        n = initCanvasEffect(e, o),
        i = gsap
          .timeline({
            paused: !0,
            repeat: -1,
          })
          .to(o[0].config, {
            x: "100%",
            duration: window.innerWidth >= breakPoint ? 5 : 2.5,
            ease: "none",
          })
          .to(o[1].config, {
            x: "100%",
            duration: window.innerWidth >= breakPoint ? 5 : 2.5,
            ease: "none",
          })
          .to(
            {},
            {
              duration: 10,
            },
          ),
        r = new IntersectionObserver(
          (e) => {
            e.forEach((e) => {
              e.isIntersecting
                ? i.paused() && i.play()
                : i.paused() || i.pause();
            });
          },
          {
            threshold: 0.01,
            rootMargin: "20% 0px 20% 0px",
          },
        );
      return (
        r.observe(e),
        {
          destroy: () => {
            (i.kill(), r.disconnect(), n?.destroy());
          },
          loaded: n?.loaded,
        }
      );
    });
  }
  function initSceneArticleLight() {
    if (!globalSceneManager) return;
    const e = globalSceneManager,
      t = window.innerWidth >= breakPoint ? 33.33 : 100;
    e.init("[data-article-light-scene]", (e) => {
      const o = [
          {
            type: "video",
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/birds_03.hevc.mp4",
                type: "video/mp4",
              },
            ],
            config: {
              x: -1 * t + "%",
              y: "0%",
              width: `${t}%`,
              height: `${t}vw`,
              blackPoint: 255,
              whitePoint: 0,
              threshold: 255,
              bgOpacity: 1,
              fillOpacity: 1,
            },
          },
          {
            type: "video",
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/birds_02-c.mp4",
                type: "video/mp4",
              },
            ],
            config: {
              x: -1 * t + "%",
              y: "55%",
              width: `${t}%`,
              height: `${t}vw`,
              blackPoint: 255,
              whitePoint: 0,
              threshold: 255,
              bgOpacity: 1,
              fillOpacity: 1,
            },
          },
        ],
        n = initCanvasEffect(e, o),
        i = gsap
          .timeline({
            paused: !0,
            repeat: -1,
          })
          .to(o[0].config, {
            x: "100%",
            duration: window.innerWidth >= breakPoint ? 5 : 2.5,
            ease: "none",
          })
          .to(o[1].config, {
            x: "100%",
            duration: window.innerWidth >= breakPoint ? 5 : 2.5,
            ease: "none",
          })
          .to(
            {},
            {
              duration: 10,
            },
          ),
        r = new IntersectionObserver(
          (e) => {
            e.forEach((e) => {
              e.isIntersecting
                ? i.paused() && i.play()
                : i.paused() || i.pause();
            });
          },
          {
            threshold: 0.01,
            rootMargin: "20% 0px 20% 0px",
          },
        );
      return (
        r.observe(e),
        {
          destroy: () => {
            (i.kill(), r.disconnect(), n?.destroy());
          },
          loaded: n?.loaded,
        }
      );
    });
  }
  function initSceneError() {
    if (!globalSceneManager) return;
    const e = globalSceneManager,
      t = window.innerWidth >= breakPoint,
      o = t ? 33.33 : 100;
    e.init("[data-error-scene]", (e) => {
      const n = [
          {
            type: "image",
            src: "/assets/cdn.prod.website-files.com/6940a0abd735a1e3a640d042/697eaab2cfc366a5bf4bd727_f73b5dcc1687f5e65745b9063965659a_error_bg.avif",
            config: {
              x: "-8.5%",
              y: "-22.5%",
              width: "120%",
              height: "125%",
              blackPoint: 75,
              whitePoint: 150,
              threshold: 255,
              bgOpacity: 0,
              fillOpacity: 1,
            },
          },
          {
            type: "video",
            skip: !t,
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/birds_03.hevc.mp4",
                type: "video/mp4",
              },
            ],
            config: {
              x: -1 * o + "%",
              y: "0%",
              width: `${o}%`,
              height: `${o}vw`,
              blackPoint: 0,
              whitePoint: 255,
              threshold: 255,
              bgOpacity: 1,
              fillOpacity: 0,
            },
          },
          {
            type: "video",
            skip: !t,
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/birds_02-c.mp4",
                type: "video/mp4",
              },
            ],
            config: {
              x: -1 * o + "%",
              y: "25%",
              width: `${o}%`,
              height: `${o}vw`,
              blackPoint: 0,
              whitePoint: 255,
              threshold: 255,
              bgOpacity: 1,
              fillOpacity: 0,
            },
          },
          {
            type: "video",
            sources: [
              {
                src: "/assets/assets.sondaven.com/scenes/factoids_sheeps-c.mp4",
                type: "video/mp4",
              },
            ],
            config: {
              x: "-5%",
              y: "40%",
              width: "100%",
              height: "75%",
              blackPoint: 225,
              whitePoint: 25,
              threshold: 255,
              xSquares: 150,
              ySquares: 100,
              bgOpacity: 1,
              fillOpacity: 1,
            },
          },
        ],
        i = initCanvasEffect(
          e,
          n.filter((e) => !e.skip),
        ),
        r = gsap
          .timeline({
            paused: !0,
          })
          .to(
            n[0].config,
            {
              blackPoint: 55,
              whitePoint: 150,
              duration: 4,
              ease: "InOut",
              repeat: -1,
              yoyo: !0,
            },
            0,
          );
      t &&
        r
          .to(
            n[1].config,
            {
              x: "100%",
              duration: 5,
              ease: "none",
              repeat: -1,
              repeatDelay: 5,
            },
            0,
          )
          .to(
            n[2].config,
            {
              x: "100%",
              duration: 5,
              ease: "none",
              delay: 5,
              repeat: -1,
              repeatDelay: 5,
            },
            0,
          );
      const a = new IntersectionObserver(
        (e) => {
          e.forEach((e) => {
            e.isIntersecting ? r.paused() && r.play() : r.paused() || r.pause();
          });
        },
        {
          threshold: 0.01,
          rootMargin: "20% 0px 20% 0px",
        },
      );
      return (
        a.observe(e),
        {
          destroy: () => {
            (r.kill(), a.disconnect(), i?.destroy());
          },
          loaded: i?.loaded,
        }
      );
    });
  }
  function initForm() {
    root.querySelectorAll("form").forEach((form) => {
      listen(form, "submit", (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const wrapper = form.closest(".w-form");
        const success = wrapper?.querySelector(".w-form-done");
        if (success) {
          form.style.display = "none";
          success.style.display = "flex";
          success.setAttribute("role", "status");
          success.querySelectorAll("p").forEach((p, i) => {
            if (i === 0)
              p.textContent =
                document.documentElement.lang === "en"
                  ? "Demo request received. No message was sent."
                  : "Демо-заявку прийнято. Повідомлення не надіслано.";
          });
        }
      });
      form.querySelectorAll("[data-form-btn]").forEach((button) =>
        listen(button, "click", (event) => {
          event.preventDefault();
          form.requestSubmit();
        }),
      );
    });
    root.querySelectorAll(".input_field").forEach((input) => {
      const label = input.parentElement.querySelector(".input_label");
      listen(input, "focus", () => label?.classList.add("focused"));
      listen(input, "blur", () => {
        if (!input.value.trim()) label?.classList.remove("focused");
      });
    });
  }
  function initSoundToggle() {
    const control = root.querySelector("[data-sound-toggle]");
    if (!control) return;
    const audio = new Audio(
      "/assets/assets.sondaven.com/carpathian-whispers-hutsul-ambient.mp3",
    );
    audio.loop = true;
    audio.volume = 0.25;
    control.setAttribute("role", "button");
    control.setAttribute("tabindex", "0");
    control.setAttribute("aria-label", "Toggle ambient sound");
    control.setAttribute("aria-pressed", "false");
    const toggle = () => {
      if (audio.paused) {
        audio
          .play()
          .then(() => {
            control.setAttribute("aria-pressed", "true");
            control.classList.add("is-playing");
          })
          .catch(() => {});
      } else {
        audio.pause();
        control.setAttribute("aria-pressed", "false");
        control.classList.remove("is-playing");
      }
    };
    listen(control, "click", toggle);
    listen(control, "keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
    cleanups.push(() => {
      audio.pause();
      audio.src = "";
    });
  }
  function initModalVimVideo() {
    root.querySelectorAll("[data-modal-vim-video-btn]").forEach((button) =>
      listen(button, "click", (event) => {
        const name = button.getAttribute("data-modal-vim-video-btn");
        const modal = root.querySelector(`[data-modal-vim-video="${name}"]`);
        if (!modal) return;
        event.preventDefault();
        modal.style.display = "block";
        modal.querySelector(".modal_vim-video").style.display = "flex";
        modal.setAttribute("data-open", "true");
        lockScroll();
      }),
    );
    root.querySelectorAll("[data-modal-close]").forEach((button) =>
      listen(button, "click", (event) => {
        event.preventDefault();
        const modal = button.closest("[data-modal-vim-video]");
        if (modal) {
          modal.style.display = "none";
          modal.removeAttribute("data-open");
          unlockScroll();
        }
      }),
    );
  }
  initLenis();
  listen(window, "resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      ScrollTrigger.refresh(true);
      initTabsHilight();
    }, 100);
  });
  // Keep native Next.js navigation; section anchors use the smooth-scroll controller.
  listen(root, "click", (event) => {
    const a = event.target.closest?.("a[href]");
    if (!a) return;
    const href = a.getAttribute("href");
    if (href === "#") {
      event.preventDefault();
      return;
    }
    if (href?.startsWith("#")) {
      const target = root.querySelector(href);
      if (target) {
        event.preventDefault();
        lenis.scrollTo(target, { offset: -70 });
        history.replaceState(null, "", href);
      } else if (
        document
          .querySelector("[data-page-template]")
          ?.getAttribute("data-page-template") !== "home"
      ) {
        event.preventDefault();
        navigate((location.pathname.startsWith("/en") ? "/en" : "/ua") + href);
      }
    }
  });
  // Cookie preference stays local and never activates third-party analytics.
  const cookie = root.querySelector('[fs-cc="banner"]');
  if (cookie) {
    if (localStorage.getItem("sondaven-cookie-choice"))
      cookie.style.display = "none";
    cookie
      .querySelectorAll('[fs-cc="allow"],[fs-cc="deny"],[fs-cc="close"]')
      .forEach((button) =>
        listen(button, "click", (event) => {
          event.preventDefault();
          localStorage.setItem("sondaven-cookie-choice", "dismissed");
          cookie.style.display = "none";
        }),
      );
  }
  initAllScenes();
  const ready = Promise.all([
    framesPromise,
    globalSceneManager.ready(),
    document.fonts.ready,
  ]);
  const reveal = () => {
    if (disposed || root.dataset.ready) return;
    root.dataset.ready = "true";
    const preloader = root.querySelector("[data-preloader]");
    if (preloader)
      gsap.to(preloader, {
        autoAlpha: 0,
        duration: 0.6,
        onComplete: () => {
          preloader.style.display = "none";
        },
      });
    const transition = root.querySelector(".transition");
    if (transition) transition.style.display = "none";
    initScripts();
    root
      .querySelectorAll('[data-intro="h"]')
      .forEach((e) => animateTextH(e, "reveal", 0));
    root
      .querySelectorAll('[data-intro="p"]')
      .forEach((e) => animateTextP(e, "reveal", 0));
    root
      .querySelectorAll('[data-intro="ctn"]')
      .forEach((e) => animateCtn(e, "reveal", 0));
    root.querySelectorAll("[data-prevent-flicker]").forEach((e) => {
      e.style.visibility = "visible";
    });
    unlockScroll();
    ScrollTrigger.refresh();
    if (location.hash) {
      const el = root.querySelector(location.hash);
      if (el)
        setTimeout(
          () => lenis?.scrollTo(el, { immediate: true, offset: -70 }),
          200,
        );
    }
  };
  ready.then(reveal);
  setTimeout(reveal, 8000);
  return () => {
    disposed = true;
    delete root.dataset.ready;
    globalSceneManager?.destroy();
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    animations.forEach((animation) => animation.kill());
    tickers.forEach((fn) => baseGsap.ticker.remove(fn));
    observers.forEach((observer) => observer.disconnect());
    cleanups.reverse().forEach((fn) => {
      try {
        fn();
      } catch {}
    });
    timers.forEach((id) => window.clearTimeout(id));
    frames.forEach((id) => window.cancelAnimationFrame(id));
    root.querySelectorAll("*").forEach((el) => {
      if (el._split) {
        el._split.revert();
        delete el._split;
      }
    });
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  };
}
