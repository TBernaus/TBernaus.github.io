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

// Función centralizada para generar el mazo y sus copias
const createRandomDeck = () => {
    const deck = {};
    let totalCards = 0;
    let championCount = 0;
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
        return null;
    }

    while (totalCards < 40) {
        const selectedCard = validCards[Math.floor(Math.random() * validCards.length)];
        const isChampion = selectedCard.rarity.toLowerCase() === "champion";

        if (!selectedCard) continue;
        if(isChampion && championCount >= 6) continue;

        if (deck[selectedCard.cardCode]) {
            if (deck[selectedCard.cardCode] < 3) {
                deck[selectedCard.cardCode]++;
                totalCards++;
                if(isChampion) championCount++;
            }
        } else {
            deck[selectedCard.cardCode] = 1;
            totalCards++;
            if(isChampion) championCount++;
        }
    }
    
    return deck;
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

    cardListDiv.innerHTML = '';
     const sortedDeckEntries = Object.entries(deck).sort(([,], [cardCodeA, cardCodeB]) => {
        const cardA = cardData.find((c) => c.cardCode === cardCodeA);
          return cardA?.name?.localeCompare(cardData.find((c) => c.cardCode === cardCodeB)?.name);
    });
    for (const [cardCode, count] of sortedDeckEntries) {
           const card = cardData.find((c) => c.cardCode === cardCode);
              if(card){
                  for(let i=0; i<count; i++){
                       const img = document.createElement('img');
                        img.src = card.assets[0].gameAbsolutePath;
                        img.alt = card.name;
                        img.classList.add('card-image');
                         cardListDiv.appendChild(img);
                  }
        }
    }
};


// Generar el código de mazo
const generateDeckCode = (deck) => {
    const byteArray = [0x14]; // Versión fija para el formato de codificación
    const groupedByCount = {};

    // Agrupar cartas por número de copias
    for (const cardCode in deck) {
        const count = deck[cardCode];
        if (!groupedByCount[count]) {
            groupedByCount[count] = [];
        }
        groupedByCount[count].push(cardCode);
    }

    // Ordenar grupos por número de copias
    const sortedCounts = Object.keys(groupedByCount).sort((a, b) => parseInt(b) - parseInt(a));

    for (const count of sortedCounts) {
        const cards = groupedByCount[count];
        const groupedBySetFaction = {};

        // Agrupar por set y facción
        for (const cardCode of cards) {
            const set = parseInt(cardCode.slice(0, 2), 10);
            const faction = factionMapping[cardCode.slice(2, 4)];
            const key = `${set}-${faction}`;
            if (!groupedBySetFaction[key]) {
                groupedBySetFaction[key] = [];
            }
            groupedBySetFaction[key].push(cardCode);
        }

        // Codificar grupos por set y facción
        const setFactionGroups = Object.values(groupedBySetFaction).sort((a, b) => a.length - b.length);
        byteArray.push(setFactionGroups.length);

        for (const group of setFactionGroups) {
            const set = parseInt(group[0].slice(0, 2), 10);
            const faction = factionMapping[group[0].slice(2, 4)];
            const cardNums = group.map(code => parseInt(code.slice(4), 10)).sort((a, b) => a - b);

            // Codificar grupo
            byteArray.push(cardNums.length);
            byteArray.push(set);
            byteArray.push(faction);

            for (const cardNum of cardNums) {
                encodeVarInt(byteArray, cardNum);
            }
        }
    }

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
    const deck = createRandomDeck();
    if (deck) {
        const deckCode = generateDeckCode(deck);
        displayResult(deck, deckCode, 'eterno');
        console.log(deck)
    }
};