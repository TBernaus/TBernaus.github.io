document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = "https://api.lorcana-api.com/cards/all";
  const fileListElement = document.getElementById("file-list");
  const placeholderElement = document.getElementById("placeholder");
  const loadMoreButton = document.getElementById("load-more-button");
  const colorFilters = document.querySelectorAll(".color-filter");
  const typeFilters = document.querySelectorAll(".type-filter");
  const searchInput = document.getElementById("search-input");
  const searchInputAtt = document.getElementById("search-input-att");
  const searchInputGlobal = document.getElementById("search-input-global");
  const clearSearchButton = document.querySelectorAll(".clear-search");
  const clearFiltersButton = document.querySelector(".clear-filters-button");
  const clearTypeFiltersButton = document.querySelector(".clear-types-button");
  const clearAllButton = document.getElementById("clear-all");
  const sortSelect = document.getElementById("sort-select");
  const inkableSelect = document.getElementById("inkable-select");
  const minValueElement = document.getElementById("min-value");
  const maxValueElement = document.getElementById("max-value");
  const inputElements = document.querySelectorAll("input");

  let cardsDisplayed = 30;
  let cardsData = [];

  function displayCards(cards) {
    placeholderElement.style.display = "none";
    fileListElement.innerHTML = "";

    cards.slice(0, cardsDisplayed).forEach((cardData) => {
      const listItem = document.createElement("li");
      const imageElement = document.createElement("img");
      imageElement.setAttribute('data-src', cardData.Image);
      imageElement.alt = cardData.Name;
      listItem.textContent = `${cardData.Name}`;
      listItem.appendChild(imageElement);
      fileListElement.appendChild(listItem);
    });

    lazyLoadImages();
  }

  function lazyLoadImages() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.getAttribute('data-src');
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        });
      });

      lazyImages.forEach(img => {
        observer.observe(img);
      });

    } else {
      lazyImages.forEach(img => {
        img.src = img.getAttribute('data-src');
        img.removeAttribute('data-src');
      });
    }
  }

  function fetchDataAndDisplay() {
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        cardsData = data;
        filterAndDisplayCards();
        placeholderElement.style.display = "none";
      })
      .catch((error) => console.error("Error obtenint dades de l'API:", error));
  }

  function filterAndDisplayCards() {
    const activeColors = Array.from(colorFilters)
      .filter((filter) => filter.classList.contains("active"))
      .map((filter) => filter.getAttribute("data-color"));

    const activeTypes = Array.from(typeFilters)
      .filter((filter) => filter.classList.contains("active"))
      .map((filter) => filter.getAttribute("type"));

    const inkableValue = inkableSelect.value;
    const minInk = parseInt(minValueElement.innerHTML);
    const maxInk = parseInt(maxValueElement.innerHTML);

    let filteredCards = cardsData.filter((card) =>
      (activeColors.length === 0 || activeColors.includes(card.Color)) &&
      (activeTypes.length === 0 || activeTypes.includes(card.Type)) &&
      (inkableValue === "any" || card.Inkable === (inkableValue === "true")) &&
      card.Cost >= minInk && card.Cost <= maxInk &&
      card.Name !== "TEST" && !card.Name.includes("s Gull")
    );

    const sortBy = sortSelect.value;
    sortAndDisplayCards(filteredCards, sortBy);
  }
  const searchTerm = searchInput.value.toLowerCase();
  if (searchTerm) {
      filteredCards = filteredCards.filter((card) =>
          card.Name.toLowerCase().includes(searchTerm)
      );
  }

  // habilitats, text o classe
  const searchTermAtt = searchInputAtt.value.toLowerCase();
  if (searchTermAtt) {
      filteredCards = filteredCards.filter((card) => {
          const abilities = card.Abilities ? card.Abilities.toLowerCase() : '';
          const bodyText = card.Body_Text ? card.Body_Text.toLowerCase() : '';
          const classifications = card.Classifications ? card.Classifications.toLowerCase() : '';

          return (
              abilities.includes(searchTermAtt) ||
              bodyText.includes(searchTermAtt) ||
              classifications.includes(searchTermAtt)
          );
      });
  }


  // global (menys flavor_text, card_num i set_num)
  const searchTermGlobal = searchInputGlobal.value.toLowerCase();
  if (searchTermGlobal) {
      filteredCards = filteredCards.filter((card) => {
          const cardValues = Object.keys(card)
              .filter(key => key !== 'Flavor_Text' && key !== 'Set_Num' && key !== 'Card_Num')
              .map(key => card[key])
              .join(' ')
              .toLowerCase();
          return cardValues.includes(searchTermGlobal);
      });
  }
  // cancelar búsqueda
  function clearSearchInputs() {
      searchInput.value = "";
      searchInputAtt.value = "";
      searchInputGlobal.value = "";
  }
  clearSearchButton.addEventListener("click", function () {
      clearSearchInputs();
      filterAndDisplayCards();
  });

  function sortAndDisplayCards(cards, sortBy) {
    cards.sort((a, b) => {
      if (sortBy === "ink-cost") {
        return a.Cost - b.Cost;
      } else {
        return a.Name.localeCompare(b.Name);
      }
    });

    displayCards(cards);
  }

  function clearSearchInputs() {
    searchInputs.forEach(input => input.value = "");
  }

  function resetFilters() {
    colorFilters.forEach((button) => {
      button.style.backgroundColor = "#000";
    });
    colorFilters.forEach((filter) => {
      filter.classList.remove("active");
    });
  }

  clearFiltersButton.addEventListener("click", function () {
    resetFilters();
    filterAndDisplayCards();
  });

  colorFilters.forEach((button) => {
    button.addEventListener("click", function () {
      const color = this.getAttribute("btn-color");
      if (this.style.backgroundColor === color) {
        this.style.backgroundColor = "#000";
      } else {
        this.style.backgroundColor = color;
      }
    });
  });

  function resetTypeFilters() {
    typeFilters.forEach((button) => {
      if (button.classList.contains("active")) {
        button.style.backgroundColor = "#fff";
        button.style.color = "#000"; // Texto negro cuando el fondo es blanco y el filtro está activo
      } else {
        button.style.backgroundColor = "#000";
        button.style.color = "#fff"; // Texto blanco cuando el filtro no está activo
      }
    });
  
    typeFilters.forEach((filter) => {
      filter.classList.remove("active");
    });
  }
  
  

  clearTypeFiltersButton.addEventListener("click", function () {
    resetTypeFilters();
    filterAndDisplayCards();
  });

  function setInkableToDefault() {
    inkableSelect.value = "any";
  }

  function validateRange() {
    let minInk = parseInt(inputElements[0].value);
    let maxInk = parseInt(inputElements[1].value);

    if (minInk > maxInk) {
      [minInk, maxInk] = [maxInk, minInk]; // Swap values using array destructuring
    }

    minValueElement.innerHTML = minInk;
    maxValueElement.innerHTML = maxInk;

    filterAndDisplayCards();
  }

  function setDefaultRangeValues() {
    minValueElement.innerHTML = 1;
    maxValueElement.innerHTML = 10;
    inputElements[0].value = 1;
    inputElements[1].value = 10;
  }

  function loadMoreCards() {
    cardsDisplayed += 10;
    filterAndDisplayCards();
  }

  // Event listeners
  sortSelect.addEventListener("change", filterAndDisplayCards);

  clearFiltersButton.addEventListener("click", () => {
    resetFilters();
    filterAndDisplayCards();
  });

  clearTypeFiltersButton.addEventListener("click", () => {
    resetTypeFilters();
    filterAndDisplayCards();
  });

  clearAllButton.addEventListener("click", () => {
    clearSearchInputs();
    resetFilters();
    resetTypeFilters();
    setDefaultRangeValues();
    setInkableToDefault();
    filterAndDisplayCards();
  });

  inputElements.forEach((element) => {
    element.addEventListener("input", validateRange);
  });

  loadMoreButton.addEventListener("click", loadMoreCards);

  // Event listeners for color filters
  colorFilters.forEach((filter) => {
    filter.addEventListener("click", () => {
      filter.classList.toggle("active");
      if (filter.classList.contains("active")) {
        filter.style.backgroundColor = filter.getAttribute("data-color");
      } else {
        filter.style.backgroundColor = "#000";
      }
      filterAndDisplayCards();
    });
  });

  // Event listeners for type filters
  typeFilters.forEach((filter) => {
    filter.addEventListener("click", () => {
      filter.classList.toggle("active");
      if (filter.classList.contains("active")) {
        filter.style.backgroundColor = "#fff";
      } else {
        filter.style.backgroundColor = "#000";
      }
      filterAndDisplayCards();
    });
  });

  // Initial setup
  placeholderElement.style.display = "block";
  fetchDataAndDisplay();
});
