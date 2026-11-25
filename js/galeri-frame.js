function selectCard(selectedElement) {
  const cards = document.querySelectorAll('.galeri-frame-section .card');
  cards.forEach(card => {
    card.classList.remove('active');
  });

  selectedElement.classList.add('active');

  document.dispatchEvent(new CustomEvent('frame-dipilih', {
    detail: { id: Number(selectedElement.dataset.frame) }
  }));
  location.hash = '#studio';
}
