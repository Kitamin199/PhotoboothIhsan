// Mengambil elemen HTML
const kamera = document.getElementById('kamera');
const hasil = document.getElementById('hasil');
const pesan = document.getElementById('pesan');
const nyalakan = document.getElementById('nyalakan');
const jepret = document.getElementById('jepret');
const unduh = document.getElementById('unduh');
const ulang = document.getElementById('ulang');
const campuran = document.getElementById('campuran');
const bertumpuk = document.getElementById('bertumpuk');

let foto = 0;

// 1. Menyalakan kamera
async function nyalakanKamera() {
  kamera.srcObject = await navigator.mediaDevices.getUserMedia({ video: true });
  kamera.hidden = false;
  await kamera.play();

  nyalakan.hidden = true;
  jepret.disabled = false;
  pesan.textContent = 'Kamera siap. Jepret foto pertama!';
}


// 2. Mengambil 3 foto satu per satu
function ambilFoto() {
  if (!kamera.srcObject || kamera.readyState < 2 || foto >= 3) return;

  const gambar = document.createElement('canvas');
  gambar.width = kamera.videoWidth;
  gambar.height = kamera.videoHeight;
  const alat = gambar.getContext('2d');
  alat.translate(gambar.width, 0);
  alat.scale(-1, 1);
  alat.drawImage(kamera, 0, 0);

  hasil.querySelectorAll('img')[foto].src = gambar.toDataURL('image/png');
  foto++;
  pesan.textContent = 'Foto ' + foto + ' dari 3 berhasil diambil.';

  if (foto === 3) {
    kamera.srcObject.getTracks().forEach(jalur => jalur.stop());
    kamera.srcObject = null;
    kamera.hidden = true;
    hasil.hidden = false;
    jepret.hidden = true;
    unduh.hidden = false;
    ulang.hidden = false;
    pesan.textContent = 'Selesai! Pilih frame atau unduh PNG.';
  }
}

// 3. Mengganti susunan foto lewat CSS
function pilihFrame(nama) {
  hasil.className = 'bingkai ' + nama;
  campuran.classList.toggle('dipilih', nama === 'campuran');
  bertumpuk.classList.toggle('dipilih', nama === 'bertumpuk');
  campuran.setAttribute('aria-pressed', nama === 'campuran');
  bertumpuk.setAttribute('aria-pressed', nama === 'bertumpuk');
}

// 4. Mengunduh frame sebagai gambar PNG
async function unduhFoto() {
  if (foto !== 3) return;

  const gambar = await htmlToImage.toPng(hasil);
  const link = document.createElement('a');

  link.href = gambar;
  link.download = 'foto-cekrek.png';
  link.click();
}

// 5. Mengulang foto
function fotoUlang() {
  foto = 0;
  hasil.querySelectorAll('img').forEach(gambar => gambar.removeAttribute('src'));
  hasil.hidden = true;
  jepret.hidden = false;
  jepret.disabled = true;
  unduh.hidden = true;
  ulang.hidden = true;
  nyalakan.hidden = false;
  pesan.textContent = 'Silakan nyalakan kamera untuk mulai lagi.';
}

nyalakan.onclick = nyalakanKamera;
jepret.onclick = ambilFoto;
campuran.onclick = () => pilihFrame('campuran');
bertumpuk.onclick = () => pilihFrame('bertumpuk');
unduh.onclick = unduhFoto;
ulang.onclick = fotoUlang;