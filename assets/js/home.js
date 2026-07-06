document.addEventListener('DOMContentLoaded', function () {
  initCommonUI('home');
  initHeroSlider();

  var featured = PRODUCTS.filter(function (p) { return p.inStock; }).slice(0, 4);
  var featuredEl = document.getElementById('featured-products');
  if (featuredEl) {
    featuredEl.innerHTML = featured.map(renderProductCard).join('');
  }

  var categoriesEl = document.getElementById('categories-grid');
  if (categoriesEl) {
    categoriesEl.innerHTML = CATEGORIES.map(function (cat) {
      return (
        '<a href="' + pagePath('products.html') + '?category=' + cat.id + '" class="category-card">' +
          '<div class="category-card__icon">' + cat.icon + '</div>' +
          '<h3>' + cat.name + '</h3>' +
        '</a>'
      );
    }).join('');
  }

  injectStructuredData('Organization', {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: window.location.origin + SITE_CONFIG.basePath,
    email: SITE_CONFIG.email,
    description: SITE_CONFIG.tagline
  });
});

var _heroSliderTimer = null;

function initHeroSlider() {
  var hero = document.getElementById('hero');
  if (!hero) return;

  var slides = hero.querySelectorAll('.hero__slide');
  var dots = hero.querySelectorAll('.hero__dot');
  if (!slides.length) return;

  var current = 0;
  var interval = 4500;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function clearTimer() {
    if (_heroSliderTimer) {
      clearInterval(_heroSliderTimer);
      _heroSliderTimer = null;
    }
  }

  function goTo(index) {
    if (index === current || index < 0 || index >= slides.length) return;

    slides[current].classList.remove('is-active');
    if (dots[current]) {
      dots[current].classList.remove('is-active');
      dots[current].setAttribute('aria-selected', 'false');
    }

    current = index;

    slides[current].classList.add('is-active');
    if (dots[current]) {
      dots[current].classList.add('is-active');
      dots[current].setAttribute('aria-selected', 'true');
    }
  }

  function next() {
    goTo((current + 1) % slides.length);
  }

  function startAutoplay() {
    if (reducedMotion || slides.length < 2) return;
    clearTimer();
    _heroSliderTimer = setInterval(next, interval);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var index = parseInt(dot.dataset.index, 10);
      goTo(index);
      startAutoplay();
    });
  });

  hero.addEventListener('mouseenter', clearTimer);
  hero.addEventListener('mouseleave', startAutoplay);
  hero.addEventListener('focusin', clearTimer);
  hero.addEventListener('focusout', startAutoplay);

  startAutoplay();
}
