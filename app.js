const CLEFAPI = "273b8438e441490be373336d5cf53340";

// Sélecteurs HTML
const temps        = document.querySelector(".temps");
const temperature  = document.querySelector(".temperature");
const localisation = document.querySelector(".localisation");

const heure     = document.querySelectorAll(".heure-nom-prevision");
const tempPourH = document.querySelectorAll(".heure-prevision-valeur");

const joursDiv    = document.querySelectorAll(".jour-prevision-nom");
const tempJourDiv = document.querySelectorAll(".jour-prevision-temp");

const imIcon  = document.querySelector(".logo-meteo");
const overlay = document.querySelector(".overlay");


const joursSemaine = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];


if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
        chargerMeteo(pos.coords.latitude, pos.coords.longitude);
    }, () => alert("Activez la géolocalisation !"));
}


async function chargerMeteo(lat, lon) {
    try {
        
        const resActuelle = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${CLEFAPI}`
        );
        const dataActuelle = await resActuelle.json();

        
        const resForecast = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${CLEFAPI}`
        );
        const dataForecast = await resForecast.json();

        // ── Météo actuelle 
        temps.innerText        = dataActuelle.weather[0].description;
        temperature.innerText  = `${Math.round(dataActuelle.main.temp)}°`;
        localisation.innerText = dataActuelle.name;

        // ── Icône jour / nuit 
        const icon         = dataActuelle.weather[0].icon;
        const heureActuelle = new Date().getHours();

        imIcon.src = (heureActuelle >= 6 && heureActuelle < 21)
            ? `res/jour/${icon}.svg`
            : `res/nuit/${icon}.svg`;

        // ── Prévisions horaires (toutes les 3h) 
        for (let i = 0; i < 7; i++) {
            // vérification que l'entrée existe avant d'y accéder
            const entree = dataForecast.list[i * 3];
            if (entree) {
                const heureFuture = new Date(entree.dt * 1000).getHours();
                heure[i].innerText     = `${heureFuture}h`;
                tempPourH[i].innerText = `${Math.round(entree.main.temp)}°`;
            }
        }

        // ── Prévisions journalières (moyenne par jour)
        let dailyTemps = {};

        dataForecast.list.forEach(entry => {
            const jour = new Date(entry.dt * 1000).getDay();
            if (!dailyTemps[jour]) dailyTemps[jour] = [];
            dailyTemps[jour].push(entry.main.temp);
        });

        let index = 0;
        for (let jour in dailyTemps) {
            if (index < 7) {
                joursDiv[index].innerText   = joursSemaine[jour];
                const moy = dailyTemps[jour].reduce((a, b) => a + b) / dailyTemps[jour].length;
                tempJourDiv[index].innerText = `${Math.round(moy)}°`;
                index++;
            }
        }

        // ── Dispariton overlay
        overlay.classList.add("disparition");

    } catch (e) {
        console.error(e);
        alert("Impossible de charger les données météo.");
    }
}