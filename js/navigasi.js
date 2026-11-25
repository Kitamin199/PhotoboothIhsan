// Hash memberi setiap layar alamat sendiri dan mendukung tombol Kembali browser.
const layarStudio = document.getElementById('studio');
const semuaLayar = Array.from(document.querySelectorAll('[data-layar]'));
const judulLayar = {
  beranda: 'Beranda',
  'galeri-frame': 'Galeri Frame',
  studio: 'Studio Booth',
  tinjau: 'Hasil foto',
  faq: 'FAQ'
};

function tampilkanLayar() {
  let tujuan = location.hash.slice(1) || 'beranda';
  if (!Object.hasOwn(judulLayar, tujuan)) tujuan = 'beranda';
  if (tujuan === 'tinjau' && foto.length !== 3) tujuan = 'studio';
  if (location.hash && location.hash !== '#' + tujuan) {
    history.replaceState(null, '', '#' + tujuan);
  }

  const tinjau = tujuan === 'tinjau';
  const aktif = tinjau ? layarStudio : document.getElementById(tujuan);
  if (tujuan !== 'studio') matikanKamera();
  perbaruiStudio();

  for (const layar of semuaLayar) layar.hidden = layar !== aktif;
  layarStudio.classList.toggle('mode-hasil', tinjau);
  layarStudio.querySelector('.studio-heading').hidden = tinjau;
  layarStudio.querySelector('.judul-hasil').hidden = !tinjau;
  for (const tautan of navMenu.querySelectorAll('a')) {
    const dipilih = tautan.hash === '#' + aktif.id;
    tautan.classList.toggle('active', dipilih);
    if (dipilih) tautan.setAttribute('aria-current', 'page');
    else tautan.removeAttribute('aria-current');
  }

  tampilkanMenu(false);
  document.title = judulLayar[tujuan] + ' | CekRek';
  window.scrollTo({ top: 0, behavior: 'instant' });
  aktif.focus({ preventScroll: true });
}

window.addEventListener('hashchange', tampilkanLayar);
tampilkanLayar();
