
fetch('../cards/list.json')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        for (const carta in data) {
            if (data.hasOwnProperty(carta)) {
                const {
                    titol,
                    mana,
                    imatge,
                    tipus,
                    faccio,
                    efecte,
                    poder,
                    vida
                } = data[carta];
                const cartaHtml = `
            <div class="${mana}">
              <h3>${titol}</h3>
              
              <img src="https://github.com/TBernaus/TBernaus.github.io/tree/main/RatTCG/cards/images/${imatge}.PNG?raw=true" alt="${titol}">
              <p><strong>Coste de mana:</strong> ${mana}</p>
              <p><strong>tipus:</strong> ${tipus}</p>
              <p><strong>faccio:</strong> ${faccio.join(', ')}</p>
              <p><strong>efecte:</strong> ${efecte.join(', ')}</p>
              <p><strong>Poder:</strong> ${poder}</p>
              <p><strong>Vida:</strong> ${vida}</p>
            </div>
            <br>
          `;
                contenedorTexto.innerHTML += cartaHtml;
            }
        }
    })
    .catch(error => {
        console.error('Error al cargar el archivo JSON:', error);
        contenedorTexto.innerHTML += `No hi ha cap carta encara a la llista`;
    });
