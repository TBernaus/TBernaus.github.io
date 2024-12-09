// Mapa de identificadores de facción
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
    RU: 12,
};

// Leer y cargar datos del archivo JSON
let cardData = [];
fetch('./cards.json')
    .then((response) => response.json())
    .then((data) => {
        cardData = data.filter((card) => card.collectible);
    })
    .catch((err) => console.error('Error al cargar el archivo cards.json:', err));


// Seleccionar regiones aleatorias
const selectRandomRegions = () => {
    const regions = Object.keys(factionMapping);
    const selectedRegions = [regions[Math.floor(Math.random() * regions.length)]];
    if (Math.random() > 0.05) {
        let secondRegion;
        do {
            secondRegion = regions[Math.floor(Math.random() * regions.length)];
        } while (secondRegion === selectedRegions[0]);
        selectedRegions.push(secondRegion);
    }
    console.log(selectedRegions)
    return selectedRegions;
};
// Generar un mazo aleatorio
const generateRandomDeck = () => {
    const deck = [];

  const selectedRegions = selectRandomRegions();
    const cardPool = [...cardData];
    while (deck.length < 40) {
        const randomCard = cardPool[Math.floor(Math.random() * cardPool.length)];
        
        if (deck.filter((c) => c === randomCard.cardCode).length < 3) {
            deck.push(randomCard.cardCode);
        }
    }
    
    console.count(deck.length)
    return deck;
};

// Generar un mazo equilibrado
const generateBalancedDeck = () => {
    const deck = [];
    const cardPool = [...cardData];
    const manaCurve = [6, 10, 10, 8, 4, 2]; // Distribución aproximada de costos de maná
    let currentManaSlot = 0;

    while (deck.length < 40) {
        const filteredPool = cardPool.filter((card) => card.cost === currentManaSlot);
        if (filteredPool.length === 0 || manaCurve[currentManaSlot] <= 0) {
            currentManaSlot = (currentManaSlot + 1) % manaCurve.length;
            continue;
        }

        const randomCard = filteredPool[Math.floor(Math.random() * filteredPool.length)];
        if (deck.filter((c) => c === randomCard.cardCode).length < 3) {
            deck.push(randomCard.cardCode);
            manaCurve[currentManaSlot]--;
        }
    }
    return deck;
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
    byteArray.push(0x14); // Formato y versión (1 << 4) | 4

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

// Evento para generar mazo equilibrado
document.getElementById('generate-balanced').onclick = () => {
    const deck = generateBalancedDeck();
    const deckCode = generateDeckCode(deck);
    displayResult(deck, deckCode, 'eterno');
};

// Mostrar el resultado
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

    // Mostrar las cartas como imágenes
    cardListDiv.innerHTML = '';
    deck.forEach((cardCode) => {
        const card = cardData.find((c) => c.cardCode === cardCode);
        if (card) {
            console.log(card.name)
            const img = document.createElement('img');
            img.src = card.assets[0].gameAbsolutePath;
            img.alt = card.name;
            img.classList.add('card-image');
            cardListDiv.appendChild(img);
        }
    });
};
