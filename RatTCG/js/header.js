// Crear un elemento de encabezado
var encabezado = document.createElement("h1");

// Crear el contenido del encabezado
var textoEncabezado = document.createTextNode("");

// Agregar el contenido al elemento de encabezado
encabezado.appendChild(textoEncabezado);

// Agregar el encabezado al cuerpo del documento
document.body.appendChild(encabezado);


// var menu = document.createElement("ul");

// var enlaces = ["Informació", "Llistat de cartes", "Perfil"]; // Los enlaces que deseas mostrar
// var rutaActual = obtenerRutaActual(); // Aquí debes obtener la ruta actual de tu página (por ejemplo, mediante la URL o alguna lógica específica)

// for (var i = 0; i < enlaces.length; i++) {
//   var enlace = enlaces[i];
//   var elementoLista = document.createElement("li");
//   var enlaceElemento = document.createElement("a");

//   enlaceElemento.textContent = enlace;
//   enlaceElemento.setAttribute("href", enlace + ".html"); // Ajusta las rutas según las páginas que tengas

//   if (enlace === rutaActual) {
//     elementoLista.classList.add("pagina-actual"); // Añade una clase para resaltar el elemento de la página actual
//   }

//   elementoLista.appendChild(enlaceElemento);
//   menu.appendChild(elementoLista);
// }

// document.body.appendChild(menu);
