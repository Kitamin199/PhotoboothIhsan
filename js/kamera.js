// Setiap slot ditulis sebagai [jarak dari kiri, jarak dari atas, lebar, tinggi].
const daftarFrame = {
  1: {
    nama: 'Red Varsity Club',
    lebar: 734,
    tinggi: 1800,
    slot: [
      [41, 32, 656, 447],
      [41, 516, 656, 447],
      [41, 1000, 656, 447]
    ]
  },
  2: {
    nama: 'Gingham Picnic',
    lebar: 623,
    tinggi: 1800,
    slot: [
      [60, 60, 502, 500],
      [60, 629, 502, 500],
      [60, 1198, 502, 500]
    ]
  },
  3: {
    nama: 'SRIFOTON 2026',
    lebar: 600,
    tinggi: 1800,
    slot: [
      [36, 295, 529, 404],
      [36, 745, 529, 404],
      [36, 1195, 529, 404]
    ]
  },
  4: {
    nama: 'Sunny Goldfish Booth',
    lebar: 800,
    tinggi: 1800,
    slot: [
      [68, 84, 676, 410],
      [68, 612, 676, 410],
      [68, 1138, 676, 410]
    ]
  },
  5: {
    nama: 'Velvet Leopard Strip',
    lebar: 808,
    tinggi: 1808,
    slot: [
      [60, 67, 697, 496],
      [52, 643, 697, 514],
      [60, 1227, 697, 496]
    ]
  },
  6: {
    nama: 'Hibachi Mana Pastel',
    lebar: 770,
    tinggi: 2178,
    slot: [
      [42, 53, 687, 586],
      [42, 693, 687, 585],
      [42, 1332, 687, 586]
    ]
  }
};

const kamera = document.getElementById('kamera');
const hasil = document.getElementById('hasil');
const namaFrame = document.getElementById('nama-frame');
const pesan = document.getElementById('pesan');
const nyalakan = document.getElementById('nyalakan');
const jepret = document.getElementById('jepret');
const ulang = document.getElementById('ulang');
const unduh = document.getElementById('unduh');

const bingkai = new Image();
const foto = [];
let nomorFrame = 1;
let hitungAktif = null;
const filterFoto = document.getElementById('filter');
const timerFoto = document.getElementById('timer');
const hitung = document.getElementById('hitung');
const cermin = document.getElementById('cermin');
const durasiTimer = [0, 3, 5, 10];
timerFoto.onclick = () => {
  const indeks = durasiTimer.indexOf(Number(timerFoto.value));
  const detik = durasiTimer[(indeks + 1) % durasiTimer.length];
  timerFoto.value = String(detik);
  timerFoto.querySelector('span').textContent = detik ? 'Timer: ' + detik + 's' : 'Timer: Mati';
};
const area = document.querySelector('.area-kamera');
const daftarFilter = [
  ['Normal', 'none'],
  ['Monokrom', 'grayscale(1)'],
  ['Sepia', 'sepia(1)'],
  ['Kontras', 'contrast(1.3)']
];
let indeksFilter = 0;
filterFoto.onclick = () => {
  indeksFilter = (indeksFilter + 1) % daftarFilter.length;
  const [nama, efek] = daftarFilter[indeksFilter];
  filterFoto.value = efek;
  filterFoto.querySelector('span').textContent = nama;
  kamera.style.filter = efek;
};
function balikPilihan(tombol) {
  const aktif = tombol.getAttribute('aria-pressed') !== 'true';
  tombol.setAttribute('aria-pressed', String(aktif));
  return aktif;
}
cermin.onclick = () => { kamera.style.transform = balikPilihan(cermin) ? 'scaleX(-1)' : 'none'; };

function batalHitung() {
  clearTimeout(hitungAktif);
  area.classList.remove('flash');
  hitungAktif = null;
  hitung.textContent = '';
}

function mulaiHitung() {
  if (jepret.disabled || kamera.readyState < 2) return;
  jadwalkanPose(Number(timerFoto.value));
}

function jadwalkanPose(sisa) {
  if (location.hash !== '#studio' || !kamera.srcObject || kamera.readyState < 2) {
    batalHitung();
    perbaruiStudio();
    return;
  }

  hitung.textContent = sisa || '';
  if (sisa > 0) {
    hitungAktif = setTimeout(() => jadwalkanPose(sisa - 1), 1000);
  } else {
    ambilFoto();
    area.classList.add('flash');
    hitungAktif = setTimeout(() => {
      area.classList.remove('flash');
      if (foto.length === 3) {
        matikanKamera();
        perbaruiStudio();
        if (location.hash === '#studio') location.hash = '#tinjau';
      } else if (Number(timerFoto.value) === 0) {
        hitungAktif = setTimeout(() => jadwalkanPose(0), 1380);
      } else {
        jadwalkanPose(Number(timerFoto.value));
      }
    }, 120);
  }
  perbaruiStudio();
}

function pasangFrame(nomor) {
  const frame = daftarFrame[nomor];
  if (!frame) return;

  nomorFrame = nomor;
  namaFrame.textContent = frame.nama;
  hasil.width = frame.lebar;
  hasil.height = frame.tinggi;
  bingkai.src = 'gambar/framee' + nomor + '.png';
  perbaruiStudio();
}

function gambarHasil() {
  const siap = bingkai.complete && bingkai.naturalWidth > 0;
  unduh.disabled = foto.length !== 3 || !siap;
  document.getElementById('lihat-hasil').hidden = unduh.disabled;
  if (!siap) return;

  const kuas = hasil.getContext('2d');
  kuas.fillStyle = 'white';
  kuas.fillRect(0, 0, hasil.width, hasil.height);

  foto.forEach((gambar, urutan) => {
    const [x, y, lebar, tinggi] = daftarFrame[nomorFrame].slot[urutan];
    // Potong dari tengah agar foto memenuhi slot tanpa menjadi gepeng.
    const skala = Math.max(lebar / gambar.width, tinggi / gambar.height);
    const lebarPotong = lebar / skala;
    const tinggiPotong = tinggi / skala;
    kuas.drawImage(gambar,
      (gambar.width - lebarPotong) / 2, (gambar.height - tinggiPotong) / 2,
      lebarPotong, tinggiPotong, x, y, lebar, tinggi);
  });

  // PNG berada di atas foto agar hiasan frame tetap terlihat.
  kuas.drawImage(bingkai, 0, 0, hasil.width, hasil.height);
}

function perbaruiStudio() {
  const aktif = Boolean(kamera.srcObject);
  const selesai = foto.length === 3;

  document.getElementById('status-live').textContent = aktif ? 'LIVE' : 'STANDBY';
  document.getElementById('pose').hidden = !aktif;
  kamera.hidden = !aktif;
  nyalakan.hidden = aktif || selesai;
  jepret.disabled = !aktif || selesai || hitungAktif !== null;
  for (const kontrol of [timerFoto, filterFoto, cermin]) {
    kontrol.disabled = hitungAktif !== null;
  }
  document.getElementById('pose').textContent = 'Pose ' + Math.min(foto.length + 1, 3) + ' / 3';
  ulang.disabled = !aktif && foto.length === 0;

  let petunjuk = '';
  if (selesai) petunjuk = 'Foto selesai. Pilih Unduh atau Ulang.';
  else if (hitungAktif !== null) petunjuk = 'Siap untuk pose ' + (foto.length + 1) + ' dari 3.';

  pesan.textContent = petunjuk;
  gambarHasil();
}

function matikanKamera() {
  batalHitung();
  if (kamera.srcObject) {
    kamera.srcObject.getTracks().forEach(jalur => jalur.stop());
    kamera.srcObject = null;
  }
}

async function nyalakanKamera() {
  nyalakan.disabled = true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (location.hash !== '#studio') {
      stream.getTracks().forEach(jalur => jalur.stop());
      return;
    }
    kamera.srcObject = stream;
    kamera.hidden = false;
    await kamera.play();
    perbaruiStudio();
  } catch {
    matikanKamera();
    perbaruiStudio();
    pesan.textContent = 'Kamera belum bisa dibuka. Periksa akses kamera, lalu coba lagi.';
  } finally {
    nyalakan.disabled = false;
  }
}

function ambilFoto() {

  // Simpan bagian yang terlihat di kamera, termasuk arah cerminnya.
  const rasio = kamera.clientWidth / kamera.clientHeight;
  const gambar = document.createElement('canvas');
  gambar.width = Math.round(Math.min(kamera.videoWidth, kamera.videoHeight * rasio));
  gambar.height = Math.round(gambar.width / rasio);
  const kuas = gambar.getContext('2d');
  if (cermin.getAttribute('aria-pressed') === 'true') {
    kuas.translate(gambar.width, 0);
    kuas.scale(-1, 1);
  }
  const filterBawaan = 'filter' in kuas;
  if (filterBawaan) kuas.filter = filterFoto.value;
  kuas.drawImage(kamera, (gambar.width - kamera.videoWidth) / 2,
    (gambar.height - kamera.videoHeight) / 2);

  if (!filterBawaan && filterFoto.value !== 'none') {
    filterPiksel(kuas, gambar.width, gambar.height, filterFoto.value);
  }
  foto.push(gambar);
}

// Cadangan untuk browser yang belum mendukung filter pada canvas.
function filterPiksel(kuas, lebar, tinggi, efek) {
  const citra = kuas.getImageData(0, 0, lebar, tinggi);
  const data = citra.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (efek === 'grayscale(1)') {
      data[i] = data[i + 1] = data[i + 2] = .2126*r + .7152*g + .0722*b;
    } else if (efek === 'sepia(1)') {
      data[i] = .393*r + .769*g + .189*b;
      data[i + 1] = .349*r + .686*g + .168*b;
      data[i + 2] = .272*r + .534*g + .131*b;
    } else if (efek === 'contrast(1.3)') {
      for (let k = i; k < i + 3; k++) data[k] = (data[k] - 127.5) * 1.3 + 127.5;
    }
  }
  kuas.putImageData(citra, 0, 0);
}

function fotoUlang() {
  matikanKamera();
  foto.length = 0;
  location.hash = '#studio';
  perbaruiStudio();
}

function unduhFoto() {
  if (unduh.disabled) return;
  const tautan = document.createElement('a');
  tautan.download = 'cekrek-frame-' + nomorFrame + '.png';
  try {
    hasil.toBlob(berkas => {
      if (!berkas) {
        pesan.textContent = 'PNG gagal dibuat. Coba unduh lagi.';
        return;
      }
      tautan.href = URL.createObjectURL(berkas);
      tautan.click();
      setTimeout(() => URL.revokeObjectURL(tautan.href), 1000);
    }, 'image/png');
  } catch {
    pesan.textContent = 'Unduhan gagal. Buka halaman lewat Live Server lalu coba lagi.';
  }
}

nyalakan.onclick = nyalakanKamera;
jepret.onclick = mulaiHitung;
ulang.onclick = fotoUlang;
unduh.onclick = unduhFoto;
bingkai.onload = gambarHasil;
bingkai.onerror = () => {
  pesan.textContent = 'Frame gagal dimuat. Periksa folder gambar.';
};
window.addEventListener('pagehide', () => {
  matikanKamera();
  perbaruiStudio();
});

document.addEventListener('frame-dipilih', kejadian => pasangFrame(kejadian.detail.id));
const pilihan = document.querySelector('.galeri-frame-section .card.active');
pasangFrame(Number(pilihan?.dataset.frame) || 1);
