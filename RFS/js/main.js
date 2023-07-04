let ingredients = [
    "pa",
    "formatge",
    "base",
    "verdureta",
    "wildMagic",
    "salsa",
]

let pa = [
    "Pagès",
    "Baguette",
    "Motlle",
    "Bagel",
    "Llavors",
    "Hamburguesa",
    "Pita",
    "Frankfurt",
];


let formatge = [
    "Fresc",
    "Tendre",
    "Rulo de cabra",
    "Semicurat",
    "Grana Padano",
    "Gouda",
    "Havarti",
    "Edam",
    "Cheddar",
    "Emmental",
    "Curat",
    "Cabra en llesques",
]


let base = [
    "Pernil salat",
    "Pernil dolç",
    "Llom",
    "Mortadela",
    "Tonyina",
    "Pollastre",
    "Frankfurt",
    "Bacó",
    "Hamburguesa",
    "Carn arrebossada",
    "Hamburguesa vegetal",
    "Rodó de pollastre",
    "Mandonguilles",
    "Tires vegetals",
    "Botifarra",
    "Tofu",
    "Carn picada",
    "Botifarra blanca",
    "Botifarra d'ou",
    "Fuet",
]

let verdureta = [
    "Enciam",
    "Ceba",
    "Tomàquet",
    "Escalivada",
    "Canonges",
    "Rúcula",
]

let wildMagic = [
    "Romaní",
    "All en pols",
    "Pebre",
    "Farigola",
    "Papinillu",
    "Olives",
    "Orenga",
    "Extra salsa",
    "Extra formatge",
    "Ceba cruixent",
    "Pinyons",
    "Nous",
]

let salsa = [
    "Pesto",
    "Bolets",
    "Formatges",
    "Tomàquet",
    "Guacamole",
    "Cesar",
    "Romesco",
    "Còctel",
    "Vinagre",
    "Mango i curry",
    "Olivada",
    "Barbacoa",
    "Allioli",
    "Mostassa",
    "Brava",
    "Maionesa",
    "Teriyaki",
    "Quètxup",
    "Hummus",
    "Espinaler",
]

function llistar(ingredient) {
    ingredient.forEach(element => {
        document.write(element + ", ")
    });
}

function escollir(ingredient) {
    const num = Math.floor(Math.random() * ingredient.length);
    let ingredientRandom = ingredient[num]
    document.write(ingredientRandom);
    return ingredientRandom
}

<<<<<<< HEAD
function reroll(ingredient) {
    // console.log(ingredient)
    const num = Math.floor(Math.random() * ingredient.length);
    // console.log(num)
    let ingredientRandom = ingredient[num]
    console.log(ingredientRandom)
    // console.log(document.getElementById("pa"))
    let div = document.getElementById(ingredient);
    console.log(div)
}

// function reroll(ingredient) {
//     let div = document.getElementById(ingredient);
//     let canvi = escollir(ingredient)
//     console.log(canvi)
//     div.write = canvi;
// }
=======
function lastWord(words) {
    let n = words.replace(/[\[\]?.,\/#!$%\^&\*;:{}=\\|_~()]/g, "").split(" ");
    return n[n.length - 1];
}

function reroll(ingredient, divID) {
    let modificat = document.getElementById(divID).innerHTML;
    console.log(modificat)
    if (modificat.startsWith("<script>")) {
        let altre = lastWord(modificat)
        console.log(altre)
    }
    const num = Math.floor(Math.random() * ingredient.length);
    let ingredientRandom = ingredient[num]
    document.getElementById(divID).innerHTML = ingredientRandom
}
>>>>>>> 4ce354c (reroll)
