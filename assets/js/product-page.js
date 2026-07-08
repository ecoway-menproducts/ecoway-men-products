document.addEventListener('DOMContentLoaded', function () {
  initCommonUI('products');

  var params = new URLSearchParams(window.location.search);
  var productId = params.get('id');
  var container = document.getElementById('product-detail');

  if (container) {
    container.innerHTML = '<div class="no-results container"><p>جاري تحميل المنتج...</p></div>';
  }

  loadProducts()
    .then(function () {
      renderProductDetail(productId, container);
    })
    .catch(function () {
      renderProductsLoadError(container);
    });
});

function renderProductDetail(productId, container) {
  var product = getProductById(productId);

  if (!product) {
    container.innerHTML = '<div class="cart-empty"><h2>المنتج غير موجود</h2><a href="' + pagePath('products.html') + '" class="btn btn--primary mt-16">العودة للمنتجات</a></div>';
    return;
  }

  document.title = product.name + ' | ' + SITE_CONFIG.name;

  var metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = product.description.substring(0, 160);

  var discount = getDiscountPercent(product.price, product.compareAt);
  var notesHtml = '';

  if (product.notes) {
    notesHtml = '<div class="notes-table"><h4>مكونات العطر</h4><dl>' +
      (product.notes.top ? '<dt>المقدمة</dt><dd>' + product.notes.top + '</dd>' : '') +
      (product.notes.middle ? '<dt>القلب</dt><dd>' + product.notes.middle + '</dd>' : '') +
      (product.notes.base ? '<dt>القاعدة</dt><dd>' + product.notes.base + '</dd>' : '') +
    '</dl></div>';
  }

  container.innerHTML =
    '<nav class="breadcrumb container">' +
      '<a href="' + pagePath('index.html') + '">الرئيسية</a><span>/</span>' +
      '<a href="' + pagePath('products.html') + '">المنتجات</a><span>/</span>' +
      '<span>' + product.name + '</span>' +
    '</nav>' +
    '<div class="container product-detail">' +
      '<div class="product-detail__gallery">' +
        '<img src="' + assetPath(product.image) + '" alt="' + product.name + '" width="500" height="500">' +
      '</div>' +
      '<div class="product-detail__info">' +
        '<span class="product-detail__category">' + getCategoryName(product.category) + '</span>' +
        '<h1>' + product.name + '</h1>' +
        renderStarsStructure(product.reviews) +
        '<div class="product-detail__price">' +
          (product.compareAt && product.compareAt > product.price
            ? '<span class="price-compare">' + formatPrice(product.compareAt) + '</span>'
            : '') +
          '<span class="price-current">' + formatPrice(product.price) + '</span>' +
          (discount > 0 ? '<span class="product-card__badge">-' + discount + '%</span>' : '') +
        '</div>' +
        '<p class="product-detail__desc">' + product.description + '</p>' +
        notesHtml +
        '<div class="quantity-control">' +
          '<label for="qty">الكمية:</label>' +
          '<div class="quantity-control__btns">' +
            '<button type="button" id="qtyMinus" aria-label="تقليل">−</button>' +
            '<input type="number" id="qty" value="1" min="1" max="99" aria-label="الكمية">' +
            '<button type="button" id="qtyPlus" aria-label="زيادة">+</button>' +
          '</div>' +
        '</div>' +
        '<button class="btn btn--primary btn--lg btn--block" id="addToCartBtn">أضف إلى السلة</button>' +
        '<div class="payment-info">' +
          '<span>💵 ' + SITE_CONFIG.paymentMethod + '</span>' +
          '<span>🚚 توصيل ' + SITE_CONFIG.deliveryDays + '</span>' +
          '<span>📦 شحن ' + formatShippingCost(SITE_CONFIG.shippingCost) + ' — مجاني فوق ' + SITE_CONFIG.freeShippingMin.toLocaleString('ar-EG') + ' ' + SITE_CONFIG.currency + '</span>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="container">' +
      '<div class="reviews-section">' +
        '<h3>تقييمات العملاء</h3>' +
        '<div class="reviews-empty">لا توجد تقييمات بعد — كن أول من يقيّم هذا المنتج</div>' +
      '</div>' +
    '</div>' +
    '<section class="section">' +
      '<div class="container">' +
        '<div class="section__header"><h2>قد يعجبك أيضاً</h2></div>' +
        '<div class="products-grid" id="related-products"></div>' +
      '</div>' +
    '</section>';

  var related = getRelatedProducts(productId, 4);
  document.getElementById('related-products').innerHTML = related.map(renderProductCard).join('');

  var qtyInput = document.getElementById('qty');
  document.getElementById('qtyMinus').addEventListener('click', function () {
    var val = parseInt(qtyInput.value, 10) || 1;
    if (val > 1) qtyInput.value = val - 1;
  });
  document.getElementById('qtyPlus').addEventListener('click', function () {
    var val = parseInt(qtyInput.value, 10) || 1;
    if (val < 99) qtyInput.value = val + 1;
  });

  document.getElementById('addToCartBtn').addEventListener('click', function () {
    var qty = parseInt(qtyInput.value, 10) || 1;
    if (Cart.add(productId, qty)) {
      showToast('تمت إضافة ' + qty + ' قطعة إلى السلة');
    }
  });

  injectStructuredData('Product', {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: assetPath(product.image),
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'EGP',
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    }
  });
}
