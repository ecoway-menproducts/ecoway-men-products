document.addEventListener('DOMContentLoaded', function () {
  initCommonUI('home');

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
