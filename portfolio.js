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

allImages.forEach((img, index) => {
  img.addEventListener("contextmenu", (event) => event.preventDefault());
  img.addEventListener("dragstart", (event) => event.preventDefault());
  img.decoding = "async";

  const shouldPrioritize = index < 6;
  img.loading = isSmallViewport ? (shouldPrioritize ? "eager" : "lazy") : "eager";
  img.importance = isSmallViewport ? (shouldPrioritize ? "high" : "auto") : "high";
  img.setAttribute("fetchpriority", isSmallViewport ? (shouldPrioritize ? "high" : "low") : "high");
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

    const trackedImages = Array.from(document.querySelectorAll(".portfolio__grid img"));
    const totalImages = trackedImages.length;
    let loadedImages = 0;

    setLoaderProgress(0, totalImages);

    const markLoaded = () => {
      loadedImages += 1;
      setLoaderProgress(loadedImages, totalImages);

      if (loadedImages >= totalImages && document.readyState === "complete") {
        hideLoader();
      }
    };

    if (totalImages === 0) {
      setLoaderProgress(1, 1);
      hideLoader();
    } else {
      trackedImages.forEach((img) => {
        if (img.complete) {
          markLoaded();
          return;
        }

        const done = () => {
          img.removeEventListener("load", done);
          img.removeEventListener("error", done);
          markLoaded();
        };

        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      });

      window.addEventListener("load", () => {
        if (loadedImages >= totalImages) {
          hideLoader();
        }
      }, { once: true });

      window.setTimeout(hideLoader, 6000);
    }
  }
}

const quickLinksWrapper = document.querySelector(".quick-links-wrapper");
const quickLinksPanel = document.querySelector(".quick-links-panel");
const quickLinksToggle = quickLinksWrapper ? quickLinksWrapper.querySelector(".quick-links-toggle") : null;
const quickLinkButtons = document.querySelectorAll(".quick-links-toggle");

const scrollToSection = (selector) => {
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
  window.scrollTo({ top: Math.max(0, top), behavior: shouldAnimate ? "smooth" : "auto" });
};

if (quickLinksWrapper && quickLinksPanel && quickLinksToggle) {
  const topSectionButtons = document.querySelectorAll(".portfolio-links [data-target]");
  const panelSectionButtons = quickLinksPanel.querySelectorAll("[data-target]");

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

  topSectionButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      scrollToSection(button.dataset.target);
    });
  });

  panelSectionButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const target = button.dataset.target;
      setPanelState(false);

      window.requestAnimationFrame(() => {
        scrollToSection(target);
      });
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
      setPanelState(false);
    }
  });
}
