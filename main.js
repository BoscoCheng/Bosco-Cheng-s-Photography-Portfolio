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
  const portfolioImageElements = Array.from(document.querySelectorAll(
    ".portfolio__grid img, .about__image img, .header__image img, .contact__image img"
  ));
  const totalImages = portfolioImageElements.length;
  let loadedImages = 0;

  const updateLoaderProgress = (loaded, total) => {
    const progress = total === 0 ? 100 : Math.round((loaded / total) * 100);

    if (loaderProgressBar) {
      loaderProgressBar.style.width = `${progress}%`;
    }

    if (loaderProgressText) {
      loaderProgressText.textContent = `${progress}%`;
    }
  };

  updateLoaderProgress(0, totalImages);

  const decodeImage = (img) =>
    img.decode ? img.decode().catch(() => undefined) : Promise.resolve();

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
    })
  );

  const allImagesLoaded = Promise.allSettled(trackedImagePromises);
  const hideAfterReady = Promise.all([pageLoaded, allImagesLoaded]);

  const hideLoader = () => {
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

const quickLinkButtons = document.querySelectorAll(".quick-links-toggle");
const quickLinksPanel = document.querySelector(".quick-links-panel");

if (quickLinkButtons.length && quickLinksPanel) {
  const setPanelState = (open) => {
    quickLinksPanel.classList.toggle("open", open);
    quickLinksPanel.setAttribute("aria-hidden", String(!open));

    quickLinkButtons.forEach((button) => {
      button.classList.toggle("open", open);
      button.setAttribute("aria-expanded", String(open));
    });
  };

  quickLinkButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setPanelState(!quickLinksPanel.classList.contains("open"));
    });
  });

  quickLinksPanel.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      setPanelState(false);
    }
  });
}
