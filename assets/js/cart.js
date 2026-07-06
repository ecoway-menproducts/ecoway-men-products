/**
 * سلة التسوق — localStorage
 */
const CART_KEY = 'ecoway_men_cart';

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

  add: function (productId, quantity) {
    quantity = quantity || 1;
    var product = getProductById(productId);
    if (!product || !product.inStock) return false;

    var items = this.get();
    var existing = items.find(function (i) { return i.id === productId; });

    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity
      });
    }

    this.save(items);
    return true;
  },

  updateQuantity: function (productId, quantity) {
    var items = this.get();
    var item = items.find(function (i) { return i.id === productId; });
    if (!item) return;

    if (quantity <= 0) {
      this.remove(productId);
      return;
    }

    item.quantity = quantity;
    this.save(items);
  },

  remove: function (productId) {
    var items = this.get().filter(function (i) { return i.id !== productId; });
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
