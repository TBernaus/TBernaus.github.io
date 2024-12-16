const langButtons = document.querySelectorAll(".lang-btn");
const skillsButtons = document.querySelectorAll(".skills-btn");
const elements = document.querySelectorAll("[data-lang]");
const skills = document.querySelectorAll("[data-skills]");
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

// skills
skillsButtons.forEach(button => {
    button.addEventListener("click", () => {
        const selectedSkills = button.getAttribute("data-skills");

        skills.forEach(el => {
            const skillType = el.getAttribute("data-skills");
             el.style.display = skillType === selectedSkills ? "" : "none";
        });
    });
});


// aside
document.querySelectorAll('aside a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            const headerHeight = document.querySelector('header').offsetHeight;
            const offsetTop = targetElement.offsetTop - headerHeight - 20;

            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

