import { displayCards } from "./display.js";

const sortSelect = document.getElementById("sort-select");
let isOrderReversed = false;

export function sortAndDisplayCards(cards) {
  const sortBy = sortSelect.value;
  cards.sort((a, b) => {
    if (sortBy === "color") {
      return a.Color.localeCompare(b.Color) || a.Cost - b.Cost || a.Name.localeCompare(b.Name);
    } else if (sortBy === "card-number") {
      return a.Set_Num - b.Set_Num || a.Card_Num - b.Card_Num;
    } else {
      return a.Cost - b.Cost || a.Name.localeCompare(b.Name);
    }
  });

  if (isOrderReversed) {
    cards.reverse();
  }
}
