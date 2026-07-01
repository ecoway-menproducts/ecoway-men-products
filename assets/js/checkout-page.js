document.addEventListener('DOMContentLoaded', function () {
  initCommonUI('checkout');

  var form = document.getElementById('checkoutForm');
  var summaryEl = document.getElementById('checkout-summary');
  var successEl = document.getElementById('order-success');
  var layoutEl = document.getElementById('checkout-layout');
  var governorateSelect = document.getElementById('governorate');

  if (Cart.get().length === 0) {
    layoutEl.innerHTML = '<div class="cart-empty"><div class="cart-empty__icon">🛒</div><h2>سلتك فارغة</h2><p>أضف منتجات قبل إتمام الطلب</p><a href="' + pagePath('products.html') + '" class="btn btn--primary">تصفح المنتجات</a></div>';
    return;
  }

  GOVERNORATES.forEach(function (gov) {
    var opt = document.createElement('option');
    opt.value = gov;
    opt.textContent = gov;
    governorateSelect.appendChild(opt);
  });

  function renderSummary() {
    var items = Cart.get();
    var subtotal = Cart.getSubtotal();
    var shipping = SITE_CONFIG.shippingCost;
    var total = Cart.getTotal(shipping);

    var itemsHtml = items.map(function (item) {
      return '<div class="summary-row"><span>' + item.name + ' × ' + item.quantity + '</span><span>' + formatPrice(item.price * item.quantity) + '</span></div>';
    }).join('');

    summaryEl.innerHTML =
      '<h3>ملخص الطلب</h3>' +
      itemsHtml +
      '<div class="summary-row"><span>المجموع الفرعي</span><span>' + formatPrice(subtotal) + '</span></div>' +
      '<div class="summary-row"><span>الشحن</span><span id="shippingCost">' + formatPrice(shipping) + '</span></div>' +
      '<div class="summary-row summary-row--total"><span>الإجمالي</span><span id="totalCost">' + formatPrice(total) + '</span></div>' +
      '<p class="shipping-note">🚚 التوصيل خلال ' + SITE_CONFIG.deliveryDays + '<br>💵 ' + SITE_CONFIG.paymentMethod + '</p>';
  }

  renderSummary();

  governorateSelect.addEventListener('change', function () {
    var shipping = SITE_CONFIG.shippingCost;
    document.getElementById('shippingCost').textContent = formatPrice(shipping);
    document.getElementById('totalCost').textContent = formatPrice(Cart.getTotal(shipping));
  });

  function validateField(field) {
    var group = field.closest('.form-group');
    var errorEl = group.querySelector('.form-error');
    var valid = true;
    var msg = '';

    if (field.required && !field.value.trim()) {
      valid = false;
      msg = 'هذا الحقل مطلوب';
    } else if (field.type === 'tel' && field.value.trim()) {
      var phone = field.value.replace(/\s/g, '');
      if (!/^(01)[0-9]{9}$/.test(phone)) {
        valid = false;
        msg = 'أدخل رقم هاتف مصري صحيح (11 رقم)';
      }
    }

    group.classList.toggle('form-group--error', !valid);
    if (errorEl) errorEl.textContent = msg;
    return valid;
  }

  form.querySelectorAll('input, select, textarea').forEach(function (field) {
    field.addEventListener('blur', function () { validateField(field); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var fields = form.querySelectorAll('[required]');
    var allValid = true;
    fields.forEach(function (field) {
      if (!validateField(field)) allValid = false;
    });

    if (!allValid) {
      showToast('يرجى تصحيح الأخطاء في النموذج', 'error');
      return;
    }

    var submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'جاري إرسال الطلب...';

    var items = Cart.get();
    var shipping = SITE_CONFIG.shippingCost;
    var orderData = {
      customerName: form.customerName.value.trim(),
      phone: form.phone.value.trim(),
      address: form.address.value.trim(),
      governorate: form.governorate.value,
      notes: form.notes.value.trim(),
      products: items.map(function (i) {
        return { name: i.name, quantity: i.quantity, price: i.price, total: i.price * i.quantity };
      }),
      subtotal: Cart.getSubtotal(),
      shipping: shipping,
      totalPrice: Cart.getTotal(shipping),
      paymentMethod: SITE_CONFIG.paymentMethod,
      date: new Date().toISOString()
    };

    fetch(SITE_CONFIG.orderEndpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    })
    .then(function () {
      Cart.clear();
      layoutEl.classList.add('hidden');
      successEl.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    })
    .catch(function () {
      Cart.clear();
      layoutEl.classList.add('hidden');
      successEl.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
});
