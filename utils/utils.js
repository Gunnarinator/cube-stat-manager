//fetch the most recent version from versions.json. 
//they should all just be named by the year_month_day.
export function most_recent_version(){
    fetch("Data/CubeVersions/versions.json")
        .then(response => response.json())
        .then(data => {
            const versionKeys = Object.keys(data);
            versionKeys.sort((a, b) => {
                const [aYear, aMonth, aDay] = a.split("_").map(Number);
                const [bYear, bMonth, bDay] = b.split("_").map(Number);
                if (aYear !== bYear) return bYear - aYear;
                if (aMonth !== bMonth) return bMonth - aMonth;
                return bDay - aDay;
            });

            return versionKeys[0];
        })
}

//scryfall sorts its colors by alphabetical order mgrgrgr
export function comboToType(combo) {
    const comboDict = {
        "UW": "Azorius",
        "BU": "Dimir",
        "BR": "Rakdos",
        "GR": "Gruul",
        "GW": "Selesnya",
        "BW": "Orzhov",
        "RU": "Izzet",
        "BG": "Golgari",
        "RW": "Boros",
        "GU": "Simic",
        "BUW": "Esper",
        "BRU": "Grixis",
        "BGR": "Jund",
        "GRW": "Naya",
        "GUW": "Bant",
        "BRW": "Mardu",
        "BGU": "Sultai",
        "GRU": "Temur",
        "RUW": "Jeskai",
        "BGW": "Abzan",
        "BRUW": "Greenless",
        "BGRU": "Whiteless",
        "BRGW": "Blueless",
        "RGUW": "Blackless",
        "BGUW": "Redless",
        "BGRUW": "Five Color"
    };
    return comboDict[combo] || combo; // Return the original combo if not found
}

//helper function for compareType
export function typeToInt(type) {
    const typeDict = {
        "Land": 1,
        "Enchantment": 2,

        "Planeswalker": 3,
        "Artifact": 4,
        "Sorcery": 5,
        "Instant": 6,
        "Creature": 7
    };
    return typeDict[type] || 999; // Default to 999 if type not found
}

//sorting function for types
export function compareType(a, b) {
    const aType = a.type_line.split(" - ")[0]; // Get the main type
    const bType = b.type_line.split(" - ")[0];
    return (typeToInt(aType) || 999) - (typeToInt(bType) || 999); // Default to 999 if type not found
}
