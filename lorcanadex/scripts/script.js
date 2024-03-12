document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = "https://api.lorcana-api.com/cards/all";
  const sortSelect = document.getElementById("sort-select");
  const colorFilters = document.querySelectorAll(".color-filter");
  const inkableSelect = document.getElementById("inkable-select");
  const searchInput = document.getElementById("search-input");
  const searchInputAtt = document.getElementById("search-input-att");
  const searchInputGlobal = document.getElementById("search-input-global");
  let cardsDisplayed = 30;
  const fileListElement = document.getElementById("file-list"); 
  let cardsData = [];
  const placeholderElement = document.getElementById("placeholder"); 


  /*
        ##############################################
        ############### OBTENIR CARTES ###############
        ##############################################
    */
  function displayCards(cards) 
  {
      placeholderElement.style.display = "none";
      fileListElement.innerHTML = "";
      const filteredCards = cards.slice(0, cardsDisplayed);
      
      filteredCards.forEach((cardData) => {
        console.log(cardData)
          const listItem = document.createElement("li");
          const imageElement = document.createElement("img");
          imageElement.setAttribute('data-src', cardData.Image);
          imageElement.alt = cardData.Name;
          listItem.textContent = `${cardData.Name}`;
          listItem.appendChild(imageElement);
          fileListElement.appendChild(listItem);
      });
  
      function lazyLoadImages() 
      {
          const lazyImages = document.querySelectorAll('img[data-src]');
          if ("IntersectionObserver" in window) 
          {
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

          } 
          else 
          {
              lazyImages.forEach(img => {
                  img.src = img.getAttribute('data-src');
                  img.removeAttribute('data-src');
              });
          }
      }
      lazyLoadImages();
  }
  placeholderElement.style.display = "block";
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      cardsData = data;
      filterAndDisplayCards();
    })
    .catch((error) => console.error("Error obtenint dades de l'API:", error));

    
  /*
        ##############################################
        ############### FILTRAR CARTES ###############
        ##############################################
    */

  function filterAndDisplayCards() {
    const activeColors = Array.from(colorFilters)
      .filter((filter) => filter.classList.contains("active"))
      .map((filter) => filter.getAttribute("data-color"));

    let filteredCards = cardsData;

    if (activeColors.length > 0) {
      filteredCards = cardsData.filter((card) =>
        activeColors.includes(card.Color)
      );
    }

    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
      filteredCards = filteredCards.filter((card) =>
        card.Name.toLowerCase().includes(searchTerm)
      );
    }

    const searchTermAtt = searchInputAtt.value.toLowerCase();
    if (searchTermAtt) {
      filteredCards = filteredCards.filter((card) => {
        if (card.Abilities && card.Body_Text && card.Classifications) {
          return (
            card.Abilities.toLowerCase().includes(searchTermAtt) ||
            card.Body_Text.toLowerCase().includes(searchTermAtt) ||
            card.Classifications.toLowerCase().includes(searchTermAtt)
          );
        } else {
          return false;
        }
      });
    }

    const searchTermGlobal = searchInputGlobal.value.toLowerCase();
if (searchTermGlobal) {
  filteredCards = filteredCards.filter((card) => {
    const cardValues = Object.values(card).join(' ').toLowerCase();
    return cardValues.includes(searchTermGlobal);
  });
}

    const inkableValue = inkableSelect.value;
    if (inkableValue !== "any") {
      const inkableBoolean = inkableValue === "true";
      filteredCards = filteredCards.filter(
        (card) => card.Inkable === inkableBoolean
      );
    }
    const minInk = parseInt(document.getElementById("min-value").innerHTML);
    const maxInk = parseInt(document.getElementById("max-value").innerHTML);
    filteredCards = filteredCards.filter(
      (card) => card.Cost >= minInk && card.Cost <= maxInk
    );

    filteredCards = filteredCards.filter(
      (card) =>
        card.Name !== "TEST" &&
        !card.Name.includes("s Gull") 
    );
    const sortBy = sortSelect.value;
    sortAndDisplayCards(filteredCards, sortBy);


    const totalFilteredCards = filteredCards.length;
    const filteredAndDisplayedCards = filteredCards.slice(0, cardsDisplayed);
    displayCards(filteredAndDisplayedCards);
    if (cardsDisplayed >= totalFilteredCards) {
        loadMoreButton.style.display = "none";
    } else {
        loadMoreButton.style.display = "block";
    }

    // Chernabog's Followers de lila a groc per error de la API
const chernabogsFollowersCard = cardsData.find(card => card.Name === "Chernabog's Followers");
if (chernabogsFollowersCard) {
    chernabogsFollowersCard.Color = "Amethyst";
} 

  }

  sortSelect.addEventListener("change", function () {
    filterAndDisplayCards();
  });

  colorFilters.forEach((filter) => {
    filter.addEventListener("click", function () {
      this.classList.toggle("active");
      filterAndDisplayCards();
    });
  });

  searchInput.addEventListener("input", function () {
    filterAndDisplayCards();
  });

  inkableSelect.addEventListener("change", function () {
    filterAndDisplayCards();
  });

  /*
        ###############################################
        ############### ENDREÇAR CARTES ###############
        ###############################################
    */
  function sortAndDisplayCards(cards, sortBy) {
    cards.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "card-number":
          comparison = a.Card_Num - b.Card_Num;
          break;
        case "ink-cost":
          comparison = a.Cost - b.Cost;
          break;
        default:
          comparison = a.Name.localeCompare(b.Name);
          break;
      }

      if (isOrderReversed) {
        comparison *= -1;
      }

      return comparison;
    });

    displayCards(cards);
  }

  /*
        ###############################################
        ################ INVERTIR COST ################
        ###############################################
    */
  const invertOrderButton = document.getElementById("invert-order-button");
  let isOrderReversed = false;

  invertOrderButton.addEventListener("click", function () {
    isOrderReversed = !isOrderReversed;
    filterAndDisplayCards();
  });
  const colorButtonsInv = document.querySelectorAll("#invert-order-button");
  colorButtonsInv.forEach((button) => {
    button.addEventListener("click", function () {

        const computedStyle = window.getComputedStyle(this);
        const backgroundColor = computedStyle.backgroundColor;
        if (backgroundColor === "rgb(0, 0, 0)") {
        this.style.backgroundColor = "#fff";
        this.style.color = "#000";
      } else {
        this.style.backgroundColor = "#000";
        this.style.color = "#fff"; 
      }
    });
  });


  /*
        ##############################################
        ############# FILTRAR PER COLORS #############
        ##############################################
    */

  const colorButtons = document.querySelectorAll(".color-filter");
  const clearFiltersButton = document.querySelector(".clear-filters-button");

  function resetFilters() {
    colorButtons.forEach((button) => {
      button.style.backgroundColor = "#000";
    });
    colorFilters.forEach((filter) => {
      filter.classList.remove("active");
    });
    filterAndDisplayCards();
  }

  clearFiltersButton.addEventListener("click", function () {
    resetFilters();
  });

  colorButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const color = this.getAttribute("btn-color");
      if (this.style.backgroundColor === color) {
        this.style.backgroundColor = "#000";
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
  /*
        ###################################################
        ############### CARREGAR MÉS CARTES ###############
        ###################################################
    */

  const loadMoreButton = document.getElementById("load-more-button");
  loadMoreButton.addEventListener("click", loadMoreCards);

  function loadMoreCards() {
    cardsDisplayed += 10;
    filterAndDisplayCards();
  }
});
