import {compareType,comboToType} from "/utils/utils.js";

function addCardToBucket(bucketList, card, tag) {
    if(card.colors.length === 0) {
        if(!bucketList["C"][tag]) {
            bucketList["C"][tag] = [];
        }
        bucketList["C"][tag].push(card);
        return bucketList;
    }
    if(card.colors.length > 1) {
        const combo = comboToType(card.colors.sort().join(""));
        if(!bucketList["M"][combo]) {
            bucketList["M"][combo] = [];
        }
        bucketList["M"][combo].push(card);
        return bucketList;
    }
    if(!bucketList[card.colors[0]][tag]) {
        bucketList[card.colors[0]][tag] = [];
    }
    bucketList[card.colors[0]][tag].push(card);
    return bucketList;
}

function addCell(colorBuckets, archetypeBuckets, roleBuckets, card, cell, sortMode) {
    if (sortMode == "archetype_tags") {
        if(!card.archetype_tags || card.archetype_tags.length == 0){
            addCardToBucket(archetypeBuckets,card,"Flex")
        } else{
        card.archetype_tags.forEach(tag => {
            archetypeBuckets = addCardToBucket(archetypeBuckets, card, tag);
        });}
    } else if (sortMode == "role_tags") {
        if(!card.role_tags || card.role_tags.length == 0){
            addCardToBucket(roleBuckets,card,"Flex")
        } else{
        card.role_tags.forEach(tag => {
            roleBuckets = addCardToBucket(roleBuckets, card, tag);
        });}
    } else {
        colorBuckets = addCardToBucket(colorBuckets, card, card.type_line.split(" — ")[0].split(" ").at(-1));
    }
    return archetypeBuckets, roleBuckets, colorBuckets;
}

function cube_main() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    var version_num = urlParams.get('version');
    if (version_num == "latest") {
        version_num = "2026_1_17";
    }
    const sortMode = urlParams.get('sort') || "standard";
    document.getElementById("sort-mode").setAttribute("sort-mode", sortMode);

    document.querySelector("h1").innerText = "Cube - Version " + version_num.replaceAll("_", ".");

    const cubeJson = fetch('../Data/CubeVersions/' + version_num + '.json')
        .then(response => response.json())
        .then(data => {
            const table = document.getElementById("cube");
            const headers = ["White", "Blue", "Black", "Red", "Green", "Colorless", "Multicolor"];

            //this is the version for basic Color >> Type sorting.
            //Multicolor is sorted by color combination
            var colorBuckets = {
                "W": { "Creature": [], "Instant": [], "Sorcery": [], "Artifact": [], "Enchantment": [], "Planeswalker": [], "Land": [] },
                "U": { "Creature": [], "Instant": [], "Sorcery": [], "Artifact": [], "Enchantment": [], "Planeswalker": [], "Land": [] },
                "B": { "Creature": [], "Instant": [], "Sorcery": [], "Artifact": [], "Enchantment": [], "Planeswalker": [], "Land": [] },
                "R": { "Creature": [], "Instant": [], "Sorcery": [], "Artifact": [], "Enchantment": [], "Planeswalker": [], "Land": [] },
                "G": { "Creature": [], "Instant": [], "Sorcery": [], "Artifact": [], "Enchantment": [], "Planeswalker": [], "Land": [] },
                "C": { "Creature": [], "Instant": [], "Sorcery": [], "Artifact": [], "Enchantment": [], "Planeswalker": [], "Land": [] },
                "M": { "UW": [], "BU": [], "BR": [], "GR": [], "GW": [], "BW": [], "RU": [], "BG": [], "RW": [], "GU": [], "BUW": [], "BRU": [], "BGR": [], "GRW": [], "GUW": [], "BRW": [], "BGU": [], "GRU": [], "RUW": [], "BGW": [], "BRUW": [], "BGRU": [], "BRGW": [], "RGUW": [], "BGUW": [], "BGRUW": [] }
            };
            var archetypeBuckets = {
                "W": {},
                "U": {},
                "B": {},
                "R": {},
                "G": {},
                "C": {},
                "M": {}
            };
            var roleBuckets = {
                "W": {},
                "U": {},
                "B": {},
                "R": {},
                "G": {},
                "C": {},
                "M": {}
            };

            // Convert the json to a dictionary so that we can sort it
            const sortableArray = Object.entries(data);

            //sort by type, then cmc, then name
            sortableArray.sort((a, b) => {
                if (compareType(a[1], b[1]) !== 0) {
                    return compareType(a[1], b[1]);
                }
                if (a[1].cmc !== b[1].cmc) {
                    return a[1].cmc - b[1].cmc;
                }
                return a[1].name.localeCompare(b[1].name);
            });

            //iterate through the array, put each card in the appropriate bucket
            sortableArray.forEach(([key, card]) => {
                const cell = document.createElement("div");
                cell.setAttribute("class", "card-cell");
                cell.innerHTML = `
                            <a href="card.html?cardName=${encodeURIComponent(card.name)}&version=${version_num}">${card.name}</a>
                        `;

                colorBuckets, archetypeBuckets, roleBuckets = addCell(colorBuckets, archetypeBuckets, roleBuckets, card, cell, sortMode);
            });


            //put each bucket under its appropriate header
            headers.forEach(header => {
                const usedBuckets = sortMode == "archetype_tags" ? archetypeBuckets : sortMode == "role_tags" ? roleBuckets : colorBuckets;

                const row = document.createElement("div");
                row.setAttribute("class", "color-header " + header.toLowerCase());
                const totalCount = Object.values(usedBuckets[header[0]]).reduce((sum, arr) => sum + arr.length, 0);
                var cell = document.createElement("div");
                cell.textContent = header + ' (' + totalCount + ')';
                row.appendChild(cell);
                var colorKey = header[0]; // Assuming header is like "White", "Blue", etc.
                if (header == "Blue") {
                    colorKey = "U";
                }
                Object.keys(usedBuckets[colorKey]).forEach((type) => {
                    const cards = usedBuckets[colorKey][type];
                    if (cards.length === 0) {
                        return;
                    }
                    const subRow = document.createElement("div");
                    subRow.setAttribute("class", "type-row");
                    if (sortMode == "standard" && !["Creature", "Instant", "Sorcery", "Artifact", "Enchantment", "Planeswalker", "Land"].includes(type)) {
                        type = comboToType(type);
                    }
                    subRow.appendChild(document.createElement("div")).textContent = `${type} (${cards.length})`;
                    for (const card of cards) {
                        var cardDiv = document.createElement("div");
                        cardDiv.setAttribute("class", "card-cell");
                        cardDiv.innerHTML = `
                            <a href="card.html?cardName=${encodeURIComponent(card.name)}&version=${version_num}">${card.name}</a>
                        `;
                        subRow.appendChild(cardDiv);
                    }
                    row.appendChild(subRow);
                });
                table.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching cube data:', error));
}

cube_main();