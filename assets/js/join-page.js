document.addEventListener('DOMContentLoaded', function () {
  initCommonUI('join');

  var form = document.getElementById('joinForm');
  var successEl = document.getElementById('join-success');
  var birthYearSelect = document.getElementById('birthYear');
  var ageInput = document.getElementById('age');
  var governorateSelect = document.getElementById('governorate');
  var preferredTimeSelect = document.getElementById('preferredTime');
  var bioGroup = document.getElementById('experienceBioGroup');
  var bioField = document.getElementById('experienceBio');
  var currentYear = new Date().getFullYear();

  var CONTACT_TIMES = [
    'من 10 ص إلى 11 ص',
    'من 11 ص إلى 12 م',
    'من 12 م إلى 1 م',
    'من 1 م إلى 2 م',
    'من 2 م إلى 3 م',
    'من 3 م إلى 4 م',
    'من 4 م إلى 5 م',
    'من 5 م إلى 6 م',
    'من 6 م إلى 7 م',
    'من 7 م إلى 8 م',
    'من 8 م إلى 9 م'
  ];

  for (var age = 18; age <= 60; age++) {
    var year = currentYear - age;
    var yearOpt = document.createElement('option');
    yearOpt.value = String(year);
    yearOpt.textContent = String(year);
    birthYearSelect.appendChild(yearOpt);
  }

  GOVERNORATES.forEach(function (gov) {
    var opt = document.createElement('option');
    opt.value = gov;
    opt.textContent = gov;
    governorateSelect.appendChild(opt);
  });

  CONTACT_TIMES.forEach(function (slot) {
    var opt = document.createElement('option');
    opt.value = slot;
    opt.textContent = slot;
    preferredTimeSelect.appendChild(opt);
  });

  function updateAge() {
    var year = parseInt(birthYearSelect.value, 10);
    ageInput.value = year ? String(currentYear - year) : '';
  }

  birthYearSelect.addEventListener('change', updateAge);

  function syncExperienceBio() {
    var selected = form.querySelector('input[name="hasMarketingExp"]:checked');
    var isYes = selected && selected.value === 'yes';
    bioGroup.classList.toggle('hidden', !isYes);
    bioField.required = !!isYes;
    if (!isYes) {
      bioField.value = '';
      bioGroup.classList.remove('form-group--error');
    }
  }

  form.querySelectorAll('input[name="hasMarketingExp"]').forEach(function (radio) {
    radio.addEventListener('change', syncExperienceBio);
  });

  function setGroupError(group, errorEl, msg) {
    if (group) group.classList.toggle('form-group--error', !!msg);
    if (errorEl) {
      errorEl.textContent = msg || '';
      errorEl.style.display = msg ? 'block' : 'none';
    }
  }

  function clearGroupError(errorEl) {
    if (!errorEl) return;
    errorEl.textContent = '';
    errorEl.style.display = 'none';
    var group = errorEl.closest('.form-group');
    if (group) group.classList.remove('form-group--error');
  }

  function validateField(field) {
    if (!field || field.type === 'radio' || field.type === 'checkbox') return true;
    var group = field.closest('.form-group');
    var errorEl = group ? group.querySelector('.form-error') : null;
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

    if (group) group.classList.toggle('form-group--error', !valid);
    if (errorEl) errorEl.textContent = msg;
    return valid;
  }

  form.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]), select, textarea').forEach(function (field) {
    field.addEventListener('blur', function () { validateField(field); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var allValid = true;
    form.querySelectorAll('[required]').forEach(function (field) {
      if (field.type === 'radio' || field.type === 'checkbox') return;
      if (!field.closest('.hidden') && !validateField(field)) allValid = false;
    });

    var expSelected = form.querySelector('input[name="hasMarketingExp"]:checked');
    if (!expSelected) {
      allValid = false;
      setGroupError(
        form.querySelector('input[name="hasMarketingExp"]').closest('.form-group'),
        document.getElementById('expError'),
        'اختر نعم أو لا'
      );
    } else {
      clearGroupError(document.getElementById('expError'));
    }

    if (expSelected && expSelected.value === 'yes' && !bioField.value.trim()) {
      allValid = false;
      validateField(bioField);
    }

    if (!allValid) {
      showToast('يرجى تصحيح الأخطاء في النموذج', 'error');
      return;
    }

    var submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'جاري التسجيل...';

    var payload = {
      formType: 'join',
      fullName: form.fullName.value.trim(),
      phone: form.phone.value.replace(/\s/g, ''),
      birthYear: form.birthYear.value,
      age: ageInput.value,
      governorate: form.governorate.value,
      hasMarketingExp: expSelected.value === 'yes' ? 'نعم' : 'لا',
      experienceBio: expSelected.value === 'yes' ? bioField.value.trim() : '',
      preferredTimes: preferredTimeSelect.value,
      notes: form.notes.value.trim(),
      date: new Date().toISOString()
    };

    fetch(SITE_CONFIG.orderEndpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function () {
      form.classList.add('hidden');
      successEl.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    })
    .catch(function () {
      form.classList.add('hidden');
      successEl.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
});
