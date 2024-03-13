document.addEventListener("DOMContentLoaded", function () {

  const showFiltersButton = document.querySelector(".filtresBtn");
  const showColorFiltersButton = document.querySelector(".filtres-colors-Btn");
  const showTypeFiltersButton = document.querySelector(".filtres-tipus-Btn");
  const filtersContainer = document.getElementById("filtres");
  const filtersGlobal = document.getElementById("filtres-global");
  const colorFiltersContainer = document.getElementById("color-filters");
  const typeFiltersContainer = document.getElementById("card-type");

  filtersContainer.classList.add("showing");
  filtersGlobal.classList.add("showing-general");

  // general
  showFiltersButton.addEventListener("click", function () {
    if (filtersContainer.classList.contains("showing")) {
      filtersContainer.classList.remove("showing");
      filtersContainer.classList.add("hiding");
      showFiltersButton.innerHTML = "Mostra els filtres";
      setTimeout(() => {
        filtersContainer.style.display = "none";
      }, 300); 
    } else {
      filtersContainer.classList.remove("hiding");
      filtersContainer.classList.add("showing");
      filtersContainer.style.display = "inline-block";
      showFiltersButton.innerHTML = "Amaga els filtres";
    }
  });

  // colors
  showColorFiltersButton.addEventListener("click", function () {
    if (colorFiltersContainer.style.display === "none" || colorFiltersContainer.style.display === "") {
      colorFiltersContainer.style.display = "inline-block";
      showColorFiltersButton.innerHTML = "Amaga els filtres per colors";
    } else {
      colorFiltersContainer.style.display = "none";
      showColorFiltersButton.innerHTML = "Mostra els filtres per colors";
    }
  });

  // tipus
  showTypeFiltersButton.addEventListener("click", function () {
    if (typeFiltersContainer.style.display === "none" || typeFiltersContainer.style.display === "") {
      typeFiltersContainer.style.display = "inline-block";
      showTypeFiltersButton.innerHTML = "Amaga els filtres per tipus";
    } else {
      typeFiltersContainer.style.display = "none";
      showTypeFiltersButton.innerHTML = "Mostra els filtres per tipus";
    }
  });

});
