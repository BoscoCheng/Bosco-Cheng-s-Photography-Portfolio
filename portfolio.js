const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
const menuBtnIcon = menuBtn ? menuBtn.querySelector("i") : null;

if (menuBtn && navLinks && menuBtnIcon) {
  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("open");

    const isOpen = navLinks.classList.contains("open");
    menuBtnIcon.setAttribute("class", isOpen ? "ri-close-line" : "ri-menu-3-line");
  });

  navLinks.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuBtnIcon.setAttribute("class", "ri-menu-3-line");
  });
}

const allImages = document.querySelectorAll("img");
const isSmallViewport = window.matchMedia("(max-width: 768px)").matches;
const PRELOAD_IMAGE_LIMIT = isSmallViewport ? 0 : 12;
const LOADER_MAX_WAIT_MS = 5000;
const IMAGE_WAIT_TIMEOUT_MS = 7000;

allImages.forEach((img, index) => {
  img.addEventListener("contextmenu", (event) => event.preventDefault());
  img.addEventListener("dragstart", (event) => event.preventDefault());
  img.decoding = "async";

  const prioritizedCount = isSmallViewport ? 6 : PRELOAD_IMAGE_LIMIT;
  const shouldPrioritize = index < prioritizedCount;
  img.loading = shouldPrioritize ? "eager" : "lazy";
  img.importance = shouldPrioritize ? "high" : "auto";
  img.setAttribute("fetchpriority", shouldPrioritize ? "high" : "low");
});

const pageLoader = document.getElementById("page-loader");
const loaderProgressBar = document.getElementById("loader-progress-bar");
const loaderProgressText = document.getElementById("loader-progress-text");

const setLoaderProgress = (loaded, total) => {
  const progress = total === 0 ? 100 : Math.round((loaded / total) * 100);
  const progressValue = `${progress}%`;

  if (loaderProgressBar) {
    loaderProgressBar.style.width = progressValue;
  }

  if (loaderProgressText) {
    loaderProgressText.textContent = progressValue;
  }
};

const hideLoader = () => {
  if (!pageLoader || pageLoader.classList.contains("page-loader--hidden")) {
    document.body.classList.remove("portfolio-loading");
    return;
  }

  pageLoader.classList.add("page-loader--finishing");
  window.setTimeout(() => {
    pageLoader.classList.add("page-loader--hidden");
    pageLoader.setAttribute("aria-hidden", "true");
  }, 140);

  document.body.classList.remove("portfolio-loading");
};

if (pageLoader) {
  if (isSmallViewport) {
    pageLoader.classList.add("page-loader--hidden");
    pageLoader.setAttribute("aria-hidden", "true");
    document.body.classList.remove("portfolio-loading");
  } else {
    document.body.classList.add("portfolio-loading");
    pageLoader.setAttribute("aria-hidden", "false");

    const trackedImages = Array.from(document.querySelectorAll(".portfolio__grid img")).slice(0, PRELOAD_IMAGE_LIMIT);
    const totalImages = trackedImages.length;
    let loadedImages = 0;
    let forceRevealTimeoutId = null;
    let loaderSettled = false;

    setLoaderProgress(0, totalImages);

    const finishLoader = () => {
      if (loaderSettled) {
        return;
      }

      loaderSettled = true;

      if (forceRevealTimeoutId !== null) {
        window.clearTimeout(forceRevealTimeoutId);
        forceRevealTimeoutId = null;
      }

      hideLoader();
    };

    const markLoaded = () => {
      if (loaderSettled) {
        return;
      }

      loadedImages += 1;
      setLoaderProgress(loadedImages, totalImages);

      if (loadedImages >= totalImages && document.readyState === "complete") {
        finishLoader();
      }
    };

    if (totalImages === 0) {
      setLoaderProgress(1, 1);
      finishLoader();
    } else {
      trackedImages.forEach((img) => {
        let settled = false;

        const completeImage = () => {
          if (settled) {
            return;
          }

          settled = true;
          markLoaded();
        };

        const settleTimeoutId = window.setTimeout(() => {
          completeImage();
        }, IMAGE_WAIT_TIMEOUT_MS);

        if (img.complete) {
          window.clearTimeout(settleTimeoutId);
          completeImage();
          return;
        }

        const done = () => {
          window.clearTimeout(settleTimeoutId);
          img.removeEventListener("load", done);
          img.removeEventListener("error", done);
          completeImage();
        };

        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      });

      window.addEventListener("load", () => {
        if (loadedImages >= totalImages || document.readyState === "complete") {
          finishLoader();
        }
      }, { once: true });

      forceRevealTimeoutId = window.setTimeout(() => {
        finishLoader();
      }, LOADER_MAX_WAIT_MS);

      window.addEventListener("pageshow", finishLoader, { once: true });
    }
  }
}

const quickLinksWrapper = document.querySelector(".quick-links-wrapper");
const quickLinksPanel = document.querySelector(".quick-links-panel");
const quickLinksToggle = quickLinksWrapper ? quickLinksWrapper.querySelector(".quick-links-toggle") : null;
const quickLinkButtons = document.querySelectorAll(".quick-links-toggle");
const portfolioSectionOrder = [
  "#Portfolio",
  "#Street",
  "#Landscape",
  "#Food",
  "#Portraits",
  "#Events",
  "#Products",
  "#Architecture",
];
let stabilizeTimeoutId = null;
let stabilizeAnimationFrameId = null;
let activeStabilizeTarget = null;

const clearStabilizers = () => {
  if (stabilizeTimeoutId !== null) {
    window.clearTimeout(stabilizeTimeoutId);
    stabilizeTimeoutId = null;
  }

  if (stabilizeAnimationFrameId !== null) {
    window.cancelAnimationFrame(stabilizeAnimationFrameId);
    stabilizeAnimationFrameId = null;
  }
};

const primeImagesBeforeTarget = (targetSelector) => {
  const targetIndex = portfolioSectionOrder.indexOf(targetSelector);
  if (targetIndex <= 0) {
    return;
  }

  const selectors = portfolioSectionOrder
    .slice(1, targetIndex + 1)
    .map((sectionSelector) => `${sectionSelector} img`)
    .join(",");

  if (!selectors) {
    return;
  }

  document.querySelectorAll(selectors).forEach((img) => {
    img.loading = "eager";
    img.importance = "high";
    img.setAttribute("fetchpriority", "high");
  });
};

const stabilizeSectionPosition = (targetSelector) => {
  if (!isSmallViewport) {
    return;
  }

  clearStabilizers();
  activeStabilizeTarget = targetSelector;
  const startTime = performance.now();
  const stabilizeDurationMs = 1400;

  const tick = () => {
    if (activeStabilizeTarget !== targetSelector) {
      return;
    }

    scrollToSection(targetSelector, { forceInstant: true });

    if (performance.now() - startTime >= stabilizeDurationMs) {
      clearStabilizers();
      return;
    }

    stabilizeTimeoutId = window.setTimeout(() => {
      stabilizeAnimationFrameId = window.requestAnimationFrame(tick);
    }, 120);
  };

  stabilizeAnimationFrameId = window.requestAnimationFrame(tick);
};

const scrollToSection = (selector, options = {}) => {
  const { forceInstant = false } = options;

  if (!selector) {
    return;
  }

  const target = document.querySelector(selector);
  if (!target) {
    return;
  }

  const navOffset = 92;
  const top = target.getBoundingClientRect().top + window.scrollY - navOffset;
  const shouldAnimate = !window.matchMedia("(max-width: 768px), (prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: Math.max(0, top), behavior: forceInstant ? "auto" : shouldAnimate ? "smooth" : "auto" });
};

if (quickLinksWrapper && quickLinksPanel && quickLinksToggle) {
  const topSectionButtons = document.querySelectorAll(".portfolio-links [data-target]");
  const panelSectionButtons = quickLinksPanel.querySelectorAll("[data-target]");
  const QUICK_NAV_GUARD_MS = isSmallViewport ? 260 : 140;
  let lastQuickNavTime = 0;
  let pendingScrollFrameId = null;

  const setPanelState = (open) => {
    const isOpen = quickLinksPanel.classList.contains("open");
    if (isOpen === open) {
      return;
    }

    quickLinksPanel.classList.toggle("open", open);
    quickLinksPanel.setAttribute("aria-hidden", String(!open));

    quickLinkButtons.forEach((button) => {
      button.classList.toggle("open", open);
      button.setAttribute("aria-expanded", String(open));
    });
  };

  const runQuickNavigation = (targetSelector, closePanelFirst) => {
    if (!targetSelector) {
      return;
    }

    const now = Date.now();
    if (now - lastQuickNavTime < QUICK_NAV_GUARD_MS) {
      return;
    }

    lastQuickNavTime = now;
    activeStabilizeTarget = targetSelector;
    primeImagesBeforeTarget(targetSelector);

    if (closePanelFirst) {
      setPanelState(false);
    }

    if (pendingScrollFrameId !== null) {
      window.cancelAnimationFrame(pendingScrollFrameId);
      pendingScrollFrameId = null;
    }

    pendingScrollFrameId = window.requestAnimationFrame(() => {
      pendingScrollFrameId = null;
      scrollToSection(targetSelector);
      stabilizeSectionPosition(targetSelector);
    });
  };

  topSectionButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      runQuickNavigation(button.dataset.target, false);
    });
  });

  panelSectionButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      runQuickNavigation(button.dataset.target, true);
    });
  });

  quickLinksToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    setPanelState(!quickLinksPanel.classList.contains("open"));
  });

  quickLinksPanel.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Node)) {
      return;
    }

    if (!quickLinksWrapper.contains(event.target)) {
      activeStabilizeTarget = null;
      clearStabilizers();
      setPanelState(false);
    }
  });
}
