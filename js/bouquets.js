import { apiClient, loadLocalDb } from './apiClient.js';

const state = {
  page: 1,
  limit: 8,
  category: 'all',
  isLoading: false,
  totalItems: 0,
  useLocalDb: false,
};

const list = document.querySelector('.catalogue-list.bouquets');
const loadMoreBtn = document.getElementById('load-more-btn');
const messageEl = document.querySelector('.js-bouquets-message');
const filterButtons = document.querySelectorAll('[data-filter]');

function normalizeCategory() {
  return state.category === 'all' ? '' : state.category;
}

function showMessage(text = '') {
  if (!messageEl) return;
  messageEl.textContent = text;
  messageEl.classList.toggle('is-visible', Boolean(text));
}

function setLoading(isLoading) {
  state.isLoading = isLoading;
  if (!loadMoreBtn) return;
  loadMoreBtn.disabled = isLoading;
  loadMoreBtn.textContent = isLoading ? 'Loading...' : 'Show More';
}

function getImageMarkup(item, imageClass) {
  return `
    <picture>
      <source type="image/webp" srcset="./${item.webp} 1x, ./${item.webp2x} 2x" />
      <img
        loading="lazy"
        src="./${item.image}"
        srcset="./${item.image} 1x, ./${item.image2x} 2x"
        alt="${item.title}"
        class="${imageClass}"
        width="400"
        height="296"
      />
    </picture>
  `;
}

function createBouquetMarkup(items) {
  return items
    .map(
      item => `
        <li class="catalogue-item" data-id="${item.id}" data-category="${item.category}">
          ${getImageMarkup(item, 'catalogue-img')}
          <h3 class="catalogue-item-title">${item.title}</h3>
          <p class="text catalogue-item-text">${item.description}</p>
          <p class="catalogue-item-price">$${item.price}</p>
        </li>
      `
    )
    .join('');
}

async function fetchFromServer() {
  const params = {
    _page: state.page,
    _limit: state.limit,
  };

  const category = normalizeCategory();
  if (category) {
    params.category = category;
  }

  const response = await apiClient.get('/bouquets', { params });
  const totalFromHeader = Number(response.headers['x-total-count'] || 0);

  return {
    items: Array.isArray(response.data) ? response.data : response.data?.data || [],
    total: totalFromHeader || response.data?.items || response.data?.data?.length || 0,
  };
}

async function fetchFromLocalDb() {
  const db = await loadLocalDb();
  let items = Array.isArray(db.bouquets) ? db.bouquets : [];
  const category = normalizeCategory();

  if (category) {
    items = items.filter(item => item.category === category);
  }

  const start = (state.page - 1) * state.limit;
  const end = start + state.limit;

  return {
    items: items.slice(start, end),
    total: items.length,
  };
}

async function fetchBouquets() {
  if (state.useLocalDb) {
    return fetchFromLocalDb();
  }

  try {
    return await fetchFromServer();
  } catch (error) {
    console.warn('json-server is unavailable, using local db.json fallback:', error);
    state.useLocalDb = true;
    return fetchFromLocalDb();
  }
}

function updateLoadMoreVisibility(currentItemsCount) {
  if (!loadMoreBtn) return;

  const renderedCount = list ? list.children.length : 0;
  const hasMore = currentItemsCount > 0 && renderedCount < state.totalItems;

  loadMoreBtn.style.display = hasMore ? 'inline-flex' : 'none';

  if (!hasMore && renderedCount > 0) {
    showMessage("You've viewed all bouquets in this collection.");
  }
}

async function renderBouquets({ reset = false } = {}) {
  if (!list || state.isLoading) return;

  setLoading(true);
  showMessage('');

  try {
    const { items, total } = await fetchBouquets();
    state.totalItems = total;

    if (reset) {
      list.innerHTML = '';
    }

    if (items.length === 0 && state.page === 1) {
      list.innerHTML = '';
      showMessage('No bouquets found for this filter.');
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';
      return;
    }

    list.insertAdjacentHTML('beforeend', createBouquetMarkup(items));
    updateLoadMoreVisibility(items.length);
  } catch (error) {
    console.error('Error loading bouquets:', error);
    showMessage('Something went wrong while loading bouquets. Please try again later.');
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
  } finally {
    setLoading(false);
  }
}

function setActiveFilter(activeButton) {
  filterButtons.forEach(button => {
    button.classList.toggle('is-active', button === activeButton);
  });
}

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const nextCategory = button.dataset.filter || 'all';

    if (state.category === nextCategory && state.page === 1) {
      return;
    }

    state.category = nextCategory;
    state.page = 1;
    setActiveFilter(button);
    renderBouquets({ reset: true });
  });
});

if (loadMoreBtn) {
  loadMoreBtn.addEventListener('click', () => {
    state.page += 1;
    renderBouquets();
  });
}

renderBouquets({ reset: true });
