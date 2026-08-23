/**
 * لوحة إدارة المنتجات — GitHub Pages + Apps Script
 * كلمة المرور تُتحقق على Google وليس في هذه الملف.
 */
(function () {
  var TOKEN_KEY = 'ecoway_admin_token';
  var adminProducts = [];
  var pendingImage = null;

  var loginPanel = document.getElementById('loginPanel');
  var dashboardPanel = document.getElementById('dashboardPanel');
  var logoutBtn = document.getElementById('logoutBtn');
  var loginForm = document.getElementById('loginForm');
  var loginError = document.getElementById('loginError');
  var tableBody = document.getElementById('productsTableBody');
  var adminStatus = document.getElementById('adminStatus');
  var productModal = document.getElementById('productModal');
  var productForm = document.getElementById('productForm');
  var categoryFilter = document.getElementById('adminCategoryFilter');
  var searchInput = document.getElementById('adminSearch');

  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY) || '';
  }

  function setToken(token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  function clearToken() {
    sessionStorage.removeItem(TOKEN_KEY);
  }

  function apiBase() {
    return (SITE_CONFIG.orderEndpoint || '').split('?')[0];
  }

  function showLoginError(msg) {
    loginError.textContent = msg;
    loginError.style.display = msg ? 'block' : 'none';
  }

  function setLoggedIn(loggedIn) {
    loginPanel.classList.toggle('hidden', loggedIn);
    dashboardPanel.classList.toggle('hidden', !loggedIn);
    logoutBtn.classList.toggle('hidden', !loggedIn);
  }

  function adminGet(action, token) {
    var url = apiBase() + '?action=' + encodeURIComponent(action) + '&token=' + encodeURIComponent(token);
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error('تعذر الاتصال بـ Apps Script');
      return res.json();
    });
  }

  function adminPost(payload) {
    return fetch(apiBase(), {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      return res.text();
    }).then(function (text) {
      try {
        return JSON.parse(text);
      } catch (err) {
        return { success: false, parseFailed: true, error: 'تعذر قراءة الاستجابة. حدّث القائمة للتحقق.' };
      }
    });
  }

  function fillCategorySelects() {
    var options = CATEGORIES.map(function (cat) {
      return '<option value="' + cat.id + '">' + cat.name + '</option>';
    }).join('');
    document.getElementById('fieldCategory').innerHTML = options;
    categoryFilter.innerHTML = '<option value="all">كل التصنيفات</option>' + options;
  }

  function filteredProducts() {
    var q = (searchInput.value || '').trim();
    var cat = categoryFilter.value;
    return adminProducts.filter(function (p) {
      if (cat && cat !== 'all' && p.category !== cat) return false;
      if (!q) return true;
      return (p.name && p.name.indexOf(q) !== -1) || (p.id && p.id.toLowerCase().indexOf(q.toLowerCase()) !== -1);
    });
  }

  function statusLabel(product) {
    if (!product.active) return '<span class="admin-badge admin-badge--muted">مخفي</span>';
    if (!product.inStock) return '<span class="admin-badge admin-badge--warn">غير متوفر</span>';
    return '<span class="admin-badge admin-badge--ok">ظاهر</span>';
  }

  function renderTable() {
    var items = filteredProducts();
    adminStatus.textContent = items.length + ' منتج';

    if (!items.length) {
      tableBody.innerHTML = '<tr><td colspan="6" class="admin-empty">لا توجد منتجات</td></tr>';
      return;
    }

    tableBody.innerHTML = items.map(function (p) {
      var img = resolveImageUrl(p.image);
      var price = formatPrice(p.price);
      if (p.compareAt && p.compareAt > p.price) {
        price = '<span class="price-compare">' + formatPrice(p.compareAt) + '</span> ' + price;
      }
      return (
        '<tr>' +
          '<td><img class="admin-thumb" src="' + img + '" alt="" onerror="this.onerror=null;this.src=\'' + assetPath('assets/images/placeholder.svg') + '\'"></td>' +
          '<td><strong>' + escapeHtml(p.name) + '</strong><br><span class="admin-id" dir="ltr">' + escapeHtml(p.id) + '</span></td>' +
          '<td>' + escapeHtml(getCategoryName(p.category) || p.category) + '</td>' +
          '<td>' + price + '</td>' +
          '<td>' + statusLabel(p) + '</td>' +
          '<td class="admin-actions">' +
            '<button type="button" class="btn btn--outline btn--sm" data-edit="' + escapeHtml(p.id) + '">تعديل</button> ' +
            '<button type="button" class="btn btn--sm admin-delete" data-delete="' + escapeHtml(p.id) + '">حذف</button>' +
          '</td>' +
        '</tr>'
      );
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function loadProducts() {
    adminStatus.textContent = 'جاري التحميل...';
    return adminGet('adminProducts', getToken()).then(function (data) {
      if (!data.success) throw new Error(data.error || 'فشل التحميل');
      adminProducts = data.products || [];
      renderTable();
    }).catch(function (err) {
      adminStatus.textContent = err.message || 'تعذر تحميل المنتجات';
      tableBody.innerHTML = '<tr><td colspan="6" class="admin-empty">تعذر التحميل. انشر نسخة جديدة من Apps Script ثم أعد المحاولة.</td></tr>';
    });
  }

  function openModal(product) {
    pendingImage = null;
    productForm.reset();
    document.getElementById('fieldInStock').checked = true;
    document.getElementById('fieldActive').checked = true;
    document.getElementById('fieldImageFile').value = '';
    document.getElementById('imagePreviewEmpty').hidden = false;

    var preview = document.getElementById('imagePreview');
    preview.hidden = true;
    preview.removeAttribute('src');

    if (product) {
      document.getElementById('modalTitle').textContent = 'تعديل المنتج';
      document.getElementById('originalId').value = product.id;
      document.getElementById('fieldId').value = product.id;
      document.getElementById('fieldId').readOnly = true;
      document.getElementById('fieldName').value = product.name || '';
      document.getElementById('fieldCategory').value = product.category || '';
      document.getElementById('fieldPrice').value = product.price || 0;
      document.getElementById('fieldCompareAt').value = product.compareAt || '';
      document.getElementById('fieldDescription').value = product.description || '';
      document.getElementById('fieldImageUrl').value = product.image || '';
      document.getElementById('fieldInStock').checked = product.inStock === true;
      document.getElementById('fieldActive').checked = product.active === true;
      document.getElementById('fieldNotesTop').value = product.notes_top || (product.notes && product.notes.top) || '';
      document.getElementById('fieldNotesMiddle').value = product.notes_middle || (product.notes && product.notes.middle) || '';
      document.getElementById('fieldNotesBase').value = product.notes_base || (product.notes && product.notes.base) || '';
      if (product.image) {
        preview.src = resolveImageUrl(product.image);
        preview.hidden = false;
        document.getElementById('imagePreviewEmpty').hidden = true;
      }
    } else {
      document.getElementById('modalTitle').textContent = 'منتج جديد';
      document.getElementById('originalId').value = '';
      document.getElementById('fieldId').readOnly = false;
      document.getElementById('fieldImageUrl').value = '';
    }

    productModal.classList.remove('hidden');
  }

  function closeModal() {
    productModal.classList.add('hidden');
    pendingImage = null;
  }

  function compressImage(file) {
    return new Promise(function (resolve, reject) {
      if (!file || !file.type || file.type.indexOf('image/') !== 0) {
        reject(new Error('اختر ملف صورة'));
        return;
      }
      if (file.size > 12 * 1024 * 1024) {
        reject(new Error('الصورة كبيرة جداً. استخدم صورة أصغر من 12 ميجا'));
        return;
      }

      var reader = new FileReader();
      reader.onerror = function () { reject(new Error('تعذر قراءة الصورة')); };
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          var maxW = 1400;
          var w = img.width;
          var h = img.height;
          if (w > maxW) {
            h = Math.round(h * maxW / w);
            w = maxW;
          }
          var canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          var ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          var dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve({
            mimeType: 'image/jpeg',
            fileName: (file.name || 'product').replace(/\.[^.]+$/, '') + '.jpg',
            base64: dataUrl.split(',')[1],
            preview: dataUrl
          });
        };
        img.onerror = function () { reject(new Error('ملف الصورة غير صالح')); };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function collectFormProduct() {
    var compareAt = document.getElementById('fieldCompareAt').value.trim();
    return {
      id: document.getElementById('fieldId').value.trim(),
      name: document.getElementById('fieldName').value.trim(),
      category: document.getElementById('fieldCategory').value,
      price: Number(document.getElementById('fieldPrice').value),
      compareAt: compareAt === '' ? '' : Number(compareAt),
      description: document.getElementById('fieldDescription').value.trim(),
      image: document.getElementById('fieldImageUrl').value.trim(),
      inStock: document.getElementById('fieldInStock').checked,
      active: document.getElementById('fieldActive').checked,
      notes_top: document.getElementById('fieldNotesTop').value.trim(),
      notes_middle: document.getElementById('fieldNotesMiddle').value.trim(),
      notes_base: document.getElementById('fieldNotesBase').value.trim()
    };
  }

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var password = document.getElementById('adminPassword').value.trim();
    var btn = document.getElementById('loginSubmit');
    btn.disabled = true;
    showLoginError('');

    adminGet('adminAuth', password).then(function (data) {
      if (!data.success) throw new Error(data.error || 'كلمة المرور غير صحيحة');
      setToken(password);
      setLoggedIn(true);
      return loadProducts();
    }).catch(function (err) {
      showLoginError(err.message || 'تعذر الدخول. انشر نسخة جديدة من Apps Script.');
    }).then(function () {
      btn.disabled = false;
    });
  });

  logoutBtn.addEventListener('click', function () {
    clearToken();
    setLoggedIn(false);
    document.getElementById('adminPassword').value = '';
  });

  document.getElementById('addProductBtn').addEventListener('click', function () {
    openModal(null);
  });

  searchInput.addEventListener('input', renderTable);
  categoryFilter.addEventListener('change', renderTable);

  tableBody.addEventListener('click', function (e) {
    var editId = e.target.getAttribute('data-edit');
    var deleteId = e.target.getAttribute('data-delete');
    if (editId) {
      var product = adminProducts.find(function (p) { return p.id === editId; });
      if (product) openModal(product);
    }
    if (deleteId) {
      var item = adminProducts.find(function (p) { return p.id === deleteId; });
      if (!item) return;
      if (!window.confirm('حذف المنتج «' + item.name + '»؟')) return;
      adminPost({
        adminAction: 'deleteProduct',
        token: getToken(),
        id: deleteId
      }).then(function (data) {
        if (data.parseFailed) return loadProducts();
        if (!data.success) throw new Error(data.error || 'فشل الحذف');
        showToast('تم حذف المنتج');
        return loadProducts();
      }).catch(function (err) {
        showToast(err.message || 'فشل الحذف', 'error');
      });
    }
  });

  productModal.addEventListener('click', function (e) {
    if (e.target.hasAttribute('data-close-modal')) closeModal();
  });

  document.getElementById('fieldImageFile').addEventListener('change', function () {
    var file = this.files && this.files[0];
    if (!file) {
      pendingImage = null;
      return;
    }
    compressImage(file).then(function (img) {
      pendingImage = img;
      var preview = document.getElementById('imagePreview');
      preview.src = img.preview;
      preview.hidden = false;
      document.getElementById('imagePreviewEmpty').hidden = true;
    }).catch(function (err) {
      pendingImage = null;
      showToast(err.message || 'تعذر تجهيز الصورة', 'error');
    });
  });

  productForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var product = collectFormProduct();
    if (!/^[a-zA-Z0-9_-]+$/.test(product.id)) {
      showToast('المعرف يجب أن يكون إنجليزي/أرقام فقط', 'error');
      return;
    }

    var btn = document.getElementById('saveProductBtn');
    btn.disabled = true;
    btn.textContent = pendingImage ? 'جاري رفع الصورة والحفظ...' : 'جاري الحفظ...';

    var payload = {
      adminAction: 'saveProduct',
      token: getToken(),
      originalId: document.getElementById('originalId').value || product.id,
      product: product
    };

    if (pendingImage) {
      payload.imageBase64 = pendingImage.base64;
      payload.imageMimeType = pendingImage.mimeType;
      payload.imageFileName = pendingImage.fileName;
    }

    adminPost(payload).then(function (data) {
      if (data.parseFailed) {
        showToast('تم الإرسال. جاري التحقق من الشيت...');
        return loadProducts().then(function () { closeModal(); });
      }
      if (!data.success) throw new Error(data.error || 'فشل الحفظ');
      showToast('تم حفظ المنتج');
      closeModal();
      return loadProducts();
    }).catch(function (err) {
      showToast(err.message || 'فشل الحفظ', 'error');
    }).then(function () {
      btn.disabled = false;
      btn.textContent = 'حفظ';
    });
  });

  fillCategorySelects();

  var existing = getToken();
  if (existing) {
    adminGet('adminAuth', existing).then(function (data) {
      if (!data.success) throw new Error('expired');
      setLoggedIn(true);
      return loadProducts();
    }).catch(function () {
      clearToken();
      setLoggedIn(false);
    });
  }
})();
