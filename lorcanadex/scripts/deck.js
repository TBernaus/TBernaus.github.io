document.addEventListener("DOMContentLoaded", function () {
    const saveDeckButton = document.getElementById("save-deck-button");
    const clearDeckButton = document.getElementById("clear-deck-button");
    const deckListElement = document.getElementById("deck-list");
    const deckTitle = document.getElementById("deck-title");
    let deck = [];

    function loadDeck() {
        const savedDeck = localStorage.getItem("lorcanaDeck");
        if (savedDeck) {
            deck = JSON.parse(savedDeck);
            renderDeck();
        }
    }

    function renderDeck() {
        deckListElement.innerHTML = '';
        let totalCards = 0;
        deck.forEach((card, index) => {
            totalCards += card.copies;
            const listItem = document.createElement("li");
            listItem.className = "deck-card";

            const cardContainer = document.createElement("div");
            cardContainer.className = "card-container";

            for (let i = 0; i < card.copies; i++) {
                const cardImage = document.createElement("img");
                cardImage.src = card.Image;
                cardImage.alt = card.Name;
                cardImage.className = "card-image";
                cardImage.style.left = `${i * 10}px`;
                cardImage.style.top = `${i * 10}px`;
                cardContainer.appendChild(cardImage);
            }

            const cardName = document.createElement("p");
            cardName.textContent = `${card.Name} (x${card.copies})`;
            cardName.className = "card-name";

            const cardControls = document.createElement("div");
            cardControls.className = "card-controls";

            const addButton = document.createElement("button");
            addButton.textContent = "+";
            addButton.className = "control-button";
            addButton.addEventListener("click", () => {
                if (card.copies < 4) {
                    card.copies++;
                    renderDeck();
                } else {
                    console.log("No pots tenir més de 4 còpies per carta.");
                }
            });

            const removeButton = document.createElement("button");
            removeButton.textContent = "-";
            removeButton.className = "control-button";
            removeButton.addEventListener("click", () => {
                if (card.copies > 1) {
                    card.copies--;
                } else {
                    deck.splice(index, 1);
                }
                renderDeck();
            });

            cardControls.appendChild(addButton);
            cardControls.appendChild(removeButton);

            listItem.appendChild(cardContainer);
            listItem.appendChild(cardName);
            listItem.appendChild(cardControls);
            deckListElement.appendChild(listItem);
        });

        deckTitle.textContent = `El teu Deck (${totalCards} cartes)`;
    }

    function saveDeck() {
        localStorage.setItem("lorcanaDeck", JSON.stringify(deck));
        console.log("Deck guardat correctament");
    }

    function clearDeck() {
        deck = [];
        renderDeck();
        localStorage.removeItem("lorcanaDeckTBernaus");
    }

    document.getElementById("file-list").addEventListener("click", function (e) {
        if (e.target.tagName === "LI" || e.target.tagName === "IMG") {
            const cardElement = e.target.tagName === "LI" ? e.target : e.target.parentElement;
            const cardName = cardElement.textContent.trim();
            const cardImage = cardElement.querySelector("img").src;

            if (!cardImage) {
                console.error("No s'ha trobat la URL de l'imatge per a la carta: ", cardName);
                return;
            }

            const existingCard = deck.find(card => card.Name === cardName);
            if (existingCard) {
                if (existingCard.copies < 4) {
                    existingCard.copies++;
                } else {
                    console.log("No pots tenir més de 4 còpies de la mateixa carta.");
                }
            } else {
                deck.push({
                    Name: cardName,
                    Image: cardImage,
                    copies: 1
                });
            }

            renderDeck();
        }
    });

    saveDeckButton.addEventListener("click", saveDeck);
    clearDeckButton.addEventListener("click", clearDeck);

    loadDeck();
});
