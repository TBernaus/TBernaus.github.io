document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = 'https://api.lorcana-api.com/cards/all';
    const sortSelect = document.getElementById('sort-select');
    const colorFilters = document.querySelectorAll('.color-filter');
    const inkableSelect = document.getElementById('inkable-select');
    const searchInput = document.getElementById('search-input');
    let cardsData = [];


/*
    ##############################################
    ############### OBTENIR CARTES ###############
    ##############################################
*/
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

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            cardsData = data;
            filterAndDisplayCards();
        })
        .catch(error => console.error("Error obtenint dades de l'API:", error));


/*
    ##############################################
    ############### FILTRAR CARTES ###############
    ##############################################
*/

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
        const minInk = parseInt(document.getElementById('min-value').innerHTML);
        const maxInk = parseInt(document.getElementById('max-value').innerHTML);
        filteredCards = filteredCards.filter(card => card.Cost >= minInk && card.Cost <= maxInk);

        filteredCards = filteredCards.filter(card => card.Name !== 'TEST' && !card.Name.includes("Bonaparte's Gull") && !card.Name.includes("Bonepart's Gull") && !card.Name.includes("Boneparte's Gull") && !card.Name.includes("Bonapartes Gull"));
        const sortBy = sortSelect.value;
        sortAndDisplayCards(filteredCards, sortBy);
    }

    sortSelect.addEventListener('change', function () {
        filterAndDisplayCards();
    });

    colorFilters.forEach(filter => {
        filter.addEventListener('click', function () {
            this.classList.toggle('active');
            filterAndDisplayCards();
        });
    });

    searchInput.addEventListener('input', function () {
        filterAndDisplayCards();
    });

    inkableSelect.addEventListener('change', function () {
        filterAndDisplayCards();
    });

/*
    ###############################################
    ############### ENDREÇAR CARTES ###############
    ###############################################
*/
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

/*
    ##############################################
    ############# FILTRAR PER COLORS #############
    ##############################################
*/

    const colorButtons = document.querySelectorAll('.color-filter');
    const clearFiltersButton = document.querySelector('.clear-filters-button');

    function resetFilters() {
        colorButtons.forEach(button => {
            button.style.backgroundColor = '#000';
        });
        colorFilters.forEach(filter => {
            filter.classList.remove('active');
        });
        filterAndDisplayCards();
    }

    clearFiltersButton.addEventListener('click', function () {
        resetFilters();
    });

    colorButtons.forEach(button => {
        button.addEventListener('click', function () {
            const color = this.getAttribute('btn-color');
            if (this.style.backgroundColor === color) {
                this.style.backgroundColor = '#000';
            } else {
                this.style.backgroundColor = color;
            }
        });
    });

/*
    ##################################################
    ###################### RANG ######################
    ##################################################
*/
    let minValue = document.getElementById("min-value");
    let maxValue = document.getElementById("max-value");

    function validateRange() {
        let minInk = parseInt(inputElements[0].value);
        let maxInk = parseInt(inputElements[1].value);

        if (minInk > maxInk) {
            let tempValue = maxInk;
            maxInk = minInk;
            minInk = tempValue;
        }

        minValue.innerHTML = minInk;
        maxValue.innerHTML = maxInk;

        filterAndDisplayCards();
    }

    const inputElements = document.querySelectorAll("input");
    inputElements.forEach((element) => {
        element.addEventListener("input", validateRange);
    });
});
