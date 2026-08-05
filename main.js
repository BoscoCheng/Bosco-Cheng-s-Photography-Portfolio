const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
const menuBtnIcon = menuBtn.querySelector("i");

menuBtn.addEventListener("click", (e) => {
  navLinks.classList.toggle("open");

  const isOpen = navLinks.classList.contains("open");
  menuBtnIcon.setAttribute(
    "class",
    isOpen ? "ri-close-line" : "ri-menu-3-line"
  );
});

navLinks.addEventListener("click", (e) => {
  navLinks.classList.remove("open");
  menuBtnIcon.setAttribute("class", "ri-menu-3-line");
});

const scrollRevealOption = {
  distance: "50px",
  origin: "bottom",
  duration: 900,
};

ScrollReveal().reveal(".header__image img", {
  ...scrollRevealOption,
  origin: "right",
});
ScrollReveal().reveal(".header__content h1, .header__content h2, .header__btn", {
  ...scrollRevealOption,
  delay: 400,
  interval: 200,
});

ScrollReveal().reveal(".about__image img", {
  ...scrollRevealOption,
  origin: "left",
});
ScrollReveal().reveal(".about__content .section__header", {
  ...scrollRevealOption,
  delay: 400,
});
ScrollReveal().reveal(".about__content p", {
  ...scrollRevealOption,
  delay: 900,
  interval: 400,
});
ScrollReveal().reveal(".about__btn", {
  ...scrollRevealOption,
  delay: 1600,
});

ScrollReveal().reveal(".blog__card", {
  duration: 900,
  interval: 400,
});

ScrollReveal().reveal(".blog__btn", {
  ...scrollRevealOption,
  delay: 1600,
});

ScrollReveal().reveal(".contact__image img", {
  ...scrollRevealOption,
});

const allImages = document.querySelectorAll("img");
const isPortfolioPage = document.body.classList.contains("portfolio-page");

allImages.forEach((img) => {
  img.addEventListener("contextmenu", (e) => e.preventDefault());
  img.addEventListener("dragstart", (e) => e.preventDefault());
  img.decoding = "async";
  img.loading = "eager";
  img.importance = "high";
  img.setAttribute("fetchpriority", "high");
});

if (isPortfolioPage) {
  const pageLoader = document.getElementById("page-loader");
  const loaderProgressBar = document.getElementById("loader-progress-bar");
  const loaderProgressText = document.getElementById("loader-progress-text");
  const isMobileViewport = window.matchMedia("(max-width: 768px)").matches;

  if (isMobileViewport) {
    if (pageLoader) {
      pageLoader.classList.add("page-loader--hidden");
      pageLoader.setAttribute("aria-hidden", "true");
    }
  } else {
    const portfolioImageElements = Array.from(document.querySelectorAll(
      ".portfolio__grid img, .about__image img, .header__image img, .contact__image img"
    ));
    const totalImages = portfolioImageElements.length;
    let loadedImages = 0;

    const updateLoaderProgress = (loaded, total) => {
      const progress = total === 0 ? 100 : Math.round((loaded / total) * 100);
      const progressValue = `${progress}%`;

      if (pageLoader) {
        pageLoader.style.setProperty("--load-progress", progressValue);
      }

      if (loaderProgressBar) {
        loaderProgressBar.style.width = progressValue;
      }

      if (loaderProgressText) {
        loaderProgressText.textContent = progressValue;
      }
    };

    updateLoaderProgress(0, totalImages);

    const decodeImage = (img) => {
      if (!img.decode) {
        return Promise.resolve();
      }

      const decodeTimeout = new Promise((resolve) => {
        window.setTimeout(resolve, 3000);
      });

      return Promise.race([img.decode(), decodeTimeout]).catch(() => undefined);
    };

    const waitForDomImage = (img) =>
      new Promise((resolve) => {
        if (img.complete) {
          decodeImage(img).then(resolve).catch(resolve);
          return;
        }

        const timeoutId = window.setTimeout(() => {
          img.removeEventListener("load", done);
          img.removeEventListener("error", done);
          resolve();
        }, 15000);

        const done = () => {
          window.clearTimeout(timeoutId);
          img.removeEventListener("load", done);
          img.removeEventListener("error", done);
          decodeImage(img).then(resolve).catch(resolve);
        };

        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      });

    const pageLoaded =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise((resolve) => window.addEventListener("load", resolve, { once: true }));

    const trackedImagePromises = portfolioImageElements.map((img) =>
      waitForDomImage(img).finally(() => {
        loadedImages += 1;
        updateLoaderProgress(loadedImages, totalImages);

        if (loadedImages === totalImages && document.readyState === "complete") {
          hideLoader();
        }
      })
    );

    const allImagesLoaded = Promise.allSettled(trackedImagePromises);
    const hideAfterReady = Promise.all([pageLoaded, allImagesLoaded]);
    let loaderHidden = false;

    const hideLoader = () => {
      if (loaderHidden) {
        return;
      }

      loaderHidden = true;
      updateLoaderProgress(totalImages, totalImages);

      if (pageLoader) {
        pageLoader.classList.add("page-loader--hidden");
        pageLoader.setAttribute("aria-hidden", "true");
      }

      document.body.classList.remove("portfolio-loading");
    };

    if (pageLoader) {
      document.body.classList.add("portfolio-loading");
      pageLoader.setAttribute("aria-hidden", "false");
    }

    hideAfterReady.then(hideLoader);
  }
}

const quickLinkButtons = document.querySelectorAll(".quick-links-toggle");
const quickLinksPanel = document.querySelector(".quick-links-panel");
const quickLinksWrapper = document.querySelector(".quick-links-wrapper");

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
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
};

if (isPortfolioPage && quickLinksWrapper) {
  const topSectionButtons = document.querySelectorAll(".portfolio-links [data-target]");
  const panelSectionButtons = quickLinksPanel
    ? quickLinksPanel.querySelectorAll("[data-target]")
    : [];

  const setPanelState = (open) => {
    if (!quickLinksPanel) {
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
    button.addEventListener("click", () => {
      scrollToSection(button.dataset.target);
    });
  });

  panelSectionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      scrollToSection(button.dataset.target);
      setPanelState(false);
    });
  });

  quickLinkButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (!quickLinksPanel) {
        return;
      }

      setPanelState(!quickLinksPanel.classList.contains("open"));
    });
  });

  if (quickLinksPanel) {
    quickLinksPanel.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  }

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Node)) {
      return;
    }

    if (!quickLinksWrapper.contains(event.target)) {
      setPanelState(false);
    }
  });
}
