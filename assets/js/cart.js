/**
 * سلة التسوق — localStorage
 */
const CART_KEY = 'ecoway_men_cart';

function cartLineKey(productId, detail) {
  return String(productId || '') + '|' + String(detail || '').trim();
}

function getCartItemKey(item) {
  if (!item) return '';
  if (item.cartKey) return item.cartKey;
  return cartLineKey(item.id, item.detail);
}

const Cart = {
  get: function () {
    try {
      var data = localStorage.getItem(CART_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  save: function (items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    this.updateBadge();
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  },

  add: function (productId, quantity, detail) {
    quantity = quantity || 1;
    detail = String(detail || '').trim();
    var product = getProductById(productId);
    if (!product || !product.inStock) return false;

    var options = typeof getDetailOptions === 'function' ? getDetailOptions(product) : [];
    if (options.length === 1 && !detail) detail = options[0];
    if (options.length > 1 && options.indexOf(detail) === -1) return false;

    var key = cartLineKey(productId, detail);
    var items = this.get();
    var existing = items.find(function (i) { return getCartItemKey(i) === key; });

    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({
        id: product.id,
        cartKey: key,
        name: product.name,
        detail: detail,
        detailType: product.detailType || 'none',
        price: product.price,
        image: product.image,
        quantity: quantity
      });
    }

    this.save(items);
    bounceCartBadges();
    return true;
  },

  updateQuantity: function (lineKey, quantity) {
    var items = this.get();
    var item = items.find(function (i) { return getCartItemKey(i) === lineKey; });
    if (!item) return;

    if (quantity <= 0) {
      this.remove(lineKey);
      return;
    }

    item.quantity = quantity;
    this.save(items);
  },

  remove: function (lineKey) {
    var items = this.get().filter(function (i) { return getCartItemKey(i) !== lineKey; });
    this.save(items);
  },

  clear: function () {
    localStorage.removeItem(CART_KEY);
    this.updateBadge();
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  },

  getCount: function () {
    return this.get().reduce(function (sum, i) { return sum + i.quantity; }, 0);
  },

  getSubtotal: function () {
    return this.get().reduce(function (sum, i) { return sum + i.price * i.quantity; }, 0);
  },

  getShippingCost: function () {
    if (this.getSubtotal() >= SITE_CONFIG.freeShippingMin) return 0;
    return SITE_CONFIG.shippingCost;
  },

  getTotal: function (shipping) {
    return this.getSubtotal() + (shipping != null ? shipping : this.getShippingCost());
  },

  updateBadge: function () {
    var count = this.getCount();
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }
};

function assetPath(path) {
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  var base = SITE_CONFIG.basePath;
  if (base === './') return path;
  return base + path.replace(/^\.\//, '');
}

function pagePath(filename) {
  var base = SITE_CONFIG.basePath;
  if (base === './') return filename;
  return base + filename;
}

function bounceCartBadges() {
  document.querySelectorAll('[data-cart-count]').forEach(function (el) {
    el.classList.remove('is-bounce');
    void el.offsetWidth;
    el.classList.add('is-bounce');
  });
}

function showToast(message, type) {
  var existing = document.querySelector('.toast');
  if (existing) existing.remove();

  var toast = document.createElement('div');
  toast.className = 'toast toast--' + (type || 'success');
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(function () {
    toast.classList.add('toast--visible');
  });

  setTimeout(function () {
    toast.classList.remove('toast--visible');
    setTimeout(function () { toast.remove(); }, 300);
  }, 2800);
}
