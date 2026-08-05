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

  const decodeImage = (img) =>
    img.decode ? img.decode().catch(() => undefined) : Promise.resolve();

  const loadImage = (img) => {
    const src = img.currentSrc || img.src || img.getAttribute("src");
    if (!src) {
      return Promise.resolve();
    }

    img.loading = "eager";
    img.decoding = "sync";

    const fallbacks = getFallbackSrc(src) || [];
    const sources = [src, ...fallbacks];

    const trySource = (source) =>
      new Promise((resolve) => {
        const onLoad = async () => {
          cleanup();
          await decodeImage(img);
          resolve(true);
        };

        const onError = () => {
          cleanup();
          resolve(false);
        };

        const cleanup = () => {
          img.removeEventListener("load", onLoad);
          img.removeEventListener("error", onError);
        };

        img.addEventListener("load", onLoad, { once: true });
        img.addEventListener("error", onError, { once: true });
        img.src = source;
      });

    const loadWithFallbacks = async () => {
      if (img.complete && img.naturalWidth !== 0) {
        await decodeImage(img);
        return true;
      }

      for (const source of sources) {
        const loaded = await trySource(source);
        if (loaded) {
          return true;
        }
      }

      return false;
    };

    return loadWithFallbacks();
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
