const scrollToTopBtn = document.getElementById('scrollToTop');

if (scrollToTopBtn) {
  window.addEventListener('scroll', () => {
    scrollToTopBtn.classList.toggle('show', window.scrollY > 300);
  });

  scrollToTopBtn.addEventListener('click', (evt) => {
    evt.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
}
