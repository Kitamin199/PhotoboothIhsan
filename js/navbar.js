const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

function tampilkanMenu(terbuka) {
  navMenu.classList.toggle('active', terbuka);
  menuToggle.setAttribute('aria-expanded', String(terbuka));
}

menuToggle.addEventListener('click', () => {
  tampilkanMenu(!navMenu.classList.contains('active'));
});

navMenu.addEventListener('click', () => tampilkanMenu(false));
