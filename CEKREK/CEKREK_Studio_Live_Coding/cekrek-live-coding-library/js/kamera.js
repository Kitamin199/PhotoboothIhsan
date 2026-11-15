const FRAME = {
  1: { nama: 'Frame 1', gambar: 'gambar/framee1.png', w: 632, h: 1506,
       jendela: [[36, 26, 564, 376], [36, 431, 564, 376], [36, 836, 564, 376]] },
  2: { nama: 'Frame 2', gambar: 'gambar/framee2.png', w: 642, h: 1826,
       jendela: [[61, 60, 515, 508], [61, 637, 515, 508], [61, 1214, 515, 508]] },
  3: { nama: 'Frame 3', gambar: 'gambar/framee3.png', w: 675, h: 2025,
       jendela: [[41, 332, 594, 454], [41, 838, 594, 454], [41, 1345, 594, 449]] },
  4: { nama: 'Frame 4', gambar: 'gambar/framee4.png', w: 800, h: 1800,
       jendela: [[68, 84, 680, 410], [64, 612, 680, 410], [68, 1138, 676, 410]] },
  5: { nama: 'Frame 5', gambar: 'gambar/framee5.png', w: 800, h: 1800,
       jendela: [[60, 65, 690, 500], [55, 640, 690, 500], [60, 1220, 690, 500]] },
  6: { nama: 'Frame 6', gambar: 'gambar/framee6.png', w: 770, h: 2178,
       jendela: [[30, 50, 700, 590], [30, 690, 700, 590], [30, 1328, 700, 590]] }
};

// ===== ELEMEN HTML =====
const kamera = document.getElementById('kamera');
const panggung = document.getElementById('panggung');
const wadahSlot = document.getElementById('wadah-slot');
const bingkaiAtas = document.getElementById('bingkai-atas');
const namaFrame = document.getElementById('nama-frame');
const pesan = document.getElementById('pesan');
const nyalakan = document.getElementById('nyalakan');
const jepret = document.getElementById('jepret');
const unduh = document.getElementById('unduh');
const ulang = document.getElementById('ulang');

let idFrame = 1;      // frame yang sedang dipilih
let mentah = [];      // foto asli (sudah dicerminkan), belum dicrop ges
let selesai = false;

const persen = (nilai, total) => (nilai / total * 100) + '%';

// ===== 1. Memasang frame ke tampilan kamera =====
function pasangFrame(id) {
  const data = FRAME[id];
  if (!data) return;

  // Kalau jumlah lubang beda dengan foto yang sudah diambil, mulai dari awal
  if (mentah.length > data.jendela.length || (selesai && mentah.length !== data.jendela.length)) {
    mentah = [];
    selesai = false;
    tampilanSebelumSelesai();
  }

  idFrame = id;
  namaFrame.textContent = data.nama;
  panggung.style.setProperty('--rasio', data.w / data.h);
  bingkaiAtas.src = data.gambar;

  // Bikin slot foto sesuai posisi lubang frame
  wadahSlot.innerHTML = '';
  data.jendela.forEach(([x, y, w, h], i) => {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.style.left = persen(x, data.w);
    slot.style.top = persen(y, data.h);
    slot.style.width = persen(w, data.w);
    slot.style.height = persen(h, data.h);
    const img = document.createElement('img');
    img.alt = 'Foto ' + (i + 1);
    slot.appendChild(img);
    wadahSlot.appendChild(slot);
  });

  // Foto yang sudah ada dipasang ulang (di-crop sesuai lubang frame baru)
  mentah.forEach((sumber, i) => {
    wadahSlot.children[i].querySelector('img').src = potongFoto(sumber, data.jendela[i][2], data.jendela[i][3]).toDataURL('image/png');
  });

  letakkanVideo();
}

// Video kamera selalu ditaruh di lubang yang sedang giliran difoto
function letakkanVideo() {
  const data = FRAME[idFrame];
  if (selesai || mentah.length >= data.jendela.length) return;
  const [x, y, w, h] = data.jendela[mentah.length];
  kamera.style.left = persen(x, data.w);
  kamera.style.top = persen(y, data.h);
  kamera.style.width = persen(w, data.w);
  kamera.style.height = persen(h, data.h);
}

// Crop gambar supaya pas dengan lubang (seperti object-fit: cover)
function potongFoto(sumber, lebar, tinggi) {
  const rasio = lebar / tinggi;
  let sw = sumber.width, sh = sumber.height, sx = 0, sy = 0;
  if (sw / sh > rasio) { sw = sh * rasio; sx = (sumber.width - sw) / 2; }
  else { sh = sw / rasio; sy = (sumber.height - sh) / 2; }

  const kanvas = document.createElement('canvas');
  kanvas.width = lebar;
  kanvas.height = tinggi;
  kanvas.getContext('2d').drawImage(sumber, sx, sy, sw, sh, 0, 0, lebar, tinggi);
  return kanvas;
}

// ===== 2. Menyalakan kamera =====
async function nyalakanKamera() {
  try {
    kamera.srcObject = await navigator.mediaDevices.getUserMedia({ video: true });
  } catch (e) {
    pesan.textContent = 'Kamera tidak bisa diakses. Pastikan izin kamera diaktifkan.';
    return;
  }
  kamera.hidden = false;
  await kamera.play();

  letakkanVideo();
  nyalakan.hidden = true;
  jepret.disabled = false;
  pesan.textContent = 'Kamera siap. Jepret foto pertama!';
}

// ===== 3. Mengambil foto satu per satu (sesuai jumlah lubang frame) =====
function ambilFoto() {
  const data = FRAME[idFrame];
  const total = data.jendela.length;
  if (!kamera.srcObject || kamera.readyState < 2 || mentah.length >= total) return;

  // Simpan frame video penuh (dicerminkan seperti selfie)
  const asli = document.createElement('canvas');
  asli.width = kamera.videoWidth;
  asli.height = kamera.videoHeight;
  const alat = asli.getContext('2d');
  alat.translate(asli.width, 0);
  alat.scale(-1, 1);
  alat.drawImage(kamera, 0, 0);
  mentah.push(asli);

  const i = mentah.length - 1;
  const [, , w, h] = data.jendela[i];
  wadahSlot.children[i].querySelector('img').src = potongFoto(asli, w, h).toDataURL('image/png');
  pesan.textContent = 'Foto ' + mentah.length + ' dari ' + total + ' berhasil diambil.';

  if (mentah.length === total) {
    selesai = true;
    kamera.srcObject.getTracks().forEach(jalur => jalur.stop());
    kamera.srcObject = null;
    kamera.hidden = true;
    jepret.hidden = true;
    unduh.hidden = false;
    ulang.hidden = false;
    pesan.textContent = 'Selesai! Ganti frame kalau mau, atau unduh PNG.';
  } else {
    letakkanVideo();
  }
}

// ===== 4. Mengunduh hasil (foto + frame) sebagai PNG =====
async function unduhFoto() {
  const data = FRAME[idFrame];
  if (mentah.length !== data.jendela.length) return;

  if (!bingkaiAtas.complete) await bingkaiAtas.decode();

  const kanvas = document.createElement('canvas');
  kanvas.width = data.w;
  kanvas.height = data.h;
  const alat = kanvas.getContext('2d');
  alat.fillStyle = '#ffffff';
  alat.fillRect(0, 0, data.w, data.h);

  // Foto dulu di bawah, lalu frame ditumpuk di atasnya
  data.jendela.forEach(([x, y, w, h], i) => {
    alat.drawImage(potongFoto(mentah[i], w, h), x, y, w, h);
  });
  alat.drawImage(bingkaiAtas, 0, 0, data.w, data.h);

  try {
    const link = document.createElement('a');
    link.href = kanvas.toDataURL('image/png');
    link.download = 'foto-cekrek-frame' + idFrame + '.png';
    link.click();
  } catch (e) {
    // Terjadi kalau halaman dibuka langsung lewat file:// (bukan lewat server)
    pesan.textContent = 'Gagal mengunduh. Buka website lewat Live Server / hosting (bukan file://).';
  }
}

// ===== 5. Mengulang foto =====
function tampilanSebelumSelesai() {
  jepret.hidden = false;
  jepret.disabled = !kamera.srcObject;
  unduh.hidden = true;
  ulang.hidden = true;
}

function fotoUlang() {
  mentah = [];
  selesai = false;
  tampilanSebelumSelesai();
  jepret.disabled = true;
  nyalakan.hidden = false;
  pasangFrame(idFrame);
  pesan.textContent = 'Silakan nyalakan kamera untuk mulai lagi.';
}

// ===== 6. Dengar pilihan frame dari Galeri Frame =====
document.addEventListener('frame-dipilih', e => {
  pasangFrame(e.detail.id);
  pesan.textContent = FRAME[e.detail.id].nama + ' dipilih. ' +
    (kamera.srcObject ? 'Lanjut jepret!' : 'Nyalakan kamera, lalu ambil foto.');
});

nyalakan.onclick = nyalakanKamera;
jepret.onclick = ambilFoto;
unduh.onclick = unduhFoto;
ulang.onclick = fotoUlang;

// Frame awal = card yang aktif di galeri
const kartuAktif = document.querySelector('.galeri-frame-section .card.active');
pasangFrame(Number(kartuAktif && kartuAktif.dataset.frame) || 1);