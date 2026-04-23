(() => {
    const menuBtnRef = document.querySelector('[data-menu-button]');
    const mobileMenuRef = document.querySelector('[data-menu]');

    if (!menuBtnRef || !mobileMenuRef) return;

    const menuLinks = mobileMenuRef.querySelectorAll('a, button');

    const toggleMenu = () => {
        const expanded = menuBtnRef.getAttribute('aria-expanded') === 'true';

        menuBtnRef.classList.toggle('is-open');
        menuBtnRef.setAttribute('aria-expanded', String(!expanded));
        mobileMenuRef.classList.toggle('is-open');
        document.body.classList.toggle('menu-open');
    };

    menuBtnRef.addEventListener('click', toggleMenu);

    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenuRef.classList.contains('is-open')) {
                toggleMenu();
            }
        });
    });
})();