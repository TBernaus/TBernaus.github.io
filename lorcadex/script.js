document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'https://api.github.com/repos/Dogloverblue/Lorcana-API/contents/src/data/legacy_data/cards';
    const fileListElement = document.getElementById('file-list');
    const sortSelect = document.getElementById('sort-select');
    const colorFilters = document.querySelectorAll('.color-filter');
    const toggleSizeButton = document.getElementById('toggle-size');
    const searchInput = document.getElementById('search-input');
    let isLargeSize = true;
    let cardsData = [];

    function filterAndDisplayCards() {
        const activeColors = Array.from(colorFilters)
            .filter(filter => filter.classList.contains('active'))
            .map(filter => filter.getAttribute('data-color'));

        let filteredCards = cardsData;
        if (activeColors.length > 0) {
            filteredCards = cardsData.filter(card => activeColors.includes(card.color));
        }

        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filteredCards = filteredCards.filter(card => card.name.toLowerCase().includes(searchTerm));
        }

        const sortBy = sortSelect.value;
        sortAndDisplayCards(filteredCards, sortBy);
    }

    function displayCardsWithSize(cards) {
        fileListElement.innerHTML = '';
        cards.forEach(cardData => {
            const listItem = document.createElement('li');
            const imageElement = document.createElement('img');
            imageElement.src = isLargeSize ? cardData['image-urls']['large'] : cardData['image-urls']['small'];
            imageElement.alt = cardData.name;
            listItem.textContent = `${cardData.name}`;
            listItem.appendChild(imageElement);
            fileListElement.appendChild(listItem);
        });
    }

    toggleSizeButton.addEventListener('click', function() {
        isLargeSize = !isLargeSize;
        filterAndDisplayCards();
    });

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
            data.forEach(file => {
                if (file.name.endsWith('.txt')) {
                    fetch(file.download_url)
                        .then(response => response.json())
                        .then(cardData => {
                            cardsData.push(cardData);
                            if (cardsData.length === data.filter(file => file.name.endsWith('.txt')).length) {
                                filterAndDisplayCards();
                            }
                        })
                        .catch(error => console.error('Error obteniendo datos del archivo:', error));
                }
            });
        })
        .catch(error => console.error('Error obteniendo lista de archivos:', error));

    function sortAndDisplayCards(cards, sortBy) {
        cards.sort((a, b) => {
            if (sortBy === 'card-number') {
                return a['card-number'] - b['card-number'];
            } else if (sortBy === 'ink-cost') {
                return a['ink-cost'] - b['ink-cost'];
            } else {
                return a.name.localeCompare(b.name);
            }
        });

        displayCardsWithSize(cards);
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

    // Evento para cerrar la modal al hacer clic fuera de la imagen
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('modal');
        if (event.target === modal) {
            closeModal();
        }
    });

    // Ajuste del tamaño de la imagen dentro de la modal al 80% de la pantalla
    window.addEventListener('resize', function() {
        const modalImg = document.getElementById('modal-img');
        const newWidth = window.innerWidth * 0.8;
        modalImg.style.maxWidth = `${newWidth}px`;
    });

});
