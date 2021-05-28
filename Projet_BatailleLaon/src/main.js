//Importation des bibliotèque ESRI requises
require([
    "esri/config", //bibliotèque ESRI qui permet la configuration de l'API
    "esri/Map", //bibliotèque ESRI qui permet de récuperer et d'afficher une map de base ( exemple arcgis-topographic )
    "esri/views/SceneView", //bibliotèque qui permet de créer une vue lors du chargement de la page
    "esri/WebScene", //bibliothèque qui permet l'utilisation de web scene
    "esri/layers/GraphicsLayer", //bibliothèque qui permet l'utilisation de couche graphique
    "esri/widgets/Sketch/SketchViewModel", //bibliothèqye permettant l'import et l'utilisation de models 3d
    "esri/Camera", //bibliothèque permettant la creation de camera ( point de vue )
    "esri/views/ViewAnimation", //bibliothèque permettant la création d'animations
    "esri/core/watchUtils",

    "vue"

], function (
    esriConfig,
    Map,
    SceneView,
    WebScene,
    GraphicsLayer,
    SketchViewModel,
    Camera,
    ViewAnimation,
    watchUtils,
    Vue
) {

    //============== CONFIGURATION DE BASE =================\\

    //Ajout de la clé API crée via le dashboard "developers.arcgis.com/dashboard/"
    esriConfig.apiKey = ""; // Clé api

    esriConfig.portalItem = "https://sigcg02.maps.arcgis.com/";
    //récupération de la ressource
    const bataille = new WebScene({
        portalItem: {
            //id: "bf7c26b3a27a4d2f974508f51a3123cf" //BatailleLaon
            id: "414a28cfca7a471180e8e952cf14c60f" //SketchTest
        }
    });

    //Configuration de la vue en 3d
    const view = new SceneView({
        map: bataille,
        container: "viewDiv",

        /*
        
        camera: {
            position: [3.637, 49.562, 33656],
            tilt: 0.5,
            heading: 0
        }

         */
    });


    const graphicsLayer = new GraphicsLayer({
        elevationInfo: {mode: "relative-to-scene"}
    });
    view.map.add(graphicsLayer);


    const cavalierBtn = document.getElementById("cavalier");
    const itemBtn = document.getElementById("item");

    //============== OUTIL CAMERA =================\\

    //création d'un composant en vue.js
    Vue.component("camera-info", {
        props: ["camera"],
        template: [
            "<div>",
            "<h2>Info Camera</h2>",
            "<p><strong>Heading</strong>: {{ camera.heading.toFixed(3) }}</p>",
            "<p><strong>Tilt</strong>: {{ camera.tilt.toFixed(3) }}</p>",
            "<p><strong>Latitude (x) </strong>: {{ camera.position.latitude.toFixed(3) }}</p>",
            "<p><strong>Longitude (y) </strong>: {{ camera.position.longitude.toFixed(3) }}</p>",
            "<p><strong>Hauteur (z) </strong>: {{ camera.position.z.toFixed(0) }}</p>",
            "<button v-on:click='reset'>Reset Camera</button>",
            "</div>"
        ].join(""),
        methods: {
            reset: function () {
                let camera = this.camera.clone();
                camera.set({
                    position: [3.637, 49.562, 33656],
                    tilt: 0.5,
                    heading: 0
                });
                view.goTo(camera);
            }
        }
    });


    //============== VUE CHARGEE =================\\

    //fonction .when permet d'executer le code qui suit uniqument quand la view est chargée
    view.when(function () {

        // Cet exemple utilise le SketchViewModel pour ajouter des points à une couche graphique.
        // Les points ont des modèles 3D glTF comme symboles.
        const sketchVM = new SketchViewModel({
            layer: graphicsLayer,
            view: view
        });

        //fonction d'ecoute en attente du click de l'utilisateur
        cavalierBtn.addEventListener("click", function () {
            // référence le chemin relatif vers le modèle glTF
            // dans la ressource d'un ObjectSymbol3DLayer
            sketchVM.pointSymbol = {
                type: "point-3d",
                symbolLayers: [
                    {
                        type: "object",
                        height: 10,
                        resource: {
                            href: "./3d-assets/cavalier.glb"
                        }
                    }
                ]
            };
            sketchVM.create("point");
            deactivateButtons();
            this.classList.add("esri-button--secondary");
        });

        itemBtn.addEventListener("click", function () {
            // référence le chemin relatif vers le modèle glTF
            // dans la ressource d'un ObjectSymbol3DLayer
            sketchVM.pointSymbol = {
                type: "point-3d",
                symbolLayers: [
                    {
                        type: "object",
                        resource: {
                            href: "../3d-assets/cavalier.glb"
                        }
                    }
                ]
            };
            deactivateButtons();
            sketchVM.create("point");
            this.classList.add("esri-button--secondary");
        });

        sketchVM.on("create", function (event) {
            if (event.state === "complete") {
                sketchVM.update(event.graphic);
                deactivateButtons();
            }
        });

        //vue component
        const info = new Vue({
            el: "#info",
            data: {
                camera: view.camera
            }
        });
        view.ui.add(info.$el, "top-right");
        watchUtils.watch(view, "camera", function () {
            info.camera = view.camera;
        });

    })//view.when
        .catch(console.error);

    function deactivateButtons() {
        const elements = Array.prototype.slice.call(document.getElementsByClassName("esri-button"));
        elements.forEach(function (element) {
            element.classList.remove("esri-button--secondary");
        });
    }

    //ajout du widget sur l'interfece
    view.ui.add("paneDiv", "top-right");

    //============== GESTION DES CAMERAS =================\\

    //8Mars Résistance à Etouvelles
    const mars_8 = new Camera({
        heading: 0, // face due east
        tilt: 0.5, // looking from a bird's eye view
        position: {
            latitude: 49.539,
            longitude: 3.591,
            z: 11400,
        }
    });

    //9 mars [Matin] - Les fançais prennent Semilly et Ardon
    const mars_9_matin = new Camera({
        heading: 4.745, // face due east
        tilt: 0.5, // looking from a bird's eye view
        position: {
            latitude: 49.549,
            longitude: 3.628,
            z: 11400,
        }
    });

    //9 mars [Après-Midi] - Marmont arrive devant athies
    const mars_9_apm = new Camera({
        heading: 353.017, // face due east
        tilt: 1.784, // looking from a bird's eye view
        position: {
            latitude: 49.568,
            longitude: 3.687,
            z: 10700,
        }
    });


    //9 mars [Soir] - Clacy est au mains des français
    const mars_9_soir = new Camera({
        heading: 53.983, // face due east
        tilt: 31.502, // looking from a bird's eye view
        position: {
            latitude: 49.530,
            longitude: 3.528,
            z: 8400,
        }
    });

    //9 mars [Nuit] - Retraite sur Reims
    const mars_9_nuit = new Camera({
        heading: 358.568, // face due east
        tilt: 10.406, // looking from a bird's eye view
        position: {
            latitude: 49.534,
            longitude: 3.718,
            z: 13200,
        }
    });

    //10 mars - Nouvelle attaque de Napoléon à Athies
    const mars_10_attaqueAthies = new Camera({
        heading: 2.417, // face due east
        tilt: 0.5, // looking from a bird's eye view
        position: {
            latitude: 49.568,
            longitude: 3.713,
            z: 13150,
        }
    });

    //10 mars - Assault des divisions Russes à Clacy
    const mars_10_assaultClacy = new Camera({
        heading: 9.579, // face due east
        tilt: 47.829, // looking from a bird's eye view
        position: {
            latitude: 49.504,
            longitude: 3.569,
            z: 7700,
        }
    });


    //10 mars - nouvelles attaques de Napoléon aux faubourgs de Semilly, d'Ardon et de La Neuville
    const mars_10_attaqueSemillyArdonNeuville = new Camera({
        heading: 53.804, // face due east
        tilt: 43.793, // looking from a bird's eye view
        position: {
            latitude: 49.528,
            longitude: 3.546,
            z: 9300,
        }
    });

    //============== GESTION DE L'ANIMATION =================\\

    //fonction de pause
    function wait(ms) {
        let d = new Date();
        let d2 = null;
        do {
            d2 = new Date();
        }
        while (d2 - d < ms);
    }


    //définition de la liste des cameras
    let listeCams = [];

    //ajout des cameras à la liste
    listeCams.push(
        mars_8,
        mars_9_matin,
        mars_9_apm,
        mars_9_soir,
        mars_9_nuit,
        mars_10_attaqueAthies,
        mars_10_assaultClacy,
        mars_10_attaqueSemillyArdonNeuville
    );

    console.log(listeCams);
    //definition des options d'animation
    const options = {
        speedFactor: 0.1, // animation lente
        easing: "out-quint" // ralenti sur objectif
    };

    let playButton = document.getElementById('playButton')


    let timeout = 5000;
    //ecouteur en attente du click sur le boutton play
    playButton.addEventListener('click', function () {
        for (let camera in listeCams){
            setTimeout(function(){
                view.goTo(listeCams[camera], options);
            }, timeout);
            timeout += 10000;
        }
    });


    
});//main