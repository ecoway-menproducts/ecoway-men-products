document.addEventListener('DOMContentLoaded', function () {
  initCommonUI('cart');

  var itemsEl = document.getElementById('cart-items');
  var summaryEl = document.getElementById('cart-summary');
  var emptyEl = document.getElementById('cart-empty');
  var layoutEl = document.getElementById('cart-layout');

  function render() {
    var items = Cart.get();

    if (items.length === 0) {
      layoutEl.classList.add('hidden');
      emptyEl.classList.remove('hidden');
      return;
    }

    layoutEl.classList.remove('hidden');
    emptyEl.classList.add('hidden');

    itemsEl.innerHTML = items.map(function (item) {
      return (
        '<div class="cart-item" data-id="' + item.id + '">' +
          '<div class="cart-item__image">' +
            '<img src="' + assetPath(item.image) + '" alt="' + item.name + '" width="80" height="80">' +
          '</div>' +
          '<div class="cart-item__info">' +
            '<h3>' + item.name + '</h3>' +
            '<div class="cart-item__price">' + formatPrice(item.price) + '</div>' +
            '<div class="cart-item__actions">' +
              '<div class="quantity-control__btns">' +
                '<button type="button" class="cart-qty-minus" data-id="' + item.id + '" aria-label="تقليل">−</button>' +
                '<input type="number" value="' + item.quantity + '" min="1" max="99" readonly aria-label="الكمية">' +
                '<button type="button" class="cart-qty-plus" data-id="' + item.id + '" aria-label="زيادة">+</button>' +
              '</div>' +
              '<button class="cart-item__remove" data-id="' + item.id + '">حذف</button>' +
            '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    var subtotal = Cart.getSubtotal();
    var shipping = Cart.getShippingCost();
    summaryEl.innerHTML =
      '<h3>ملخص الطلب</h3>' +
      '<div class="summary-row"><span>المجموع الفرعي</span><span>' + formatPrice(subtotal) + '</span></div>' +
      '<div class="summary-row"><span>الشحن (تقديري)</span><span>' + formatShippingCost(shipping) + '</span></div>' +
      '<div class="summary-row summary-row--total"><span>الإجمالي</span><span>' + formatPrice(Cart.getTotal(shipping)) + '</span></div>' +
      '<p class="shipping-note">💡 التوصيل خلال ' + SITE_CONFIG.deliveryDays + '. توصيل مجاني للطلبات أكثر من ' + SITE_CONFIG.freeShippingMin.toLocaleString('ar-EG') + ' جنيه.</p>' +
      '<a href="' + pagePath('checkout.html') + '" class="btn btn--primary btn--block btn--lg mt-16">إتمام الطلب</a>' +
      '<a href="' + pagePath('products.html') + '" class="btn btn--outline btn--block mt-16">متابعة التسوق</a>';
  }

  render();

  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('cart-qty-minus')) {
      var id = e.target.dataset.id;
      var item = Cart.get().find(function (i) { return i.id === id; });
      if (item) Cart.updateQuantity(id, item.quantity - 1);
      render();
    }
    if (e.target.classList.contains('cart-qty-plus')) {
      var id2 = e.target.dataset.id;
      var item2 = Cart.get().find(function (i) { return i.id === id2; });
      if (item2) Cart.updateQuantity(id2, item2.quantity + 1);
      render();
    }
    if (e.target.classList.contains('cart-item__remove')) {
      Cart.remove(e.target.dataset.id);
      showToast('تم حذف المنتج من السلة');
      render();
    }
  });

  window.addEventListener('cartUpdated', render);
});
