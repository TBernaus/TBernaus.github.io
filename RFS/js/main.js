function llistar(ingredient) {
    // ingredient.forEach(element => {
    //     document.write(element + ", ")
    // });
    document.write(ingredient)
}

function rellistar(ingredient){
    document.getElementById('Llista').innerHTML= ingredient;
}

function escollir(ingredient) {
    const num = Math.floor(Math.random() * ingredient.length);
    let ingredientRandom = ingredient[num]
    document.write(ingredientRandom);
}

function reroll(ingredient, divID) {
    if (comptador<=0){
        alert("no et queden rerolls uwu")
    }
    else{
        comptador--
        const num = Math.floor(Math.random() * ingredient.length);
        let ingredientRandom = ingredient[num]
        document.getElementById(divID).innerHTML = ingredientRandom
        document.getElementById('comptador').innerHTML = comptador
    }
}