let amagat = true;

function descobreix(ingredient, ingDIV, botoID) {
    text = `<button onclick="reroll(${ingDIV}, '${ingDIV}')">Reroll</button>`
    const num = Math.floor(Math.random() * ingredient.length);
    let ingredientRandom = ingredient[num]
    document.getElementById(ingDIV).innerHTML = ingredientRandom
    document.getElementById(botoID).innerHTML = text
    amagat = false
}

function desbloca() {
    if (amagat == true){
        let llistat = [pa, formatge, base, verdureta, wildMagic, salsa, pizza]
        let i=0
        ingredients.forEach(el => {
            descobreix(llistat[i], el, 'boto'+el)
            i++
        });
        amagat = false
    }
    else(
        amagat = false
    )
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

function llistar(ingredient) {
    let contingut = ingredient.join(', ')
    document.getElementById('Llista').innerHTML = contingut;
}