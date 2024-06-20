const apiUrl = "https://api.lorcana-api.com/cards/all";
export let cardsData = [];

export function fetchCardsData() {
  return fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      cardsData = data;
      return data;
    });
}
