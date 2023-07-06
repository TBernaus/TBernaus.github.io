function crear(){
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
            <button onclick="descobreix(${el}, '${el}', 'boto${el}')">${el}</button>
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

function llistar(ingredient) {
    let contingut = ingredient.join(', ')
    document.getElementById('Llista').innerHTML = contingut;
}

function escollir(ingredient) {
    const num = Math.floor(Math.random() * ingredient.length);
    let ingredientRandom = ingredient[num]
    document.write(ingredientRandom);
}

function descobreix(ingredient, divID, botoID) {
    text = `<button onclick="reroll(${divID}, '${divID}')">Reroll</button>`
    const num = Math.floor(Math.random() * ingredient.length);
    let ingredientRandom = ingredient[num]
    document.getElementById(divID).innerHTML = ingredientRandom
    document.getElementById(botoID).innerHTML = text
}

function reroll(ingredient, divID) {
    if (comptador <= 0) {
        alert("no et queden rerolls uwu")
    }
    else {
        comptador--
        const num = Math.floor(Math.random() * ingredient.length);
        let ingredientRandom = ingredient[num]
        document.getElementById(divID).innerHTML = ingredientRandom
        document.getElementById('comptador').innerHTML = comptador
    }
}