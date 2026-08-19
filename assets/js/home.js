document.addEventListener('DOMContentLoaded', function () {
  initCommonUI('home');
  initHeroSlider();

  var featuredEl = document.getElementById('featured-products');
  if (featuredEl) {
    featuredEl.innerHTML = renderProductSkeletons(4);
  }

  loadProducts()
    .then(function () {
      var featured = PRODUCTS.filter(function (p) { return p.inStock; }).slice(0, 4);
      if (featuredEl) {
        if (featured.length === 0) {
          featuredEl.innerHTML = '<div class="no-results"><p>لا توجد منتجات متاحة حالياً</p></div>';
        } else {
          featuredEl.innerHTML = featured.map(renderProductCard).join('');
        }
      }
      initScrollReveal();
    })
    .catch(function () {
      renderProductsLoadError(featuredEl);
    });

  var categoriesEl = document.getElementById('categories-grid');
  if (categoriesEl) {
    categoriesEl.innerHTML = CATEGORIES.map(function (cat) {
      return (
        '<a href="' + pagePath('products.html') + '?category=' + cat.id + '" class="category-card reveal">' +
          '<div class="category-card__icon">' + cat.icon + '</div>' +
          '<h3>' + cat.name + '</h3>' +
        '</a>'
      );
    }).join('');
  }

  initScrollReveal();
  initTrustCounters();

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
  var interval = 8000;
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
  initHeroParallax(hero);
}

function initHeroParallax(hero) {
  if (prefersReducedMotion()) return;
  var picture = hero.querySelector('.hero__picture');
  if (!picture) return;

  var ticking = false;
  function update() {
    ticking = false;
    var y = window.scrollY;
    if (y > window.innerHeight) return;
    picture.style.transform = 'translate3d(0,' + Math.round(y * 0.18) + 'px,0)';
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });
}

function initTrustCounters() {
  var nodes = document.querySelectorAll('[data-count]');
  if (!nodes.length) return;

  function animate(el) {
    if (el.dataset.counted === '1') return;
    el.dataset.counted = '1';
    var end = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(end) || prefersReducedMotion()) {
      el.textContent = String(end);
      return;
    }
    var start = 0;
    var duration = 900;
    var t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(start + (end - start) * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (!('IntersectionObserver' in window)) {
    nodes.forEach(animate);
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      animate(entry.target);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  nodes.forEach(function (el) { io.observe(el); });
}
