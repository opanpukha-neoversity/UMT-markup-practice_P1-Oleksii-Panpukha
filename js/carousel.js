(() => {
  function initCarousel({
    wrapperSelector,
    listSelector,
    prevButtonSelector,
    nextButtonSelector,
    dotsSelector,
    dotClass = 'dot',
    activeDotClass = 'active',
    disabledButtonClass = 'is-disabled',
  }) {
    const wrapper = document.querySelector(wrapperSelector);
    if (!wrapper) return;

    const list = wrapper.querySelector(listSelector);
    const prevButton = wrapper.querySelector(prevButtonSelector);
    const nextButton = wrapper.querySelector(nextButtonSelector);
    const dotsContainer = wrapper.querySelector(dotsSelector);

    if (!list || list.children.length === 0) return;

    const items = Array.from(list.children);
    let dots = [];

    const getGap = () => {
      return parseFloat(window.getComputedStyle(list).gap) || 0;
    };

    const getStep = () => {
      const firstItem = items[0];
      if (!firstItem) return 0;

      const itemWidth = firstItem.getBoundingClientRect().width;
      return itemWidth + getGap();
    };

    const getCurrentIndex = () => {
      const step = getStep();
      if (step === 0) return 0;

      return Math.round(list.scrollLeft / step);
    };

    const getMaxIndex = () => {
      return items.length - 1;
    };

    const scrollToIndex = (index) => {
      const safeIndex = Math.max(0, Math.min(index, getMaxIndex()));
      const step = getStep();

      list.scrollTo({
        left: safeIndex * step,
        behavior: 'smooth',
      });
    };

    const updateDots = () => {
      if (!dots.length) return;

      const currentIndex = getCurrentIndex();

      dots.forEach((dot, index) => {
        dot.classList.toggle(activeDotClass, index === currentIndex);
      });
    };

    const updateButtons = () => {
      const currentIndex = getCurrentIndex();
      const maxIndex = getMaxIndex();

      if (prevButton) {
        const isDisabled = currentIndex <= 0;
        prevButton.disabled = isDisabled;
        prevButton.classList.toggle(disabledButtonClass, isDisabled);
      }

      if (nextButton) {
        const isDisabled = currentIndex >= maxIndex;
        nextButton.disabled = isDisabled;
        nextButton.classList.toggle(disabledButtonClass, isDisabled);
      }
    };

    const updateUI = () => {
      updateDots();
      updateButtons();
    };

    const createDots = () => {
      if (!dotsContainer) return;

      dotsContainer.innerHTML = '';

      items.forEach((_, index) => {
        const dot = document.createElement('li');
        dot.classList.add(dotClass);

        if (index === 0) {
          dot.classList.add(activeDotClass);
        }

        dot.addEventListener('click', () => {
          scrollToIndex(index);
        });

        dotsContainer.appendChild(dot);
      });

      dots = Array.from(dotsContainer.querySelectorAll(`.${dotClass}`));
    };

    if (prevButton) {
      prevButton.addEventListener('click', () => {
        scrollToIndex(getCurrentIndex() - 1);
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        scrollToIndex(getCurrentIndex() + 1);
      });
    }

    let isTicking = false;

    list.addEventListener('scroll', () => {
      if (isTicking) return;

      isTicking = true;

      requestAnimationFrame(() => {
        updateUI();
        isTicking = false;
      });
    });

    window.addEventListener('resize', updateUI);

    createDots();
    updateUI();
  }

  initCarousel({
    wrapperSelector: '.bestsellers-slider-wrapper',
    listSelector: '.bestsellers-list',
    prevButtonSelector: '.prev-btn',
    nextButtonSelector: '.next-btn',
    dotsSelector: '.pagination-dots',
  });

  initCarousel({
    wrapperSelector: '.feedback-slider-wrapper',
    listSelector: '.feedbacks-list',
    prevButtonSelector: '.prev-btn',
    nextButtonSelector: '.next-btn',
    dotsSelector: '.pagination-dots',
  });
})();
