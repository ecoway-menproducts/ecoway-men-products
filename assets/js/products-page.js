document.addEventListener('DOMContentLoaded', function () {
  initCommonUI('products');

  var params = new URLSearchParams(window.location.search);
  var currentCategory = params.get('category') || 'all';
  var searchQuery = params.get('q') || '';
  var focusSearch = params.get('search') === '1';

  var searchInput = document.getElementById('searchInput');
  var filterTabs = document.getElementById('filterTabs');
  var productsGrid = document.getElementById('productsGrid');
  var resultsCount = document.getElementById('resultsCount');

  if (searchInput) {
    searchInput.value = searchQuery;
    if (focusSearch) {
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function renderFilters() {
    var tabs = '<button class="filter-tab' + (currentCategory === 'all' ? ' active' : '') + '" data-category="all">الكل</button>';
    tabs += CATEGORIES.map(function (cat) {
      return '<button class="filter-tab' + (currentCategory === cat.id ? ' active' : '') + '" data-category="' + cat.id + '">' + cat.name + '</button>';
    }).join('');
    filterTabs.innerHTML = tabs;
  }

  function filterProducts() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var items = getProductsByCategory(currentCategory);

    if (query) {
      items = items.filter(function (p) {
        return p.name.toLowerCase().includes(query) ||
          getCategoryName(p.category).toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query);
      });
    }

    if (resultsCount) {
      resultsCount.textContent = items.length + ' منتج';
    }

    if (items.length === 0) {
      productsGrid.innerHTML = '<div class="no-results"><p>لا توجد منتجات مطابقة لبحثك</p></div>';
      return;
    }

    productsGrid.innerHTML = items.map(renderProductCard).join('');
  }

  renderFilters();
  filterProducts();

  filterTabs.addEventListener('click', function (e) {
    var tab = e.target.closest('.filter-tab');
    if (!tab) return;
    currentCategory = tab.dataset.category;
    renderFilters();
    filterProducts();
  });

  if (searchInput) {
    var debounce;
    searchInput.addEventListener('input', function () {
      clearTimeout(debounce);
      debounce = setTimeout(filterProducts, 300);
    });
  }
});
