document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'https://api.lorcana-api.com/cards/all';
    const fileListElement = document.getElementById('file-list');
    const sortSelect = document.getElementById('sort-select');
    const colorFilters = document.querySelectorAll('.color-filter');
    const inkableSelect = document.getElementById('inkable-select');
    const searchInput = document.getElementById('search-input');
    let cardsData = [];

    function filterAndDisplayCards() {
        const activeColors = Array.from(colorFilters)
            .filter(filter => filter.classList.contains('active'))
            .map(filter => filter.getAttribute('data-color'));

        let filteredCards = cardsData;
        if (activeColors.length > 0) {
            filteredCards = cardsData.filter(card => activeColors.includes(card.Color));
        }

        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filteredCards = filteredCards.filter(card => card.Name.toLowerCase().includes(searchTerm));
        }

        const inkableValue = inkableSelect.value;
        if (inkableValue !== 'any') {
            const inkableBoolean = inkableValue === 'true';
            filteredCards = filteredCards.filter(card => card.Inkable === inkableBoolean);
        }

        const sortBy = sortSelect.value;
        sortAndDisplayCards(filteredCards, sortBy);
    }

    function displayCards(cards) {
        fileListElement.innerHTML = '';
        cards.forEach(cardData => {
            const listItem = document.createElement('li');
            const imageElement = document.createElement('img');
            imageElement.src = cardData.Image;
            imageElement.alt = cardData.Name;
            listItem.textContent = `${cardData.Name}`;
            listItem.appendChild(imageElement);
            fileListElement.appendChild(listItem);
        });
    }

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

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            cardsData = data;
            filterAndDisplayCards();
        })
        .catch(error => console.error('Error obteniendo datos del API:', error));

    function sortAndDisplayCards(cards, sortBy) {
        cards.sort((a, b) => {
            if (sortBy === 'card-number') {
                return a.Card_Num - b.Card_Num;
            } else if (sortBy === 'ink-cost') {
                return a.Cost - b.Cost;
            } else {
                return a.Name.localeCompare(b.Name);
            }
        });

        displayCards(cards);
    }

    sortSelect.addEventListener('change', function() {
        filterAndDisplayCards();
    });

    colorFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            this.classList.toggle('active');
            filterAndDisplayCards();
        });
    });

    searchInput.addEventListener('input', function() {
        filterAndDisplayCards();
    });

    inkableSelect.addEventListener('change', function() {
        filterAndDisplayCards();
    });

    // Evento para cerrar la modal al hacer clic fuera de la imagen
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('modal');
        if (event.target === modal) {
            closeModal();
        }
    });
});
