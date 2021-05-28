//Importation des bibliotèque ESRI requises
require([
    "esri/config", //bibliotèque ESRI qui permet la configuration de l'API
    "esri/Map", //bibliotèque ESRI qui permet de récuperer et d'afficher une map de base ( exemple arcgis-topographic )
    "esri/views/MapView", //bibliotèque qui permet de créer une vue lors du chargement de la page
    "esri/layers/FeatureLayer", //bibliotèque qui permet de charger et d'ajouter des couches sur la basemap

    "esri/widgets/Search", //widget recherche d'adresse
    "esri/widgets/FeatureTable",//widget création de tableau

    "esri/widgets/Feature"//widget pour side panel (pop up fixe)

], function (
    esriConfig,
    Map,
    MapView,
    FeatureLayer,
    Search,
    FeatureTable,
    Feature
) {

    //Ajout de la clé API crée via le dashboard "developers.arcgis.com/dashboard/"
    esriConfig.apiKey = ""; // Clé API

    //définition de la map de base à afficher
    const map = new Map({
        basemap: "arcgis-topographic" //Couche principale
    });//webmap


    //Configuration du point de vue de chargement de la map
    const view = new MapView({
        map: map,
        container: "viewDiv",
        zoom: 9,//niveau de zoom pour pointer vers l'aisne
        center: [3.5, 49.45],// coordonnée lon/lat
        ui: {
            components: ["attribution"]
        },// désactive le zoom sur la map (bouton + et -)
        popup: {
            autoOpenEnabled: false
        } // Empêche l'ouverture de la popup sur la carte

    });//view

    //Quand la map est chargé, on charge les couches suivante
    view.when(function () {

        //============== RECUPERATION ET AJOUT DES COUCHES =================\\


        //Couche qui délimite l'aisne
        const LayerAisne = new FeatureLayer({
            url: "https://services1.arcgis.com/iNWpti7T6X4xmP8G/arcgis/rest/services/DEPARTEMENT_AISNE/FeatureServer"
        });

        //ajoute la couche à la map de base
        map.add(LayerAisne);

        //Couche représentant les cantons
        const LayerCantons = new FeatureLayer({
            url: "https://services1.arcgis.com/iNWpti7T6X4xmP8G/arcgis/rest/services/CANTONS_CONSEILLERS_2018/FeatureServer"
        });

        //============== AFFICHAGE DES INFORMATIONS LORS DU CLICK =================\\

        const aisneLogoUrl = "https://upload.wikimedia.org/wikipedia/fr/thumb/c/c8/Aisne_%2802%29_logo_2015.svg/1200px-Aisne_%2802%29_logo_2015.svg.png";

        //Création d'un template pour afficher les informations
        const popupTemplate = {
            "content": "Canton de <b>{CANTON}</b><br><hr>" +
                "       <div class='row'>" +
                "           <div class='col'>" +
                "               <img id='aisnelogo' src='https://upload.wikimedia.org/wikipedia/fr/thumb/c/c8/Aisne_%2802%29_logo_2015.svg/1200px-Aisne_%2802%29_logo_2015.svg.png' alt='AisneLogo' height='50px' width='50px'>" +
                "           </div>" +
                "           <div class='col2'>" +
                "               <a class='ficheElus' href=\"{FICHE_ELU}\"><b>{ELU_1}</b></a><br>" +
                "               <a class='ficheElus' href=\"{FICHE_EL_1}\"><b>{ELU_2}</b></a><br>" +
                "           </div>" +
                "        </div><br>" +
                "           Canton composé de <b>{NB_COMMUNE}</b> communes"

        };

        //Récupération des données de la table
        const donneesRecup = new FeatureLayer({
            url: "https://services1.arcgis.com/iNWpti7T6X4xmP8G/arcgis/rest/services/CANTONS_CONSEILLERS_2018/FeatureServer",
            outFields: ["CANTON", "ELU_1", "ELU_2", "NB_COMMUNE", "FICHE_EL_1", "FICHE_ELU", "OBJECTID"],
            popupTemplate: popupTemplate
        });

        //ajoute les données à la cartes
        map.add(donneesRecup);

        //création du widget de recherche
        const search = new Search({
            view: view
        })

        //ajout du widget à l'interface utilisateur (ui)
        view.ui.add(search, "top-right");

        //============== AFFICHAGE DES DONNEES DANS UN SIDE PANEL =================\\

        //Affichage par défaut sans click
        const graphic = {
            popupTemplate: {
                content: "Cliquez sur un cantons pour afficher les détails"
            }
        };

        //Déclare le graphic précédement initialisé en tant que Feature Widget
        const feature = new Feature({
            container: "feature-node",
            graphic: graphic,
            map: view.map,
            spatialReference: view.spatialReference
        });

        view.whenLayerView(donneesRecup).then(function (layerView) {
            let highlight;

            // Listener en attente du click sur un cantons
            view.on("click", function (event) {

                //effectue un test sur la vue
                view.hitTest(event).then(function (event) {
                    //Vérifie que le graphic possède un popupTemplate
                    let results = event.results.filter(function (result) {
                        return result.graphic.layer.popupTemplate;
                    });
                    let result = results[0];
                    highlight && highlight.remove();

                    //Met à jour le graphic du Feature Widget
                    if (result) {
                        feature.graphic = result.graphic;
                        highlight = layerView.highlight(result.graphic);
                    } else {
                        feature.graphic = graphic;
                    }
                });
            });
        });


        //============== AFFICHAGE DES CANTONS DANS LE TABLEAU =================\\

        //récupération de la zone d'affichage du tableau
        const tableContent = document.getElementById("tableContent");

        //création d'un tableau
        const featureTable = new FeatureTable({
            view: view,//ici on défini sur quelle vue le tableau va se basé
            layer: LayerCantons,//ici on choisis sur quelle couche on va récupérer les informations
            fieldConfigs: [{
                name: "CANTON",
                label: "CANTONS",
            }],
            container: tableContent//ici on ajoute la zone préalablement récupérer pour afficher le tableau
        });

        //On defini maintenant les paramêtres du tableau
        featureTable.visibleElements = {
            header: false,
            menu: false,
            menuItems: {
                clearSelection: true,
                refreshData: false,
                toggleSelection: false,
                hasEventListener: true
            },
            selectionColumn: false
        };

        //============== DESACTIVATION DE LA NAVIGATION =================\\

        // Désactive le zoom via la molette de la souris
        view.on("mouse-wheel", function(event) {
            event.stopPropagation();
        });

        // Désactive le zoom via le +/- du clavier
        view.on("key-down", function(event) {
            let prohibitedKeys = ["+", "-", "Shift", "_", "="];
            let keyPressed = event.key;
            if (prohibitedKeys.indexOf(keyPressed) !== -1) {
                event.stopPropagation();
            }
        });

        // Désactive le zoom via le double clique
        view.on("double-click", function(event) {
            event.stopPropagation();
        });

        // Désactive le zoom arrière (ctrl + double clique)
        view.on("double-click", ["Control"], function(event) {
            event.stopPropagation();
        });

        // Désactive le zoom via le pad (pc portable)
        view.on("drag", function(event) {
            event.stopPropagation();
        });


    });//view.when


});//require
