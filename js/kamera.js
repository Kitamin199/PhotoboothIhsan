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

// Elemen studio dan pilihan sesi.
const id = nama => document.getElementById(nama);
const video = id('kamera');
const hasil = id('hasil');
const bingkai = new Image();
const foto = [];
const area = document.querySelector('.area-kamera');
const tunggu = ms => new Promise(selesai => setTimeout(selesai, ms));
let frame = daftarFrame[1];
let sibuk = false;

const filter = ['none', 'grayscale(1)', 'sepia(1)', 'contrast(1.3)'];
const namaFilter = ['Normal', 'Monokrom', 'Sepia', 'Kontras'];
const timer = [0, 3, 5, 10];
let efek = 0;
let waktu = 0;
let cermin = true;

id('filter').onclick = () => {
  efek = (efek + 1) % filter.length;
  video.style.filter = filter[efek];
  id('filter').querySelector('span').textContent = namaFilter[efek];
};
id('timer').onclick = () => {
  waktu = (waktu + 1) % timer.length;
  id('timer').querySelector('span').textContent = 'Timer: ' + (timer[waktu] ? timer[waktu] + 's' : 'Mati');
};
id('cermin').onclick = () => {
  cermin = !cermin;
  video.style.transform = cermin ? 'scaleX(-1)' : 'none';
  id('cermin').setAttribute('aria-pressed', String(cermin));
};

function pasangFrame(nomor) {
  frame = daftarFrame[nomor];
  id('nama-frame').textContent = frame.nama;
  hasil.width = frame.lebar;
  hasil.height = frame.tinggi;
  bingkai.src = 'gambar/framee' + nomor + '.png';
  perbaruiStudio();
}

// Ambil bagian tengah video sesuai bentuk pratinjau.
function ambilFoto() {
  const gambar = document.createElement('canvas');
  const rasio = video.clientWidth / video.clientHeight;
  gambar.width = Math.round(Math.min(video.videoWidth, video.videoHeight * rasio));
  gambar.height = Math.round(gambar.width / rasio);
  const kuas = gambar.getContext('2d');
  if (cermin) {
    kuas.translate(gambar.width, 0);
    kuas.scale(-1, 1);
  }
  kuas.filter = filter[efek];
  kuas.drawImage(video, (gambar.width - video.videoWidth) / 2, (gambar.height - video.videoHeight) / 2);
  foto.push(gambar);
}

// Gambar foto di tiap slot, kemudian letakkan bingkai PNG di atasnya.
function gambarStrip() {
  const kuas = hasil.getContext('2d');
  kuas.fillStyle = 'white';
  kuas.fillRect(0, 0, hasil.width, hasil.height);
  foto.forEach((gambar, i) => {
    const [x, y, lebar, tinggi] = frame.slot[i];
    const skala = Math.max(lebar / gambar.width, tinggi / gambar.height);
    const w = lebar / skala;
    const h = tinggi / skala;
    kuas.drawImage(gambar, (gambar.width-w)/2, (gambar.height-h)/2, w, h, x, y, lebar, tinggi);
  });
  if (bingkai.naturalWidth) kuas.drawImage(bingkai, 0, 0, hasil.width, hasil.height);
}

async function mulaiSesi() {
  if (sibuk || video.readyState < 2) return;
  const stream = video.srcObject;
  sibuk = true;
  perbaruiStudio();
  for (let pose = foto.length + 1; pose <= 3; pose++) {
    for (let sisa = timer[waktu]; sisa > 0; sisa--) {
      id('hitung').textContent = sisa;
      await tunggu(1000);
      if (video.srcObject !== stream) return;
    }
    id('hitung').textContent = '';
    ambilFoto();
    perbaruiStudio();
    area.classList.add('flash');
    await tunggu(120);
    if (video.srcObject !== stream) return;
    area.classList.remove('flash');
    if (timer[waktu] === 0 && pose < 3) {
      await tunggu(1380);
      if (video.srcObject !== stream) return;
    }
  }
  matikanKamera();
  perbaruiStudio();
}

function matikanKamera() {
  video.srcObject?.getTracks().forEach(track => track.stop());
  video.srcObject = null;
  sibuk = false;
  id('hitung').textContent = '';
  area.classList.remove('flash');
}

function perbaruiStudio() {
  const aktif = Boolean(video.srcObject);
  const selesai = foto.length === 3;
  video.hidden = !aktif;
  id('pose').hidden = !aktif;
  id('pose').textContent = 'Pose ' + Math.min(foto.length + 1, 3) + ' / 3';
  id('nyalakan').hidden = aktif || selesai;
  id('jepret').disabled = !aktif || sibuk;
  id('ulang').disabled = !aktif && !foto.length;
  id('unduh').disabled = !selesai || !bingkai.complete || !bingkai.naturalWidth;
  id('lihat-hasil').disabled = sibuk || id('unduh').disabled;
  for (const nama of ['filter', 'timer', 'cermin']) id(nama).disabled = sibuk;
  gambarStrip();
}

id('nyalakan').onclick = async () => {
  id('nyalakan').disabled = true;
  try {
    video.srcObject = await navigator.mediaDevices.getUserMedia({ video: true });
    if (location.hash !== '#studio') return matikanKamera();
    await video.play();
    id('pesan').textContent = '';
  } catch {
    matikanKamera();
    id('pesan').textContent = 'Kamera belum bisa dibuka. Periksa izin kamera.';
  } finally {
    id('nyalakan').disabled = false;
    perbaruiStudio();
  }
};
id('jepret').onclick = mulaiSesi;
id('ulang').onclick = () => {
  matikanKamera();
  foto.length = 0;
  perbaruiStudio();
  location.hash = '#studio';
};
id('lihat-hasil').onclick = () => { location.hash = '#tinjau'; };
id('unduh').onclick = () => {
  const tautan = document.createElement('a');
  tautan.download = 'cekrek-' + frame.nama + '.png';
  tautan.href = hasil.toDataURL('image/png');
  tautan.click();
};

bingkai.onload = perbaruiStudio;
window.addEventListener('pagehide', matikanKamera);
document.addEventListener('frame-dipilih', e => pasangFrame(e.detail.id));
pasangFrame(1);
