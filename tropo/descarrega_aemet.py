"""
Script per descarregar dades climatològiques diàries de l'AEMET OpenData API.
Permet seleccionar una estació i un rang de dates i exporta les dades a CSV/Excel.

Ús:
    python descarrega_aemet.py

"""

import requests
import pandas as pd
from datetime import datetime, timedelta
import time
import sys
import os
from zoneinfo import ZoneInfo

# API Key de l'AEMET
AEMET_API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtcnVzaW5vbEB0cm9wb3NmZXJpY2EuY29tIiwianRpIjoiZGIyNDkzNjQtOTA3MS00NjExLWIwZjMtZTBlN2RlMGUyZGIzIiwiaXNzIjoiQUVNRVQiLCJpYXQiOjE3NDc4MTQ2MDAsInVzZXJJZCI6ImRiMjQ5MzY0LTkwNzEtNDYxMS1iMGYzLWUwZTdkZTBlMmRiMyIsInJvbGUiOiIifQ.ML6ciatRj9WzAHeJM6qoXamNxomP-sGw0kahW9DS4dc"

# Base URL de l'API
BASE_URL = "https://opendata.aemet.es/opendata"


def obtenir_inventari_estacions():
    """
    Obté l'inventari complet d'estacions climatològiques de l'AEMET.
    
    Returns:
        pandas.DataFrame: DataFrame amb informació de totes les estacions
    """
    url = f"{BASE_URL}/api/valores/climatologicos/inventarioestaciones/todasestaciones"
    
    headers = {
        'api_key': AEMET_API_KEY,
        'Accept': 'application/json'
    }
    
    print("Obtenint inventari d'estacions...")
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        metadata = response.json()
        
        if metadata.get('estado') != 200:
            print(f"Error en la resposta de l'API: {metadata.get('descripcion', 'Error desconegut')}")
            return None
        
        dades_url = metadata.get('datos')
        
        if not dades_url:
            print("No s'ha rebut URL de dades")
            return None
        
        # Segona crida per obtenir les dades reals
        time.sleep(1)  # Espera per no saturar l'API
        response_dades = requests.get(dades_url, timeout=30)
        response_dades.raise_for_status()
        
        estacions = response_dades.json()
        
        # Convertir a DataFrame
        df_estacions = pd.DataFrame(estacions)
        
        print(f"S'han trobat {len(df_estacions)} estacions")
        
        return df_estacions
        
    except requests.exceptions.RequestException as e:
        print(f"Error en la petició: {e}")
        return None
    except Exception as e:
        print(f"Error inesperat: {e}")
        return None


def cercar_estacio_per_nom(nom_estacio, df_estacions=None):
    """
    Cerca una estació per nom complet o parcial.
    
    Args:
        nom_estacio (str): Nom (complet o parcial) de l'estació a cercar
        df_estacions (DataFrame, opcional): DataFrame amb l'inventari d'estacions
        
    Returns:
        list: Llista de diccionaris amb les estacions trobades
    """
    if df_estacions is None:
        df_estacions = obtenir_inventari_estacions()
        
    if df_estacions is None:
        return []
    
    # Cerca case-insensitive
    mascara = df_estacions['nombre'].str.contains(nom_estacio, case=False, na=False)
    resultats = df_estacions[mascara]
    
    if len(resultats) == 0:
        return []
    
    return resultats.to_dict('records')


def corregir_hores_a_local(df):
    """
    Corregeix les hores dels camps temporals de UTC a hora local espanyola.
    L'AEMET retorna les hores en UTC però les dades són en hora local.
    
    Args:
        df (pandas.DataFrame): DataFrame amb les dades
        
    Returns:
        pandas.DataFrame: DataFrame amb les hores corregides
    """
    # Camps que contenen hores i necessiten correcció
    camps_hora = ['horatmax', 'horatmin', 'horaPresMax', 'horaPresMin', 
                   'horaracha', 'horavelmedia']
    
    for camp in camps_hora:
        if camp in df.columns:
            df[camp] = df[camp].apply(lambda x: convertir_hora_utc_a_local(x) if pd.notna(x) else x)
    
    return df


def convertir_hora_utc_a_local(hora_str):
    """
    Converteix una hora de UTC a hora local espanyola (Europe/Madrid).
    
    Args:
        hora_str (str): Hora en format 'HH:MM' o 'H:MM' en UTC
        
    Returns:
        str: Hora en format 'HH:MM' en hora local
    """
    if not hora_str or hora_str == '' or pd.isna(hora_str):
        return hora_str
    
    try:
        hora_str = str(hora_str).strip()
        if ':' not in hora_str or hora_str.lower() == 'varias':
            return hora_str
        
        parts = hora_str.split(':')
        if len(parts) != 2:
            return hora_str
            
        hora = int(parts[0])
        minut = int(parts[1])
        data_base = datetime(2024, 1, 1, hora, minut, tzinfo=ZoneInfo('UTC'))
        data_local = data_base.astimezone(ZoneInfo('Europe/Madrid'))
        hora_local = data_local.hour
        minut_local = data_local.minute
        
        return f"{hora_local}:{minut_local:02d}"
        
    except Exception as e:
        return hora_str


def descarregar_dades_climatologiques(idema, data_inici, data_fi):
    """
    Descarrega dades climatològiques diàries per una estació i rang de dates.
    
    Args:
        idema (str): Indicatiu climatològic de l'estació
        data_inici (str): Data d'inici en format 'YYYY-MM-DD'
        data_fi (str): Data de fi en format 'YYYY-MM-DD'
        
    Returns:
        pandas.DataFrame: DataFrame amb les dades climatològiques
    """
    # Formatar les dates per l'API (format ISO amb UTC)
    data_inici_iso = f"{data_inici}T00:00:00UTC"
    data_fi_iso = f"{data_fi}T23:59:59UTC"
    
    url = f"{BASE_URL}/api/valores/climatologicos/diarios/datos/fechaini/{data_inici_iso}/fechafin/{data_fi_iso}/estacion/{idema}"
    
    headers = {
        'api_key': AEMET_API_KEY,
        'Accept': 'application/json'
    }
    
    print(f"Descarregant dades de l'estació {idema}...")
    print(f"Període: {data_inici} a {data_fi}")
    
    try:
        # Primera crida per obtenir la URL de dades
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        metadata = response.json()
        
        if metadata.get('estado') != 200:
            print(f"Error en la resposta de l'API: {metadata.get('descripcion', 'Error desconegut')}")
            return None
        
        dades_url = metadata.get('datos')
        
        if not dades_url:
            print("No s'ha rebut URL de dades")
            return None
        
        # Segona crida per obtenir les dades reals
        time.sleep(1) 
        response_dades = requests.get(dades_url, timeout=30)
        response_dades.raise_for_status()
        
        dades = response_dades.json()
        
        if not dades:
            print("No s'han trobat dades per aquest període")
            return None
        
        df_dades = pd.DataFrame(dades)
        
        df_dades = corregir_hores_a_local(df_dades)
        
        print(f"S'han descarregat {len(df_dades)} registres")
        
        return df_dades
        
    except requests.exceptions.RequestException as e:
        print(f"Error en la petició: {e}")
        return None
    except Exception as e:
        print(f"Error inesperat: {e}")
        return None


def exportar_a_csv(df, nom_fitxer):
    """
    Exporta el DataFrame a un fitxer CSV.
    
    Args:
        df (pandas.DataFrame): DataFrame a exportar
        nom_fitxer (str): Nom del fitxer de sortida
    """
    try:
        df.to_csv(nom_fitxer, index=False, encoding='utf-8-sig')
        print(f"\nDades exportades correctament a: {nom_fitxer}")
    except Exception as e:
        print(f"Error en exportar a CSV: {e}")


def exportar_a_excel(df, nom_fitxer):
    """
    Exporta el DataFrame a un fitxer Excel.
    
    Args:
        df (pandas.DataFrame): DataFrame a exportar
        nom_fitxer (str): Nom del fitxer de sortida
    """
    try:
        df.to_excel(nom_fitxer, index=False, engine='openpyxl')
        print(f"\nDades exportades correctament a: {nom_fitxer}")
    except Exception as e:
        print(f"Error en exportar a Excel: {e}")
        print("Assegura't que tens instal·lat openpyxl: pip install openpyxl")


def validar_data(data_str):
    """
    Valida i converteix una cadena de text a format de data.
    
    Args:
        data_str (str): Data en format 'YYYY-MM-DD' o 'DD/MM/YYYY'
        
    Returns:
        str: Data en format 'YYYY-MM-DD' o None si no és vàlida
    """
    formats = ['%Y-%m-%d', '%d/%m/%Y']
    
    for fmt in formats:
        try:
            date_obj = datetime.strptime(data_str, fmt)
            return date_obj.strftime('%Y-%m-%d')
        except ValueError:
            continue
    
    return None


def menu_principal():
    """
    Mostra el menú principal i gestiona la interacció amb l'usuari.
    """
    print("=" * 50)
    print("   DESCARREGADOR DE DADES CLIMATOLÒGIQUES AEMET   ")
    print("=" * 50)
    print()
    
    df_estacions = obtenir_inventari_estacions()
    
    if df_estacions is None:
        print("Error: No s'ha pogut obtenir l'inventari d'estacions")
        sys.exit(1)
    
    print()
    
    # Cerca d'estació
    while True:
        nom_cerca = input("Introdueix el nom de l'estació (complet o parcial): ").strip()
        
        if not nom_cerca:
            print("El nom no pot estar buit")
            continue
        
        resultats = cercar_estacio_per_nom(nom_cerca, df_estacions)
        
        if len(resultats) == 0:
            print(f"No s'han trobat estacions amb el nom '{nom_cerca}'")
            print("Intenta amb un altre nom\n")
            continue
        
        print(f"\nS'han trobat {len(resultats)} estacions:")
        print()
        
        for i, estacio in enumerate(resultats, 1):
            print(f"{i}. {estacio['nombre']}")
            print(f"   Indicatiu: {estacio['indicativo']}")
            print(f"   Província: {estacio.get('provincia', 'N/A')}")
            if 'altitud' in estacio:
                print(f"   Altitud: {estacio['altitud']} m")
            print()
        
        if len(resultats) == 1:
            confirmacio = input("Vols utilitzar aquesta estació? (s/n): ").strip().lower()
            if confirmacio == 's':
                estacio_seleccionada = resultats[0]
                break
            else:
                print()
                continue
        else:
            try:
                seleccio = int(input(f"Selecciona una estació (1-{len(resultats)}) o 0 per tornar a cercar: "))
                if seleccio == 0:
                    print()
                    continue
                if 1 <= seleccio <= len(resultats):
                    estacio_seleccionada = resultats[seleccio - 1]
                    break
                else:
                    print("Número fora de rang\n")
            except ValueError:
                print("Si us plau, introdueix un número vàlid\n")
    
    print()
    print(f"Estació seleccionada: {estacio_seleccionada['nombre']}")
    print(f"Indicatiu: {estacio_seleccionada['indicativo']}")
    print()
    
    # Sol·licitar rang de dates
    while True:
        data_inici_str = input("Data d'inici (YYYY-MM-DD o DD/MM/YYYY): ").strip()
        data_inici = validar_data(data_inici_str)
        
        if data_inici:
            break
        else:
            print("Format de data invàlid. Si us plau, utilitza YYYY-MM-DD o DD/MM/YYYY\n")
    
    while True:
        data_fi_str = input("Data de fi (YYYY-MM-DD o DD/MM/YYYY): ").strip()
        data_fi = validar_data(data_fi_str)
        
        if data_fi:
            if data_fi >= data_inici:
                break
            else:
                print("La data de fi ha de ser posterior o igual a la data d'inici\n")
        else:
            print("Format de data invàlid. Si us plau, utilitza YYYY-MM-DD o DD/MM/YYYY\n")
    
    print()
    
    # Descarregar dades
    df_dades = descarregar_dades_climatologiques(
        estacio_seleccionada['indicativo'],
        data_inici,
        data_fi
    )
    
    if df_dades is None or len(df_dades) == 0:
        print("No s'han pogut obtenir dades per aquest període")
        sys.exit(1)
    
    print()
    print("Exemple de dades descarregades (primeres 5 files):")
    print(df_dades.head())
    print()
    
    # Exportar dades
    nom_estacio_clean = estacio_seleccionada['nombre'].replace(' ', '_').replace(',', '')
    nom_base = f"aemet_{nom_estacio_clean}_{data_inici}_{data_fi}"
    
    formato = input("Format d'exportació (csv/excel/ambdos) [csv]: ").strip().lower()
    
    if formato == '':
        formato = 'csv'
    
    if formato in ['csv', 'ambdos']:
        nom_csv = f"{nom_base}.csv"
        exportar_a_csv(df_dades, nom_csv)
    
    if formato in ['excel', 'ambdos']:
        nom_excel = f"{nom_base}.xlsx"
        exportar_a_excel(df_dades, nom_excel)
    
    if formato not in ['csv', 'excel', 'ambdos']:
        print("Format no reconegut, s'exporta a CSV per defecte")
        nom_csv = f"{nom_base}.csv"
        exportar_a_csv(df_dades, nom_csv)
    
    print()
    print("Procés completat!")


if __name__ == "__main__":
    try:
        menu_principal()
    except KeyboardInterrupt:
        print("\n\nProcés cancel·lat per l'usuari")
        sys.exit(0)
    except Exception as e:
        print(f"\nError inesperat: {e}")
        sys.exit(1)