document.addEventListener("DOMContentLoaded", function () {

    const showFiltersButton = document.querySelector(".filtresBtn");
    const filtersContainer = document.getElementById("filtres");
    const filtersGlobal = document.getElementById("filtres-global");
  
    filtersContainer.classList.add("showing");
    filtersGlobal.classList.add("showing-general");
  
    showFiltersButton.addEventListener("click", function () {
      if (filtersContainer.classList.contains("showing")) {
        filtersContainer.classList.remove("showing");
        filtersContainer.classList.add("hiding");
        filtersGlobal.classList.remove("showing-general");
        showFiltersButton.innerHTML="Mostra els filtres"
      } else {
        filtersContainer.style.display = "block";
        filtersContainer.classList.remove("hiding");
        filtersContainer.classList.add("showing");
        filtersGlobal.classList.add("showing-general");
        showFiltersButton.innerHTML="Amaga els filtres"
      }
    });
  
    filtersContainer.addEventListener("animationend", function () {
      if (filtersContainer.classList.contains("hiding")) {
        filtersContainer.style.display = "none";
      }
    });
  
  });
  