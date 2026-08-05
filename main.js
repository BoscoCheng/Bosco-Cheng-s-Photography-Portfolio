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
  duration: 1000,
};

ScrollReveal().reveal(".header__image img", {
  ...scrollRevealOption,
  origin: "right",
});
ScrollReveal().reveal(".header__content h1", {
  ...scrollRevealOption,
  delay: 500,
});
ScrollReveal().reveal(".header__content h2", {
  ...scrollRevealOption,
  delay: 1000,
});
ScrollReveal().reveal(".header__btn", {
  ...scrollRevealOption,
  delay: 1500,
});

ScrollReveal().reveal(".about__image img", {
  ...scrollRevealOption,
  origin: "left",
});
ScrollReveal().reveal(".about__content .section__header", {
  ...scrollRevealOption,
  delay: 500,
});
ScrollReveal().reveal(".about__content p", {
  ...scrollRevealOption,
  delay: 1000,
  interval: 500,
});
ScrollReveal().reveal(".about__btn", {
  ...scrollRevealOption,
  delay: 2000,
});

ScrollReveal().reveal(".blog__card", {
  duration: 1000,
  interval: 500,
});

ScrollReveal().reveal(".blog__btn", {
  ...scrollRevealOption,
  delay: 2000,
});

ScrollReveal().reveal(".contact__image img", {
  ...scrollRevealOption,
});

const quickLinksToggle = document.querySelector(".quick-links-toggle");
const quickLinksPanel = document.querySelector(".quick-links-panel");

const isPortfolioPage = document.body.classList.contains("portfolio-page");
const portfolioImages = document.querySelectorAll(".portfolio__grid img, .about__image img, .header__image img, .contact__image img");

portfolioImages.forEach((img) => {
  img.addEventListener("contextmenu", (e) => e.preventDefault());
  img.addEventListener("dragstart", (e) => e.preventDefault());
});

if (isPortfolioPage) {
  const pageLoader = document.getElementById("page-loader");
  const galleryImages = Array.from(document.querySelectorAll(".portfolio__grid img"));

  const getFallbackSrc = (src) => {
    if (!src || !src.toLowerCase().endsWith(".webp")) {
      return null;
    }

    const alternatives = ["Jpg", "jpg", "JPG", "jpeg", "JPEG", "jpg"];
    return alternatives
      .map((dir) => src.replace(/\/WebP\//, `/${dir}/`).replace(/\.webp$/i, ".jpg"))
      .concat(
        alternatives.map((dir) => src.replace(/\/WebP\//, `/${dir}/`).replace(/\.webp$/i, ".jpeg"))
      );
  };

  const loadImage = (img) => {
    const src = img.dataset.src;
    if (!src) {
      return Promise.resolve();
    }

    img.loading = "eager";
    img.decoding = "sync";
    img.src = src;

    return new Promise((resolve) => {
      const onLoad = () => {
        img.removeAttribute("data-src");
        resolve();
      };

      const onError = () => {
        img.removeEventListener("load", onLoad);
        const fallbacks = getFallbackSrc(src);
        if (!fallbacks || fallbacks.length === 0) {
          resolve();
          return;
        }

        const tryNext = () => {
          const nextSrc = fallbacks.shift();
          if (!nextSrc) {
            resolve();
            return;
          }

          img.src = nextSrc;
        };

        img.addEventListener("load", onLoad, { once: true });
        img.addEventListener("error", () => {
          img.removeEventListener("load", onLoad);
          tryNext();
        }, { once: true });

        tryNext();
      };

      if (img.complete && img.naturalWidth !== 0) {
        img.removeAttribute("data-src");
        resolve();
        return;
      }

      img.addEventListener("load", onLoad, { once: true });
      img.addEventListener("error", onError, { once: true });
    });
  };

  const pageLoaded =
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise((resolve) => {
          window.addEventListener("load", resolve, { once: true });
        });

  const loadPromises = galleryImages.map(loadImage);

  Promise.all([pageLoaded, Promise.all(loadPromises)]).then(() => {
    if (pageLoader) {
      pageLoader.classList.add("page-loader--hidden");
      pageLoader.setAttribute("aria-hidden", "true");
    }
  });
}

if (quickLinksToggle && quickLinksPanel) {
  quickLinksToggle.addEventListener("click", () => {
    const isOpen = quickLinksPanel.classList.toggle("open");
    quickLinksToggle.classList.toggle("open", isOpen);
    quickLinksToggle.setAttribute("aria-expanded", String(isOpen));
    quickLinksPanel.setAttribute("aria-hidden", String(!isOpen));
  });
}
