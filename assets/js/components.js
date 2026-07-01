/**
 * مكونات مشتركة — Header, Footer, Mobile Nav, WhatsApp
 */
function renderHeader(activePage) {
  var cartCount = Cart.getCount();
  return (
    '<header class="header">' +
      '<div class="header__announce">' +
        '<span>🚚 توصيل خلال ' + SITE_CONFIG.deliveryDays + ' — الدفع عند الاستلام</span>' +
      '</div>' +
      '<div class="header__main container">' +
        '<a href="' + pagePath('index.html') + '" class="header__logo">' +
          '<span class="header__logo-icon">E</span>' +
          '<span class="header__logo-text">' + SITE_CONFIG.name + '</span>' +
        '</a>' +
        '<nav class="header__nav" aria-label="التنقل الرئيسي">' +
          '<a href="' + pagePath('index.html') + '" class="' + (activePage === 'home' ? 'active' : '') + '">الرئيسية</a>' +
          '<a href="' + pagePath('products.html') + '" class="' + (activePage === 'products' ? 'active' : '') + '">المنتجات</a>' +
          '<a href="' + pagePath('about.html') + '" class="' + (activePage === 'about' ? 'active' : '') + '">من نحن</a>' +
          '<a href="' + pagePath('contact.html') + '" class="' + (activePage === 'contact' ? 'active' : '') + '">اتصل بنا</a>' +
        '</nav>' +
        '<div class="header__actions">' +
          '<a href="' + pagePath('cart.html') + '" class="header__cart" aria-label="سلة التسوق">' +
            '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>' +
            '<span class="header__cart-badge" data-cart-count style="display:' + (cartCount > 0 ? 'flex' : 'none') + '">' + cartCount + '</span>' +
          '</a>' +
          '<button class="header__menu-btn" id="menuToggle" aria-label="فتح القائمة" aria-expanded="false">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="header__mobile-nav" id="mobileNav" hidden>' +
        '<a href="' + pagePath('index.html') + '">الرئيسية</a>' +
        '<a href="' + pagePath('products.html') + '">المنتجات</a>' +
        '<a href="' + pagePath('about.html') + '">من نحن</a>' +
        '<a href="' + pagePath('contact.html') + '">اتصل بنا</a>' +
        '<a href="' + pagePath('cart.html') + '">السلة (' + cartCount + ')</a>' +
      '</div>' +
    '</header>'
  );
}

function renderFooter() {
  return (
    '<footer class="footer">' +
      '<div class="container footer__grid">' +
        '<div class="footer__brand">' +
          '<h3>' + SITE_CONFIG.name + '</h3>' +
          '<p>' + SITE_CONFIG.tagline + '</p>' +
          '<div class="footer__trust">' +
            '<span>✓ توصيل سريع</span>' +
            '<span>✓ دفع آمن عند الاستلام</span>' +
            '<span>✓ دعم واتساب</span>' +
          '</div>' +
        '</div>' +
        '<div class="footer__links">' +
          '<h4>روابط سريعة</h4>' +
          '<a href="' + pagePath('products.html') + '">جميع المنتجات</a>' +
          '<a href="' + pagePath('about.html') + '">من نحن</a>' +
          '<a href="' + pagePath('contact.html') + '">اتصل بنا</a>' +
          '<a href="' + pagePath('cart.html') + '">سلة التسوق</a>' +
        '</div>' +
        '<div class="footer__links">' +
          '<h4>السياسات</h4>' +
          '<a href="' + pagePath('shipping-policy.html') + '">سياسة الشحن</a>' +
          '<a href="' + pagePath('return-policy.html') + '">سياسة الاسترجاع</a>' +
        '</div>' +
        '<div class="footer__contact">' +
          '<h4>تواصل معنا</h4>' +
          '<a href="mailto:' + SITE_CONFIG.email + '">' + SITE_CONFIG.email + '</a>' +
          '<a href="https://wa.me/' + SITE_CONFIG.whatsappIntl + '" target="_blank" rel="noopener">واتساب: ' + SITE_CONFIG.whatsapp + '</a>' +
        '</div>' +
      '</div>' +
      '<div class="footer__bottom container">' +
        '<p>© ' + SITE_CONFIG.year + ' ' + SITE_CONFIG.name + '. جميع الحقوق محفوظة.</p>' +
      '</div>' +
    '</footer>'
  );
}

function renderMobileBottomNav(activePage) {
  return (
    '<nav class="mobile-nav" aria-label="تنقل سفلي">' +
      '<a href="' + pagePath('index.html') + '" class="' + (activePage === 'home' ? 'active' : '') + '">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>' +
        '<span>الرئيسية</span>' +
      '</a>' +
      '<a href="' + pagePath('products.html') + '" class="' + (activePage === 'products' ? 'active' : '') + '">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>' +
        '<span>المنتجات</span>' +
      '</a>' +
      '<a href="' + pagePath('products.html') + '?search=1" class="' + (activePage === 'search' ? 'active' : '') + '">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>' +
        '<span>بحث</span>' +
      '</a>' +
      '<a href="' + pagePath('cart.html') + '" class="' + (activePage === 'cart' ? 'active' : '') + '">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>' +
        '<span>السلة</span>' +
        '<span class="mobile-nav__badge" data-cart-count style="display:' + (Cart.getCount() > 0 ? 'flex' : 'none') + '">' + Cart.getCount() + '</span>' +
      '</a>' +
    '</nav>'
  );
}

function renderWhatsAppButton() {
  return (
    '<a href="https://wa.me/' + SITE_CONFIG.whatsappIntl + '?text=' + encodeURIComponent('مرحباً، أريد الاستفسار عن منتجات Ecoway Men') + '" ' +
      'class="whatsapp-float" target="_blank" rel="noopener" aria-label="تواصل عبر واتساب">' +
      '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>' +
    '</a>'
  );
}

function renderProductCard(product) {
  var discount = getDiscountPercent(product.price, product.compareAt);
  var starsHtml = renderStarsStructure(product.reviews);

  return (
    '<article class="product-card" data-product-id="' + product.id + '">' +
      (discount > 0 ? '<span class="product-card__badge">-' + discount + '%</span>' : '') +
      '<a href="' + pagePath('product.html') + '?id=' + product.id + '" class="product-card__image">' +
        '<img src="' + assetPath(product.image) + '" alt="' + product.name + '" loading="lazy" width="300" height="300">' +
      '</a>' +
      '<div class="product-card__body">' +
        '<span class="product-card__category">' + getCategoryName(product.category) + '</span>' +
        '<h3 class="product-card__title"><a href="' + pagePath('product.html') + '?id=' + product.id + '">' + product.name + '</a></h3>' +
        starsHtml +
        '<div class="product-card__price">' +
          (product.compareAt && product.compareAt > product.price
            ? '<span class="price-compare">' + formatPrice(product.compareAt) + '</span>'
            : '') +
          '<span class="price-current">' + formatPrice(product.price) + '</span>' +
        '</div>' +
        '<button class="btn btn--primary btn--sm btn-add-cart" data-id="' + product.id + '">أضف إلى السلة</button>' +
      '</div>' +
    '</article>'
  );
}

function renderStarsStructure(reviews) {
  var count = reviews ? reviews.length : 0;
  if (count === 0) {
    return '<div class="stars stars--empty" aria-label="لا توجد تقييمات بعد">' +
      '<span class="stars__icons">☆☆☆☆☆</span>' +
      '<span class="stars__count">لا توجد تقييمات بعد</span>' +
    '</div>';
  }
  var avg = reviews.reduce(function (s, r) { return s + r.rating; }, 0) / count;
  var full = Math.round(avg);
  var stars = '';
  for (var i = 1; i <= 5; i++) {
    stars += i <= full ? '★' : '☆';
  }
  return '<div class="stars" aria-label="التقييم ' + avg.toFixed(1) + ' من 5">' +
    '<span class="stars__icons">' + stars + '</span>' +
    '<span class="stars__count">(' + count + ')</span>' +
  '</div>';
}

function initCommonUI(activePage) {
  var headerEl = document.getElementById('site-header');
  var footerEl = document.getElementById('site-footer');
  var mobileNavEl = document.getElementById('mobile-bottom-nav');
  var whatsappEl = document.getElementById('whatsapp-btn');

  if (headerEl) headerEl.innerHTML = renderHeader(activePage);
  if (footerEl) footerEl.innerHTML = renderFooter();
  if (mobileNavEl) mobileNavEl.innerHTML = renderMobileBottomNav(activePage);
  if (whatsappEl) whatsappEl.innerHTML = renderWhatsAppButton();

  var menuToggle = document.getElementById('menuToggle');
  var mobileNav = document.getElementById('mobileNav');
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      var isOpen = !mobileNav.hidden;
      mobileNav.hidden = isOpen;
      menuToggle.setAttribute('aria-expanded', !isOpen);
    });
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.btn-add-cart');
    if (btn) {
      e.preventDefault();
      var id = btn.dataset.id;
      if (Cart.add(id, 1)) {
        showToast('تمت الإضافة إلى السلة');
        btn.textContent = '✓ تمت الإضافة';
        setTimeout(function () { btn.textContent = 'أضف إلى السلة'; }, 1500);
      }
    }
  });

  window.addEventListener('cartUpdated', function () {
    Cart.updateBadge();
  });

  Cart.updateBadge();
}

function injectStructuredData(type, data) {
  var script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}
