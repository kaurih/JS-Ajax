// Määritellään HTML-elementeille vakiot
const theaterSelect = document.getElementById("theater-select");
const infoOutput = document.getElementById("info-output");
const displayArea = document.getElementById("display-area")

// Tallennetaan teatterien IDt ja nimet (keys)
const theaterMap = {};

// Haetaan teatterien tiedot
function fetchTheaterData(){
    return fetch("https://www.finnkino.fi/xml/TheatreAreas/")
    .then(response => response.text())
    .then(xmlString => {
        const parser = new DOMParser();
        return parser.parseFromString(xmlString, "application/xml");
    })
    .catch(error => {
        console.error("Error fetching or parsing XML:", error);
        return null;
    });
}

// valikon sisällön luonti xml-tiedostosta
function populateTheaterDropdown(xmlDoc){
    if (!xmlDoc) return;

    const theaters = xmlDoc.getElementsByTagName("TheatreArea");
    for (let i = 0; i < theaters.length; i++) {
        const theaterID = theaters[i].getElementsByTagName("ID")[0].textContent;
        const theaterName = theaters[i].getElementsByTagName("Name")[0].textContent;

        // Säilötään nimi(key) ja ID(value)
        theaterMap[theaterName] = theaterID;

        // menu appendit
        const option = document.createElement("option");
        option.value = theaterName; // Store theater name as value
        option.textContent = theaterName;
        theaterSelect.appendChild(option);
    }
}

// haetaan ja parsitaan tietoa Schedulesta ID:n perusteella
function fetchScheduleData(theaterID) {
    return fetch(`https://www.finnkino.fi/xml/Schedule/?area=${theaterID}`)
    .then(response => response.text())
    .then(xmlString => {
        const parser = new DOMParser();
        return parser.parseFromString(xmlString, "application/xml");
    })
    .catch(error => {
        console.error("Error fetching or parsing schedule XML:", error);
        return null;
    });
}

// Lisätään haettu data taulukkoon
function populateScheduleTable(xmlDoc) {
    if (!xmlDoc) return;

    // tyhjennetään edelliset tulokset (kun vaihdetaan teatteria)
    infoOutput.innerHTML = "";

    // taulukko
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";

    // Otsikot
    const headerRow = document.createElement("tr");
    ["Juliste", "Nimi", "Genre", "Ikärajoitus", "Esitysaika"].forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText;
        th.style.border = "2px solid #0B2027";
        th.style.padding = "10px";
        th.style.backgroundColor = "#0B2027";
        th.style.color = "#FED766"
        th.style.fontSize = "20px"
        headerRow.appendChild(th);
    });

    table.appendChild(headerRow);

    // Täytetään rivit relevantilla datalla
    const shows = xmlDoc.getElementsByTagName("Show");
    for (let i = 0; i < shows.length; i++){
        const show = shows[i];
        const title = show.getElementsByTagName("Title")[0].textContent;
        const genre = show.getElementsByTagName("Genres")[0].textContent;
        const rating = show.getElementsByTagName("Rating")[0].textContent;
        const showtime = show.getElementsByTagName("dttmShowStart")[0].textContent;

        // image url
        const eventPoster = show.getElementsByTagName("EventSmallImagePortrait")[0]?.textContent;
        // luodaan kuva-elementti urlista (tai ilmoitetaan, jos kuvaa ei löydy!)
        const posterCell = document.createElement("td");
        if (eventPoster) {
            const img = document.createElement("img");
            img.src = eventPoster;
            img.style.width = "100px";
            img.style.height = "auto";
            posterCell.appendChild(img);
        } else {
            posterCell.textContent = "Kuvaa ei löytynyt!";
        }

        // Luodaan solut näytettäville tiedoille
        const titleCell = document.createElement("td"); //nimi
        titleCell.textContent = title;

        const genreCell = document.createElement("td"); //genre
        genreCell.textContent = genre;

        const ratingCell = document.createElement("td"); // ikärajoitus
        ratingCell.textContent = rating;

        const showtimeCell = document.createElement("td"); //esitysaika
        showtimeCell.textContent = new Date(showtime).toLocaleString();

        // Lisätään rivi taulukkoon
        const row = document.createElement("tr");
        [posterCell, titleCell, genreCell, ratingCell, showtimeCell].forEach(cell => {
            cell.style.border = "2px solid #0B2027";
            cell.style.padding = "15px";

            row.appendChild(cell);
        });
        table.appendChild(row);
    }
    // Lopuksi lisätään taulukko output-diviin
    infoOutput.appendChild(table);


}

// funktio, jolla näytetään "päivän elokuvat" teksti
function displayHeader(){
    displayArea.style.display = "block"
}

// haetaan uutta tietoa, jos teatterivalintaa vaihdetaan
theaterSelect.addEventListener("change", () => {
    displayHeader()//näyttää otsikon, kun teatteri valitaan
    const selectedTheaterName = theaterSelect.value;
    const theaterID = theaterMap[selectedTheaterName];

    if (theaterID) {
        fetchScheduleData(theaterID).then(xmlDoc => {
            populateScheduleTable(xmlDoc);
        });
    }
});

// kutsutaan teatterien tiedot ja täytetään valikko
fetchTheaterData().then(xmlDoc => {
    populateTheaterDropdown(xmlDoc);
});