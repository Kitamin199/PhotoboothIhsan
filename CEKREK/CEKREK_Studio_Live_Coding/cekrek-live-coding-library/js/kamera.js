// Setiap slot ditulis sebagai [jarak dari kiri, jarak dari atas, lebar, tinggi].
const daftarFrame = {
  1: {
    lebar: 734,
    tinggi: 1800,
    slot: [
      [41, 32, 656, 447],
      [41, 516, 656, 447],
      [41, 1000, 656, 447]
    ]
  },
  2: {
    lebar: 623,
    tinggi: 1800,
    slot: [
      [60, 60, 502, 500],
      [60, 629, 502, 500],
      [60, 1198, 502, 500]
    ]
  },
  3: {
    lebar: 600,
    tinggi: 1800,
    slot: [
      [36, 295, 529, 404],
      [36, 745, 529, 404],
      [36, 1195, 529, 404]
    ]
  },
  4: {
    lebar: 800,
    tinggi: 1800,
    slot: [
      [68, 84, 676, 410],
      [68, 612, 676, 410],
      [68, 1138, 676, 410]
    ]
  },
  5: {
    lebar: 808,
    tinggi: 1808,
    slot: [
      [60, 67, 697, 496],
      [52, 643, 697, 514],
      [60, 1227, 697, 496]
    ]
  },
  6: {
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

function pasangFrame(nomor) {
  const frame = daftarFrame[nomor];
  if (!frame) return;

  nomorFrame = nomor;
  namaFrame.textContent = 'Frame ' + nomor;
  hasil.width = frame.lebar;
  hasil.height = frame.tinggi;
  bingkai.src = 'gambar/framee' + nomor + '.png';
  perbaruiStudio();
}

function gambarHasil() {
  const siap = bingkai.complete && bingkai.naturalWidth > 0;
  unduh.disabled = foto.length !== 3 || !siap;
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

  kamera.hidden = !aktif;
  nyalakan.hidden = aktif || selesai;
  jepret.disabled = !aktif || selesai;
  ulang.disabled = !aktif && foto.length === 0;

  let petunjuk = 'Nyalakan kamera untuk mulai foto.';
  if (selesai) petunjuk = 'Foto selesai. Pilih Unduh atau Ulang.';
  else if (aktif) petunjuk = 'Ambil foto ' + (foto.length + 1) + ' dari 3.';

  pesan.textContent = petunjuk;
  gambarHasil();
}

function matikanKamera() {
  if (kamera.srcObject) {
    kamera.srcObject.getTracks().forEach(jalur => jalur.stop());
    kamera.srcObject = null;
  }
}

async function nyalakanKamera() {
  kamera.srcObject = await navigator.mediaDevices.getUserMedia({ video: true });
  kamera.hidden = false;
  await kamera.play();
  perbaruiStudio();
}

function ambilFoto() {
  if (jepret.disabled || kamera.readyState < 2) return;

  // Simpan bagian yang terlihat di kamera, termasuk arah cerminnya.
  const rasio = kamera.clientWidth / kamera.clientHeight;
  const gambar = document.createElement('canvas');
  gambar.width = Math.round(Math.min(kamera.videoWidth, kamera.videoHeight * rasio));
  gambar.height = Math.round(gambar.width / rasio);
  const kuas = gambar.getContext('2d');
  kuas.translate(gambar.width, 0);
  kuas.scale(-1, 1);
  kuas.drawImage(kamera, (gambar.width - kamera.videoWidth) / 2,
    (gambar.height - kamera.videoHeight) / 2);

  foto.push(gambar);
  if (foto.length === 3) matikanKamera();
  perbaruiStudio();
}

function fotoUlang() {
  matikanKamera();
  foto.length = 0;
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
jepret.onclick = ambilFoto;
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
