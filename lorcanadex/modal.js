const fileListElement = document.getElementById('file-list');

function showModal(imageSrc) {
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-img');

    modalImg.src = imageSrc;
    modal.style.display = 'block';

    modal.addEventListener('click', closeModal);
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
    modal.removeEventListener('click', closeModal);
}

fileListElement.addEventListener('click', function(event) {
    if (event.target.tagName === 'IMG') {
        const imageSrc = event.target.src;
        showModal(imageSrc);
    }
});
// Evento para cerrar la modal al hacer clic fuera de la imagen
window.addEventListener('click', function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
});
