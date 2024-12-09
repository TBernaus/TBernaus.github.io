// Mapa de identificadores de facción (sin incluir RU: Runeterra)
const factionMapping = {
    DE: 0,
    FR: 1,
    IO: 2,
    NX: 3,
    PZ: 4,
    SI: 5,
    BW: 6,
    SH: 7,
    MT: 9,
    BC: 10,
};

// Leer y cargar datos del archivo JSON
let cardData = [];
fetch('./cards.json')
    .then((response) => response.json())
    .then((data) => {
        cardData = data.filter((card) => card.collectible);
    })
    .catch((err) => console.error('Error al cargar el archivo cards.json:', err));

// Seleccionar regiones aleatorias (excluyendo RU: Runeterra)
const selectRandomRegions = () => {
    const regions = Object.keys(factionMapping);
    const firstRegion = regions[Math.floor(Math.random() * regions.length)];
    let secondRegion = firstRegion;
    while (secondRegion === firstRegion) {
        secondRegion = regions[Math.floor(Math.random() * regions.length)];
    }
    return [firstRegion, secondRegion];
};

// Función para obtener el código abreviado de una región
const getRegionCode = (regionName) => {
    const regionMapping = {
        DE: "Demacia",
        FR: "Freljord",
        IO: "Ionia",
        NX: "Noxus",
        PZ: "Piltover & Zaun",
        SI: "Shadow Isles",
        BW: "Bilgewater",
        MT: "Mount Targon",
        SH: "Shurima",
        BC: "Bandle City",
    };
    for (const [code, name] of Object.entries(regionMapping)) {
        if (name === regionName) return code;
    }
    return null; // Si no coincide, devolver null
};

// Generar un mazo aleatorio basado en las restricciones
const generateRandomDeck = () => {
    const deck = [];
    const cardCounts = {}; // Rastrea el número de copias por carta
    const championCount = { count: 0 };
    const selectedRegions = selectRandomRegions();

    // Filtrar cartas válidas
    const validCards = cardData.filter((card) => {
        const cardRegions = card.regions.map((region) => getRegionCode(region));
        return (
            card.collectible &&
            cardRegions.some((region) => selectedRegions.includes(region)) &&
            card.rarity && card.rarity !== "None" &&
            typeof card.cost === "number"
        );
    });

    if (validCards.length === 0) {
        console.error("No hay cartas válidas para construir un mazo.");
        return [];
    }

    // Construir mazo hasta tener exactamente 40 cartas
    while (deck.length < 40) { 
        const randomCard = validCards[Math.floor(Math.random() * validCards.length)];
        if (!randomCard) continue;

        const cardCode = randomCard.cardCode;
        const isChampion = randomCard.rarity.toLowerCase() === "champion";
        const currentCount = cardCounts[cardCode] || 0;

        // Verificar restricciones
        if (
            currentCount < 3 && 
            (!isChampion || championCount.count < 6)
        ) {
            // Solo agregar si no excederá el total de 40 cartas
            if (deck.length < 40) {
                deck.push(cardCode);
                cardCounts[cardCode] = currentCount + 1;
                if (isChampion) championCount.count++;
            }
        }

        // Si el mazo tiene 40 cartas, salimos del bucle
        if (deck.length === 40) {
            break;
        }
    }

    // Validar que el mazo tenga exactamente 40 cartas
    if (deck.length !== 40) {
        console.error("Error: El mazo no tiene exactamente 40 cartas.");
    }

    // Crear la lista expandida con copias exactas
    const finalDeck = [];
    for (const code of Object.keys(cardCounts)) {
        const count = cardCounts[code];
        for (let i = 0; i < count; i++) {
            finalDeck.push(code);
        }
    }

    console.log(finalDeck.length);
    return finalDeck;
};
const displayResult = (deck, deckCode, format) => {
    const resultDiv = document.getElementById('result');
    const copyButton = document.getElementById('copy-deckcode');
    const cardListDiv = document.getElementById('card-list');

    resultDiv.innerHTML = `
      <p>${deckCode}</p>
      <p>El mazo es del formato ${format}</p>
    `;

    copyButton.style.display = 'block';
    copyButton.onclick = () => {
        navigator.clipboard.writeText(deckCode);
        console.log('Código del mazo copiado al portapapeles');
    };

    // Mostrar las cartas como imágenes (respetando copias)
    cardListDiv.innerHTML = '';
    const cardInstances = {};
    deck.forEach((cardCode) => {
        if (!cardInstances[cardCode]) cardInstances[cardCode] = 0;
        cardInstances[cardCode]++;
    });

    Object.entries(cardInstances).forEach(([cardCode, count]) => {
        const card = cardData.find((c) => c.cardCode === cardCode);
        if (card) {
            for (let i = 0; i < count; i++) {
                const img = document.createElement('img');
                img.src = card.assets[0].gameAbsolutePath;
                img.alt = card.name;
                img.classList.add('card-image');
                cardListDiv.appendChild(img);
            }
        }
    });
};




// Generar el código de mazo
const generateDeckCode = (deck) => {
    const cardCounts = {};

    // Contar las ocurrencias de cada carta
    deck.forEach((code) => {
        if (!cardCounts[code]) cardCounts[code] = 0;
        cardCounts[code]++;
    });

    // Organizar las cartas por cantidad y set/facción
    const groupedCards = Object.entries(cardCounts).reduce(
        (acc, [cardCode, count]) => {
            const set = parseInt(cardCode.slice(0, 2), 10);
            const faction = factionMapping[cardCode.slice(2, 4)];
            const cardNum = parseInt(cardCode.slice(4), 10);

            if (!acc[count]) acc[count] = [];
            let group = acc[count].find((g) => g.set === set && g.faction === faction);

            if (!group) {
                group = { set, faction, cards: [] };
                acc[count].push(group);
            }

            group.cards.push(cardNum);
            return acc;
        },
        {}
    );

    // Ordenar las listas
    const sortedGroups = Object.entries(groupedCards).map(([count, groups]) => ({
        count: parseInt(count, 10),
        groups: groups
            .map((g) => ({
                ...g,
                cards: g.cards.sort((a, b) => a - b),
            }))
            .sort((a, b) => a.cards.length - b.cards.length),
    }));

    // Crear un byte array
    const byteArray = [];
    byteArray.push(0x14); 

    sortedGroups.forEach(({ count, groups }) => {
        byteArray.push(groups.length);

        groups.forEach((group) => {
            byteArray.push(group.cards.length);
            byteArray.push(group.set);
            byteArray.push(group.faction);

            group.cards.forEach((cardNum) => {
                encodeVarInt(byteArray, cardNum);
            });
        });
    });

    // Codificar en Base32
    return encodeBase32(byteArray);
};

// Codificación VarInt (big endian)
const encodeVarInt = (byteArray, value) => {
    const bytes = [];
    while (value > 0) {
        bytes.push(value & 0x7f);
        value >>= 7;
    }
    bytes.reverse().forEach((byte, index) => {
        byteArray.push(index === bytes.length - 1 ? byte : byte | 0x80);
    });
};

// Codificar en Base32
const encodeBase32 = (byteArray) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let output = '';

    for (const byte of byteArray) {
        value = (value << 8) | byte;
        bits += 8;

        while (bits >= 5) {
            output += alphabet[(value >> (bits - 5)) & 0x1f];
            bits -= 5;
        }
    }

    if (bits > 0) {
        output += alphabet[(value << (5 - bits)) & 0x1f];
    }

    return output;
};

// Evento para generar mazo aleatorio
document.getElementById('generate-random').onclick = () => {
    const deck = generateRandomDeck();
    const deckCode = generateDeckCode(deck);
    displayResult(deck, deckCode, 'eterno');
};

// Mostrar el resultado
// const displayResult = (deck, deckCode, format) => {
//     const resultDiv = document.getElementById('result');
//     const copyButton = document.getElementById('copy-deckcode');
//     const cardListDiv = document.getElementById('card-list');

//     resultDiv.innerHTML = `
//       <p>${deckCode}</p>
//       <p>El mazo es del formato ${format}</p>
//     `;

//     copyButton.style.display = 'block';
//     copyButton.onclick = () => {
//         navigator.clipboard.writeText(deckCode);
//         console.log('Código del mazo copiado al portapapeles');
//     };

//     // Mostrar las cartas como imágenes
//     cardListDiv.innerHTML = '';
//     deck.forEach((cardCode) => {
//         const card = cardData.find((c) => c.cardCode === cardCode);
//         if (card) {
//             const img = document.createElement('img');
//             img.src = card.assets[0].gameAbsolutePath;
//             img.alt = card.name;
//             img.classList.add('card-image');
//             cardListDiv.appendChild(img);
//         }
//     });
// };
