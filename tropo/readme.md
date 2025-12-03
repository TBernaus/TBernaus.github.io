# Prova Tècnica - Integració AEMET API

## Descripció

Aquest projecte conté les solucions a la prova tècnica que integra l'API de l'AEMET OpenData amb l'aplicació web de mapa d'estacions de Sierra Nevada.

## Contingut

### 1. Aplicació Web (sierranevada_mapa)

L'aplicació web ha estat modificada per incloure la nova estació **PRADOLLANO** amb dades climatològiques en temps real de l'AEMET.

**Fitxers modificats:**
- `app_ms.js` - Lògica JavaScript amb integració API AEMET
- `styles.css` - Estils actualitzats per mostrar dades AEMET
- `sierranevada_mapa.html` - (No requeria canvis)

**Funcionalitats noves:**
- Nova estació "PRADOLLANO" (codi AEMET: 5511)
- Visualització de dades del darrer dia disponible (avui-5d, és a dir 29 de novembre):
  - Temperatura màxima i mínima
  - Humitat màxima i mínima
  - Pressió atmosfèrica mitjana
- Marcadors especials per estacions AEMET (color taronja)
- Popups enriquits amb informació climatològica
- Sistema de caché per evitar crides repetides a l'API

### 2. Script Python (descarrega_aemet.py)

Script interactiu per descarregar dades climatològiques de qualsevol estació AEMET.

**Funcionalitats:**
- Cerca interactiva d'estacions per nom
- Selecció flexible de rang de dates
- Exportació a CSV i/o Excel
- Validació de dades d'entrada
- Gestió d'errors robusta

## Instal·lació i Ús

### Aplicació Web

**Requisits:**
- Navegador web modern (Chrome, Firefox, Safari, Edge)
- Connexió a Internet (per carregar llibreries CDN i accedir a l'API AEMET)

**Instruccions:**
1. Assegura't que tots els fitxers estiguin a la mateixa carpeta:
   ```
   ├── sierranevada_mapa.html
   ├── app_ms.js
   └── styles.css
   ```

2. Obre `sierranevada_mapa.html` amb el teu navegador web

3. L'aplicació carregarà automàticament:
   - Totes les estacions de Sierra Nevada
   - Les dades de PRADOLLANO des de l'API AEMET
   - El mapa interactiu amb terreny 3D

4. Per veure les dades de PRADOLLANO:
   - Fes clic sobre el marcador taronja al mapa
   - O cerca "PRADOLLANO" al camp de cerca

**Nota important:** Les dades de l'AEMET poden trigar uns segons a carregar. Si hi ha problemes de connectivitat o l'API no respon, les estacions es mostraran sense dades climatològiques.

### Script Python

**Requisits:**
- Python 3.7 o superior
- Llibreries necessàries:
  ```bash
  pip install requests pandas openpyxl
  ```

**Ús del script:**

1. Executa el script des del terminal:
   ```bash
   python descarrega_aemet.py
   ```

2. Segueix les instruccions interactives:
   - Introdueix el nom de l'estació (per exemple: "Pradollano")
   - Selecciona l'estació de la llista
   - Introdueix la data d'inici (YYYY-MM-DD o DD/MM/YYYY)
   - Introdueix la data de fi (YYYY-MM-DD o DD/MM/YYYY)
   - Escull el format d'exportació (csv/excel/ambdos)

3. Els fitxers es crearan al directori actual amb el format:
   ```
   aemet_[NomEstacio]_[DataInici]_[DataFi].csv
   aemet_[NomEstacio]_[DataInici]_[DataFi].xlsx
   ```

**Exemple d'ús:**
```bash
$ python descarrega_aemet.py

Obtenint inventari d'estacions...
S'han trobat 947 estacions

Introdueix el nom de l'estació: Pradollano

S'han trobat 1 estacions:

1. PRADOLLANO, PARQUE NACIONAL SIERRA NEVADA
   Indicatiu: 5511
   Província: GRANADA
   Altitud: 2500 m

Vols utilitzar aquesta estació? (s/n): s

Data d'inici (YYYY-MM-DD): 2024-11-27
Data de fi (YYYY-MM-DD): 2024-11-29

Descarregant dades de l'estació 5511...
Període: 2024-11-27 a 2024-11-29
S'han descarregat 3 registres

Format d'exportació (csv/excel/ambdos) [csv]: csv

Dades exportades correctament a: aemet_PRADOLLANO_PARQUE_NACIONAL_SIERRA_NEVADA_2024-11-27_2024-11-29.csv

Procés completat!
```

## Detalls Tècnics

### API AEMET

L'API de l'AEMET funciona en dos passos:
1. Crida inicial que retorna metadades i una URL temporal
2. Segona crida a la URL temporal per obtenir les dades reals

**Endpoint utilitzat:**
```
GET /api/valores/climatologicos/diarios/datos/fechaini/{dataIni}/fechafin/{dataFin}/estacion/{idema}
```

**Headers necessaris:**
```javascript
{
  'api_key': 'YOUR_API_KEY'
}
```

### Estació PRADOLLANO

- **Nom complet:** Pradollano, Parque Nacional Sierra Nevada
- **Codi AEMET (IDEMA):** 5511
- **Coordenades:** 37.09389°N, 3.39139°W
- **Altitud:** 2500 m
- **URL validació:** https://www.aemet.es/ca/eltiempo/observacion/ultimosdatos?k=and&l=5511

### Camps de dades disponibles

El script descarrega tots els camps disponibles, incloent:
- `fecha`: Data de l'observació
- `tmax`: Temperatura màxima (°C)
- `tmin`: Temperatura mínima (°C)
- `tmed`: Temperatura mitjana (°C)
- `prec`: Precipitació (mm)
- `presMax`: Pressió màxima (hPa)
- `presMin`: Pressió mínima (hPa)
- `presMedia`: Pressió mitjana (hPa)
- `hrMax`: Humitat relativa màxima (%)
- `hrMin`: Humitat relativa mínima (%)
- `hrMedia`: Humitat relativa mitjana (%)
- `velmedia`: Velocitat mitjana del vent (km/h)
- `racha`: Ratxa màxima del vent (km/h)
- `sol`: Hores de sol
- I molts més...

## Limitacions i Consideracions

1. **Rate Limiting:** L'API de l'AEMET té limitacions de velocitat. El script inclou pauses entre peticions per evitar errors.

2. **Rang de dates:** L'API permet descarregar fins a 5 anys de dades diàries en una sola petició.

3. **Disponibilitat de dades:** Les dades més recents poden no estar disponibles immediatament. Hi ha un retard típic de 5 dies (per això s'usa "avui-5d").

4. **CORS:** L'aplicació web pot tenir problemes de CORS si es prova en mode local. Es recomana utilitzar un servidor HTTP local o desplegar-la en un servidor web.

5. **API Key:** L'API Key inclosa és la proporcionada per la prova. Per ús en producció, cal sol·licitar una API Key pròpia a https://opendata.aemet.es/

## Validació

Per validar que les dades són correctes:
1. Visita: https://www.aemet.es/ca/eltiempo/observacion/ultimosdatos?k=and&l=5511
2. Comprova que els valors coincideixen amb els mostrats a l'aplicació web

## Solució de Problemes

**Error: "No s'ha pogut obtenir l'inventari d'estacions"**
- Comprova la connexió a Internet
- Verifica que l'API Key sigui vàlida
- Espera uns minuts i torna-ho a intentar (pot ser un problema temporal de l'API)

**Error: "No s'han pogut obtenir dades per aquest període"**
- Verifica que les dates siguin correctes
- Assegura't que l'estació tingui dades disponibles per aquest període
- Intenta amb un rang de dates més recent

**Error: "Module not found" al Python**
- Instal·la les dependències: `pip install requests pandas openpyxl`

## Autor

Desenvolupat per a Troposfèrica com a part de la prova tècnica d'incorporació.

## Llicència

Les dades són propietat de l'Agencia Estatal de Meteorología (AEMET) i s'utilitzen segons els termes d'ús de l'AEMET OpenData API.