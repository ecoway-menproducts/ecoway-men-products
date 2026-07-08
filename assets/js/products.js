/**
 * المنتجات — تُحمَّل من Google Sheet عبر Apps Script
 * GET → orderEndpoint?action=products
 */
var PRODUCTS = [];
var _productsPromise = null;

function getProductsApiUrl() {
  if (SITE_CONFIG.productsEndpoint) {
    return SITE_CONFIG.productsEndpoint;
  }
  var url = SITE_CONFIG.orderEndpoint || '';
  return url.split('?')[0] + '?action=products';
}

var PLACEHOLDER_IMAGE = 'assets/images/placeholder.svg';

/**
 * يحوّل أي رابط Google Drive إلى صيغة تعمل داخل <img>.
 * يدعم: /file/d/ID/view — uc?export=view&id=ID — open?id=ID — thumbnail?id=ID
 * غير روابط Drive تُعاد كما هي.
 */
function resolveImageUrl(url) {
  url = String(url || '').trim();
  if (!url) return PLACEHOLDER_IMAGE;
  if (url.indexOf('drive.google.com') === -1 && url.indexOf('lh3.googleusercontent.com') === -1) {
    return url;
  }

  var id = '';
  var m = url.match(/\/file\/d\/([^/]+)/) ||
    url.match(/[?&]id=([^&]+)/) ||
    url.match(/lh3\.googleusercontent\.com\/d\/([^=?&/]+)/);
  if (m) id = m[1];

  if (!id) return url;
  return 'https://drive.google.com/thumbnail?id=' + id + '&sz=w1000';
}

function normalizeProduct(raw) {
  var compareAt = raw.compareAt;
  if (compareAt === '' || compareAt == null || isNaN(Number(compareAt))) {
    compareAt = null;
  } else {
    compareAt = Number(compareAt);
  }

  var product = {
    id: String(raw.id || '').trim(),
    name: String(raw.name || '').trim(),
    category: String(raw.category || '').trim(),
    price: Number(raw.price) || 0,
    compareAt: compareAt,
    description: String(raw.description || '').trim(),
    image: resolveImageUrl(raw.image),
    inStock: raw.inStock !== false && raw.inStock !== 'FALSE' && raw.inStock !== 'false',
    reviews: Array.isArray(raw.reviews) ? raw.reviews : []
  };

  if (raw.notes && (raw.notes.top || raw.notes.middle || raw.notes.base)) {
    product.notes = raw.notes;
  }

  return product;
}

function loadProducts(forceReload) {
  if (!forceReload && _productsPromise) {
    return _productsPromise;
  }

  _productsPromise = fetch(getProductsApiUrl())
    .then(function (res) {
      if (!res.ok) throw new Error('تعذر الاتصال بمصدر المنتجات');
      return res.json();
    })
    .then(function (data) {
      if (!data.success || !Array.isArray(data.products)) {
        throw new Error(data.error || 'استجابة غير صالحة من Google Sheet');
      }
      PRODUCTS = data.products.map(normalizeProduct).filter(function (p) {
        return p.id && p.name;
      });
      return PRODUCTS;
    })
    .catch(function (err) {
      console.error('loadProducts:', err);
      PRODUCTS = [];
      throw err;
    });

  return _productsPromise;
}

function getProductById(id) {
  return PRODUCTS.find(function (p) { return p.id === id; });
}

function getProductsByCategory(categoryId) {
  if (!categoryId || categoryId === 'all') {
    return PRODUCTS.filter(function (p) { return p.inStock; });
  }
  return PRODUCTS.filter(function (p) {
    return p.category === categoryId && p.inStock;
  });
}

function getCategoryName(categoryId) {
  var cat = CATEGORIES.find(function (c) { return c.id === categoryId; });
  return cat ? cat.name : '';
}

function getRelatedProducts(productId, limit) {
  var product = getProductById(productId);
  if (!product) return [];
  return PRODUCTS
    .filter(function (p) { return p.id !== productId && p.inStock; })
    .sort(function (a, b) {
      if (a.category === product.category && b.category !== product.category) return -1;
      if (b.category === product.category && a.category !== product.category) return 1;
      return 0;
    })
    .slice(0, limit || 4);
}

function formatPrice(amount) {
  return amount.toLocaleString('ar-EG') + ' ' + SITE_CONFIG.currency;
}

function formatShippingCost(amount) {
  return amount === 0 ? 'مجاني' : formatPrice(amount);
}

function getDiscountPercent(price, compareAt) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

function renderProductsLoadError(container, message) {
  if (!container) return;
  container.innerHTML =
    '<div class="no-results">' +
      '<p>' + (message || 'تعذر تحميل المنتجات من Google Sheet') + '</p>' +
      '<p style="margin-top:8px;font-size:0.9rem;color:var(--color-text-muted)">تأكد من نشر Apps Script (New version) ثم حدّث الصفحة.</p>' +
      '<button type="button" class="btn btn--outline btn--sm mt-16" onclick="location.reload()">إعادة المحاولة</button>' +
    '</div>';
}
