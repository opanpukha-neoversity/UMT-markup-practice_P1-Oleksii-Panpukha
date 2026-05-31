import { apiClient, loadLocalDb } from './apiClient.js';

function getImageMarkup(item, imageClass, width, height) {
  return `
    <picture>
      <source type="image/webp" srcset="./${item.webp} 1x, ./${item.webp2x} 2x" />
      <img
        loading="lazy"
        src="./${item.image}"
        srcset="./${item.image} 1x, ./${item.image2x} 2x"
        alt="${item.title}"
        class="${imageClass}"
        width="${width}"
        height="${height}"
      />
    </picture>
  `;
}

function renderBestsellers(items) {
  const list = document.querySelector('.bestsellers-list');
  if (!list) return;

  list.innerHTML = items
    .map(
      item => `
        <li class="bestsellers-item">
          ${getImageMarkup(item, 'bestsellers-img', 400, 320)}
          <h3 class="bestsellers-item-title">${item.title}</h3>
          <p class="text bestsellers-item-text">${item.description}</p>
          <p class="bestsellers-item-price">$${item.price}</p>
        </li>
      `
    )
    .join('');
}

function renderFeedbacks(items) {
  const list = document.querySelector('.feedbacks-list');
  if (!list) return;

  list.innerHTML = items
    .map(
      item => `
        <li class="feedbacks-item">
          <p class="text">"${item.text}"</p>
          <p class="feedback-person">${item.author}</p>
        </li>
      `
    )
    .join('');
}

async function getCollection(endpoint, key) {
  try {
    const response = await apiClient.get(endpoint);
    return Array.isArray(response.data) ? response.data : response.data?.data || [];
  } catch (error) {
    console.warn(`Failed to load ${key} from API, using local db.json:`, error);
    const db = await loadLocalDb();
    return Array.isArray(db[key]) ? db[key] : [];
  }
}

function setupSlider({ wrapperSelector, listSelector, prevButtonSelector, nextButtonSelector, dotsSelector }) {
  const wrapper = document.querySelector(wrapperSelector);
  if (!wrapper) return;

  const list = wrapper.querySelector(listSelector);
  const prevButton = wrapper.querySelector(prevButtonSelector);
  const nextButton = wrapper.querySelector(nextButtonSelector);
  const dotsContainer = wrapper.querySelector(dotsSelector);

  if (!list || list.children.length === 0) return;

  let dots = [];

  const getGap = () => parseFloat(window.getComputedStyle(list).gap) || 0;
  const getStep = () => (list.children[0]?.getBoundingClientRect().width || 0) + getGap();
  const getCurrentIndex = () => {
    const step = getStep();
    return step ? Math.round(list.scrollLeft / step) : 0;
  };
  const getMaxIndex = () => Math.max(0, list.children.length - 1);

  const scrollToIndex = index => {
    const safeIndex = Math.max(0, Math.min(index, getMaxIndex()));
    list.scrollTo({ left: safeIndex * getStep(), behavior: 'smooth' });
  };

  const updateDots = () => {
    const currentIndex = getCurrentIndex();
    dots.forEach((dot, index) => dot.classList.toggle('active', index === currentIndex));
  };

  const updateButtons = () => {
    const currentIndex = getCurrentIndex();
    if (prevButton) prevButton.disabled = currentIndex <= 0;
    if (nextButton) nextButton.disabled = currentIndex >= getMaxIndex();
  };

  const createDots = () => {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';

    Array.from(list.children).forEach((_, index) => {
      const dot = document.createElement('li');
      dot.classList.add('dot');
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => scrollToIndex(index));
      dotsContainer.appendChild(dot);
    });

    dots = Array.from(dotsContainer.querySelectorAll('.dot'));
  };

  prevButton?.addEventListener('click', () => scrollToIndex(getCurrentIndex() - 1));
  nextButton?.addEventListener('click', () => scrollToIndex(getCurrentIndex() + 1));

  list.addEventListener('scroll', () => {
    requestAnimationFrame(() => {
      updateDots();
      updateButtons();
    });
  });

  window.addEventListener('resize', () => {
    requestAnimationFrame(() => {
      createDots();
      updateDots();
      updateButtons();
    });
  });

  createDots();
  updateDots();
  updateButtons();
}

async function initDynamicSliders() {
  const [bestsellers, feedbacks] = await Promise.all([
    getCollection('/bestsellers', 'bestsellers'),
    getCollection('/feedbacks', 'feedbacks'),
  ]);

  renderBestsellers(bestsellers);
  renderFeedbacks(feedbacks);

  setupSlider({
    wrapperSelector: '.bestsellers-slider-wrapper',
    listSelector: '.bestsellers-list',
    prevButtonSelector: '.prev-btn',
    nextButtonSelector: '.next-btn',
    dotsSelector: '.pagination-dots',
  });

  setupSlider({
    wrapperSelector: '.feedback-slider-wrapper',
    listSelector: '.feedbacks-list',
    prevButtonSelector: '.prev-btn',
    nextButtonSelector: '.next-btn',
    dotsSelector: '.pagination-dots',
  });
}

initDynamicSliders().catch(error => {
  console.error('Error loading slider data:', error);
});
