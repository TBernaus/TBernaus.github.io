document.addEventListener('DOMContentLoaded', function() {
  const apiUrl = 'https://api.github.com/repos/Dogloverblue/Lorcana-API/contents/src/data/legacy_data/cards';
  const fileListElement = document.getElementById('file-list');
  const sortSelect = document.getElementById('sort-select');
  const colorFilters = document.querySelectorAll('.color-filter');
  let cardsData = [];

  // Función para filtrar las cartas por color
  function filterCardsByColor() {
      const activeColors = Array.from(colorFilters)
          .filter(filter => filter.classList.contains('active'))
          .map(filter => filter.getAttribute('data-color'));

      if (activeColors.length === 0) {
          // Si no hay colores activos, mostrar todas las cartas
          sortAndDisplayCards(cardsData, sortSelect.value);
      } else {
          const filteredCards = cardsData.filter(card => !activeColors.includes(card.color));
          sortAndDisplayCards(filteredCards, sortSelect.value);
      }
  }

  // Función para mostrar todas las cartas
  function showAllCards() {
      sortAndDisplayCards(cardsData, sortSelect.value);
  }

  // Evento de clic para cada botón de filtro por color
  colorFilters.forEach(filter => {
      filter.addEventListener('click', function() {
          const isActive = this.classList.contains('active');

          if (!isActive) {
              // Si el botón no está activo, activarlo y filtrar las cartas
              this.classList.add('active');
          } else {
              // Si el botón está activo, desactivarlo y actualizar los filtros
              this.classList.remove('active');
          }

          filterCardsByColor();
      });
  });

  // Tu código existente para obtener las cartas y ordenarlas
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
                              sortAndDisplayCards(cardsData, 'ink-cost');
                          }
                      })
                      .catch(error => console.error('Error obteniendo datos del archivo:', error));
              }
          });
      })
      .catch(error => console.error('Error obteniendo lista de archivos:', error));

  // Función para ordenar las cartas y mostrarlas
  function sortAndDisplayCards(cardsData, sortBy) {
      if (sortBy === 'card-number') {
          cardsData.sort((a, b) => {
              if (a.set === b.set) {
                  return a['card-number'] - b['card-number'];
              } else {
                  return a.set.localeCompare(b.set);
              }
          });
      } else if (sortBy === 'ink-cost') {
          cardsData.sort((a, b) => {
              return a['ink-cost'] - b['ink-cost'];
          });
      } else {
          cardsData.sort((a, b) => {
              return a.name.localeCompare(b.name);
          });
      }

      fileListElement.innerHTML = '';

      cardsData.forEach(cardData => {
          const listItem = document.createElement('li');
          const imageElement = document.createElement('img');
          imageElement.src = cardData['image-urls']['small'];
          imageElement.alt = cardData.name;
          listItem.textContent = `${cardData.name} - ${cardData.color}`;
          listItem.appendChild(imageElement);
          fileListElement.appendChild(listItem);
      });
  }

  // Evento cuando cambia el valor del filtro de ordenamiento
  sortSelect.addEventListener('change', function() {
      const sortBy = sortSelect.value;
      filterCardsByColor(); // Llamar a la función de filtrado después de cambiar el tipo de orden
  });
});
