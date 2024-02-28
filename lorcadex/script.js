document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'https://api.github.com/repos/Dogloverblue/Lorcana-API/contents/src/data/legacy_data/cards';
    const fileListElement = document.getElementById('file-list');
    const sortSelect = document.getElementById('sort-select');
    const colorFilters = document.querySelectorAll('.color-filter');
    const toggleSizeButton = document.getElementById('toggle-size');
    let isLargeSize = false; // Variable para rastrear el estado del tamaño de la carta

    let cardsData = [];

    // Función para filtrar y mostrar las cartas
    function filterAndDisplayCards() {
        // Filtrar las cartas según los colores seleccionados
        const activeColors = Array.from(colorFilters)
            .filter(filter => filter.classList.contains('active'))
            .map(filter => filter.getAttribute('data-color'));

        let filteredCards = cardsData;
        if (activeColors.length > 0) {
            filteredCards = cardsData.filter(card => activeColors.includes(card.color));
        }

        // Ordenar las cartas según la selección del usuario
        const sortBy = sortSelect.value;
        sortAndDisplayCards(filteredCards, sortBy);
    }

    // Función para mostrar las cartas en el tamaño adecuado
    function displayCardsWithSize(cards) {
        fileListElement.innerHTML = ''; // Limpiar la lista de cartas
        cards.forEach(cardData => {
            const listItem = document.createElement('li');
            const imageElement = document.createElement('img');
            // Asignar el tamaño de la imagen según el estado de isLargeSize
            imageElement.src = isLargeSize ? cardData['image-urls']['small'] : cardData['image-urls']['large'];
            imageElement.alt = cardData.name;
            listItem.textContent = `${cardData.name}`;
            listItem.appendChild(imageElement);
            fileListElement.appendChild(listItem);
        });
    }

    // Función para alternar el tamaño de las cartas
    toggleSizeButton.addEventListener('click', function() {
        isLargeSize = !isLargeSize; // Cambiar el estado del tamaño de la carta
        filterAndDisplayCards(); // Volver a mostrar las cartas con el nuevo tamaño
    });

    // Cargar y mostrar las cartas al cargar la página
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
                                filterAndDisplayCards(); // Mostrar las cartas al completar la carga
                            }
                        })
                        .catch(error => console.error('Error obteniendo datos del archivo:', error));
                }
            });
        })
        .catch(error => console.error('Error obteniendo lista de archivos:', error));

    // Función para ordenar y mostrar las cartas
    function sortAndDisplayCards(cards, sortBy) {
        // Ordenar las cartas según el criterio seleccionado
        cards.sort((a, b) => {
            if (sortBy === 'card-number') {
                return a['card-number'] - b['card-number'];
            } else if (sortBy === 'ink-cost') {
                return a['ink-cost'] - b['ink-cost'];
            } else {
                return a.name.localeCompare(b.name);
            }
        });

        // Mostrar las cartas con el tamaño adecuado
        displayCardsWithSize(cards);
    }

    // Evento para el cambio en el filtro de ordenamiento
    sortSelect.addEventListener('change', function() {
        filterAndDisplayCards(); // Volver a mostrar las cartas al cambiar el filtro
    });

    // Evento para el clic en los filtros de color
    colorFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            this.classList.toggle('active'); // Alternar la clase "active" al hacer clic
            filterAndDisplayCards(); // Volver a mostrar las cartas al cambiar los filtros
        });
    });
});
