console.log("faq.js jalan");
document.querySelectorAll(".pertanyaan").forEach(function (tombol) {
  tombol.addEventListener("click", function () {
    tombol.parentElement.classList.toggle("buka");
  });
});