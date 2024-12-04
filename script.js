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

// menú lateral
// document.addEventListener("scroll", () => {
//     const fromTop = window.scrollY + 100;

//     menuLinks.forEach(link => {
//         const section = document.querySelector(link.getAttribute("href"));

//         if (
//             section.offsetTop <= fromTop &&
//             section.offsetTop + section.offsetHeight > fromTop
//         ) {
//             link.classList.add("active");
//         } else {
//             link.classList.remove("active");
//         }
//     });
// });

document.querySelectorAll('aside a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault(); // Evita el comportamiento predeterminado
        const targetId = this.getAttribute('href'); // Obtén el id de destino
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            // Calcula la posición con el margen deseado
            const headerHeight = document.querySelector('header').offsetHeight;
            const offsetTop = targetElement.offsetTop - headerHeight - 20; // 20px de margen adicional

            // Realiza el desplazamiento suave
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});