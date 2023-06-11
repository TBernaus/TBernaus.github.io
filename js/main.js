
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
            <div>
              <h3>${titol}</h3>
              <img src="../cards/images/${imatge}" alt="${titol}">
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
