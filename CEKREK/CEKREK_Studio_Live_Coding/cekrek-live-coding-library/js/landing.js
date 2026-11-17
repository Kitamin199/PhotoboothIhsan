const tombol = document.querySelectorAll(".startbutton, .galeriframe");

tombol-grup.forEach(function (btn) {
  btn.addEventListener("click", function (e) {
    e.preventDefault();
    const idTujuan = btn.getAttribute("href");
    const tujuan = document.querySelector(idTujuan);
  });
});