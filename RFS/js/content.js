function crearIngredients(){
    let container = document.getElementById("container")
    ingredients.forEach(el => {
        let text = `
        <h3>${el}</h3>
        <div id="${el}DIV">
            <p id="${el}">
                Descobreix ${el}
            </p>
        </div>
        <div class="boto" id="boto${el}">
            <button onclick="descobreix(${el}, '${el}', 'boto${el}')">Descobreix</button>
        </div>`
        container.innerHTML+=text
    });
}

function crearBotonsLlista(){
    let botonsLlista = document.getElementById("botonsLlista")
    ingredients.forEach(el => {
        let botons = `<button class="llistatBTN" onclick="llistar(${el})">${el}</button>`
        botonsLlista.innerHTML+=botons
    });
}