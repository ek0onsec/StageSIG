# -- Fichier auto-update coté serveur possèdant le fichier des permanances -- #  


# Import des bibliothèques (à installer avant )
from arcgis.gis import GIS
from arcgis import features
import pandas as pd 

# Import des bibliothèques (natives)
import datetime as dt
import shutil
import os

print("pwd= " + os.getcwd())

# Accès au portail SIG
gis = GIS("https://sigcg02.maps.arcgis.com", "", "")  # (portail, login, mdp)

# lecture du fichier de mise à jour
csv_updated = '' # chemin absolu

perma_csv_updated = pd.read_csv(csv_updated)

#affectation de la variable de localisation du fichier systeme
cwd = os.path.abspath(os.getcwd())
data_pth = os.path.join(cwd, r'data/updating_gis_content/') # chemin dossier

# créer un identifiant unique pour le fichier de mise à jour
now_ts = str(int(dt.datetime.now().timestamp()))

#copie du fichier et ajout de l'identifiant unique
perma_csv_updated = os.path.abspath(csv_updated)

# -- Publication de la mise à jour en tant que weblayer (csv)
item_prop = {'title':'TEST_UPDATE_PERMA'}
perma_updated_item = gis.content.add(item_properties=item_prop, data=perma_csv_updated)

print("Envoie OK")