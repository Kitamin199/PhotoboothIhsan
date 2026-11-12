    function selectCard(selectedElement) {
      const cards = document.querySelectorAll('.galeri-frame-section .card');
      cards.forEach(card => {
        card.classList.remove('active');
        const btn = card.querySelector('.btn');
        btn.innerText = 'Pilih Frame';
      });

      selectedElement.classList.add('active');
      const activeBtn = selectedElement.querySelector('.btn');
      activeBtn.innerText = 'Layout Aktif';
    }
