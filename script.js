const langButtons = document.querySelectorAll(".lang-btn");
const elements = document.querySelectorAll("[data-lang]");
const menuLinks = document.querySelectorAll(".menu-link");

// idioma
langButtons.forEach(button => {
    button.addEventListener("click", () => {
        const selectedLang = button.getAttribute("data-lang");

        elements.forEach(el => {
            const lang = el.getAttribute("data-lang");
            el.style.display = lang === selectedLang ? "" : "none";
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.querySelector('.menu-btn');
    const aside = document.querySelector('aside');

    menuBtn.addEventListener('click', function(){
        aside.classList.toggle('active')
    });
});