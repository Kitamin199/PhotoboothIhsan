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

// Elemen DOM
const $ = id => document.getElementById(id);
const kamera = $('kamera'), panggung = $('panggung'), wadahSlot = $('wadah-slot');
const bingkaiAtas = $('bingkai-atas'), namaFrame = $('nama-frame'), pesan = $('pesan');
const nyalakan = $('nyalakan'), jepret = $('jepret'), unduh = $('unduh'), ulang = $('ulang');

let idFrame = 1, mentah = [], selesai = false;
const persen = (n, t) => (n / t * 100) + '%';

// 1. Pasang Frame
function pasangFrame(id) {
  const data = FRAME[id];
  if (!data) return;

  if (mentah.length > data.jendela.length || (selesai && mentah.length !== data.jendela.length)) {
    mentah = [];
    selesai = false;
    aturTombol(false);
  }

  idFrame = id;
  namaFrame.textContent = data.nama;
  panggung.style.setProperty('--rasio', data.w / data.h);
  bingkaiAtas.src = data.gambar;

  wadahSlot.innerHTML = '';
  data.jendela.forEach(([x, y, w, h], i) => {
    wadahSlot.innerHTML += `
      <div class="slot" style="left:${persen(x, data.w)}; top:${persen(y, data.h)}; width:${persen(w, data.w)}; height:${persen(h, data.h)}">
        <img alt="Foto ${i + 1}">
      </div>`;
  });

  mentah.forEach((sumber, i) => {
    wadahSlot.children[i].querySelector('img').src = potongFoto(sumber, data.jendela[i][2], data.jendela[i][3]).toDataURL();
  });

  letakkanVideo();
}

// Posisi Video Live
function letakkanVideo() {
  const data = FRAME[idFrame];
  if (selesai || mentah.length >= data.jendela.length) return;
  const [x, y, w, h] = data.jendela[mentah.length];
  Object.assign(kamera.style, {
    left: persen(x, data.w), top: persen(y, data.h),
    width: persen(w, data.w), height: persen(h, data.h)
  });
}

// Crop Foto (Object-fit cover manual)
function potongFoto(sumber, lebar, tinggi) {
  const rasio = lebar / tinggi;
  let sw = sumber.width, sh = sumber.height, sx = 0, sy = 0;
  if (sw / sh > rasio) { sw = sh * rasio; sx = (sumber.width - sw) / 2; }
  else { sh = sw / rasio; sy = (sumber.height - sh) / 2; }

  const kanvas = document.createElement('canvas');
  [kanvas.width, kanvas.height] = [lebar, tinggi];
  kanvas.getContext('2d').drawImage(sumber, sx, sy, sw, sh, 0, 0, lebar, tinggi);
  return kanvas;
}

// 2. Nyalakan Kamera
async function nyalakanKamera() {
  try {
    kamera.srcObject = await navigator.mediaDevices.getUserMedia({ video: true });
    kamera.hidden = false;
    await kamera.play();
    letakkanVideo();
    nyalakan.hidden = true;
    jepret.disabled = false;
    pesan.textContent = 'Kamera siap. Jepret foto pertama!';
  } catch (e) {
    pesan.textContent = 'Kamera tidak bisa diakses. Periksa izin browser.';
  }
}

// 3. Ambil Foto
function ambilFoto() {
  const data = FRAME[idFrame], total = data.jendela.length;
  if (!kamera.srcObject || kamera.readyState < 2 || mentah.length >= total) return;

  const asli = document.createElement('canvas');
  [asli.width, asli.height] = [kamera.videoWidth, kamera.videoHeight];
  const alat = asli.getContext('2d');
  alat.translate(asli.width, 0);
  alat.scale(-1, 1);
  alat.drawImage(kamera, 0, 0);
  mentah.push(asli);

  const i = mentah.length - 1;
  wadahSlot.children[i].querySelector('img').src = potongFoto(asli, data.jendela[i][2], data.jendela[i][3]).toDataURL();
  pesan.textContent = `Foto ${mentah.length} dari ${total} berhasil.`;

  if (mentah.length === total) {
    selesai = true;
    kamera.srcObject.getTracks().forEach(t => t.stop());
    kamera.srcObject = null;
    kamera.hidden = jepret.hidden = true;
    unduh.hidden = ulang.hidden = false;
    pesan.textContent = 'Selesai! Silakan unduh hasil foto.';
  } else {
    letakkanVideo();
  }
}

// 4. Unduh Hasil
async function unduhFoto() {
  const data = FRAME[idFrame];
  if (mentah.length !== data.jendela.length) return;
  if (!bingkaiAtas.complete) await bingkaiAtas.decode();

  const kanvas = document.createElement('canvas');
  [kanvas.width, kanvas.height] = [data.w, data.h];
  const alat = kanvas.getContext('2d');
  alat.fillStyle = '#ffffff';
  alat.fillRect(0, 0, data.w, data.h);

  data.jendela.forEach(([x, y, w, h], i) => {
    alat.drawImage(potongFoto(mentah[i], w, h), x, y, w, h);
  });
  alat.drawImage(bingkaiAtas, 0, 0, data.w, data.h);

  try {
    const link = document.createElement('a');
    link.href = kanvas.toDataURL('image/png');
    link.download = `foto-cekrek-frame${idFrame}.png`;
    link.click();
  } catch (e) {
    pesan.textContent = 'Gagal mengunduh. Pastikan lewat Live Server.';
  }
}

// 5. Reset / Foto Ulang
function aturTombol(isSelesai) {
  jepret.hidden = isSelesai;
  jepret.disabled = !kamera.srcObject;
  unduh.hidden = ulang.hidden = !isSelesai;
}

function fotoUlang() {
  mentah = [];
  selesai = false;
  aturTombol(false);
  jepret.disabled = true;
  nyalakan.hidden = false;
  pasangFrame(idFrame);
  pesan.textContent = 'Silakan nyalakan kamera untuk mulai lagi.';
}

// Event Listeners
document.addEventListener('frame-dipilih', e => {
  pasangFrame(e.detail.id);
  pesan.textContent = `${FRAME[e.detail.id].nama} dipilih. ${kamera.srcObject ? 'Lanjut jepret!' : 'Nyalakan kamera.'}`;
});

nyalakan.onclick = nyalakanKamera;
jepret.onclick = ambilFoto;
unduh.onclick = unduhFoto;
ulang.onclick = fotoUlang;

// Inisialisasi awal
const kartuAktif = document.querySelector('.galeri-frame-section .card.active');
pasangFrame(Number(kartuAktif?.dataset.frame) || 1);