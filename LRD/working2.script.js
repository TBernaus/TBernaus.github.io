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
    const firstRegion = regions[Math.floor(Math.random() * regions.length)];
    const secondRegion =
        Math.random() > 0.05
            ? regions[Math.floor(Math.random() * regions.length)]
            : firstRegion;
    return [firstRegion, secondRegion];
};

// Generar un mazo aleatorio basado en las restricciones// Mapeo de regiones
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
    RU: "Runeterra",
};

// Función para obtener el código abreviado de una región
const getRegionCode = (regionName) => {
    for (const [code, name] of Object.entries(regionMapping)) {
        if (name === regionName) return code;
    }
    return null; // Si no coincide, devolver null
};


const generateRandomDeck = () => {
    const deck = [];
    const cardCounts = {}; // Rastrea el número de copias por carta
    const championCount = { count: 0 };
    const selectedRegions = selectRandomRegions();
    const regionCount = { [selectedRegions[0]]: 0, [selectedRegions[1] || null]: 0 };

    // Filtrar cartas válidas
    const validCards = cardData.filter((card) => {
        const cardRegions = card.regions.map(getRegionCode);
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

    // Generar mazo
    while (deck.length < 40) {
        const randomCard = validCards[Math.floor(Math.random() * validCards.length)];
        if (!randomCard) continue;

        const cardCode = randomCard.cardCode;
        const cardRegions = randomCard.regions.map(getRegionCode);
        const isChampion = randomCard.rarity.toLowerCase() === "champion";
        const currentCount = cardCounts[cardCode] || 0;

        const validRegion = cardRegions.find((region) => selectedRegions.includes(region));
        if (!validRegion) continue; // Saltar si no tiene región válida

        // Verificar restricciones
        if (
            currentCount < 3 && // Máximo 3 copias de una carta
            (!isChampion || championCount.count < 6) && // Máximo 6 campeones
            regionCount[validRegion] < 40 && // No exceder 40 cartas por región
            deck.length + 1 <= 40 // No exceder 40 cartas en total
        ) {
            // Añadir carta al mazo
            deck.push(cardCode);
            cardCounts[cardCode] = currentCount + 1;
            regionCount[validRegion]++;
            if (isChampion) championCount.count++;
        }

        // Si no hay suficientes cartas válidas para completar 40, ajustar.
        if (deck.length < 40 && validCards.every((card) => cardCounts[card.cardCode] >= 3)) {
            console.error("No se pueden generar más cartas válidas. Ajustando...");
            break;
        }
    }

    // Ajustar estrictamente a 40 cartas si excede
    while (deck.length > 40) {
        const removedCard = deck.pop();
        cardCounts[removedCard]--;
    }

    return balanceDeckToExactly40(deck, validCards, cardCounts, selectedRegions, championCount, regionCount);
};

// Función para ajustar el mazo estrictamente a 40 cartas
const balanceDeckToExactly40 = (deck, validCards, cardCounts, selectedRegions, championCount, regionCount) => {
    while (deck.length < 40) {
        const randomCard = validCards[Math.floor(Math.random() * validCards.length)];
        if (!randomCard) continue;

        const cardCode = randomCard.cardCode;
        const cardRegions = randomCard.regions.map(getRegionCode);
        const isChampion = randomCard.rarity.toLowerCase() === "champion";
        const currentCount = cardCounts[cardCode] || 0;

        const validRegion = cardRegions.find((region) => selectedRegions.includes(region));
        if (
            currentCount < 3 &&
            (!isChampion || championCount.count < 6) &&
            regionCount[validRegion] < 40
        ) {
            deck.push(cardCode);
            cardCounts[cardCode] = currentCount + 1;
            regionCount[validRegion]++;
            if (isChampion) championCount.count++;
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
            const img = document.createElement('img');
            img.src = card.assets[0].gameAbsolutePath;
            img.alt = card.name;
            img.classList.add('card-image');
            cardListDiv.appendChild(img);
        }
    });
};
