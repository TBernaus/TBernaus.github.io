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

function llistar(ingredient){
    ingredient.forEach(element => {
        document.write(element+", ")
    });
}

function escollir(ingredient){
    const num = Math.floor(Math.random()*ingredient.length);
    let ingredientRandom = ingredient[num]
    document.getElementById("pa").innerHTML=document.write(ingredientRandom);
}

