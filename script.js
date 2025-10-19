// Player data with numbered image paths
const players = [
    {
        id: 1,
        name: "Rohit Sharma",
        role: "Batsman",
        roleClass: "role-batsman",
        image: "images/Sharma.jpg",
        description: "Right-handed opening batsman and captain of the Indian cricket team. Known for his elegant stroke play and ability to score big centuries.",
        matches: 248,
        runs: 10123,
        wickets: 8
    },
    {
        id: 2,
        name: "Virat Kohli",
        role: "Batsman",
        roleClass: "role-batsman",
        image: "images/Kohli.jpg",
        description: "Right-handed top-order batsman, former captain. One of the best batsmen in the world with numerous records to his name.",
        matches: 275,
        runs: 12898,
        wickets: 4
    },
    {
        id: 3,
        name: "KL Rahul",
        role: "Wicket-Keeper",
        roleClass: "role-wk",
        image: "images/Rahul.jpg",
        description: "Right-handed batsman and wicket-keeper. Known for his versatility in batting order and safe hands behind the stumps.",
        matches: 68,
        runs: 2645,
        wickets: 0
    },
    {
        id: 4,
        name: "Shreyas Iyer",
        role: "Batsman",
        roleClass: "role-batsman",
        image: "images/Iyer.jpg",
        description: "Right-handed middle-order batsman. Strong player of spin bowling and known for accelerating the innings in middle overs.",
        matches: 52,
        runs: 1631,
        wickets: 0
    },
    {
        id: 5,
        name: "Hardik Pandya",
        role: "All-Rounder",
        roleClass: "role-allrounder",
        image: "images/Pandya.jpg",
        description: "Right-handed batsman and right-arm medium-fast bowler. Dynamic all-rounder known for his power hitting and useful bowling.",
        matches: 87,
        runs: 1759,
        wickets: 82
    },
    {
        id: 6,
        name: "Ravindra Jadeja",
        role: "All-Rounder",
        roleClass: "role-allrounder",
        image: "images/Jadeja.jpg",
        description: "Left-handed batsman and left-arm orthodox spinner. Exceptional fielder and valuable all-rounder in all formats.",
        matches: 197,
        runs: 2759,
        wickets: 220
    },
    {
        id: 7,
        name: "Ravichandran Ashwin",
        role: "Bowler",
        roleClass: "role-bowler",
        image: "images/Ashwin.jpg",
        description: "Right-handed batsman and right-arm off-break bowler. Crafty spinner with variations and useful lower-order batting.",
        matches: 116,
        runs: 707,
        wickets: 161
    },
    {
        id: 8,
        name: "Jasprit Bumrah",
        role: "Bowler",
        roleClass: "role-bowler",
        image: "images/Bumrah.jpg",
        description: "Right-arm fast bowler. Known for his unorthodox action, deadly yorkers, and ability to bowl in any phase of the game.",
        matches: 89,
        runs: 56,
        wickets: 146
    },
    {
        id: 9,
        name: "Mohammed Shami",
        role: "Bowler",
        roleClass: "role-bowler",
        image: "images/Shami.jpg",
        description: "Right-arm fast bowler. Known for his seam position and ability to swing the ball both ways. Deadly in helpful conditions.",
        matches: 101,
        runs: 90,
        wickets: 195
    },
    {
        id: 10,
        name: "Kuldeep Yadav",
        role: "Bowler",
        roleClass: "role-bowler",
        image: "images/Yadav.jpg",
        description: "Left-arm wrist spinner. Known for his variations and ability to take wickets in the middle overs. Difficult to read for batsmen.",
        matches: 91,
        runs: 125,
        wickets: 141
    },
    {
        id: 11,
        name: "Mohammed Siraj",
        role: "Bowler",
        roleClass: "role-bowler",
        image: "images/Siraj.jpg",
        description: "Right-arm fast bowler. Has improved significantly in recent years with ability to swing the ball at good pace.",
        matches: 35,
        runs: 22,
        wickets: 58
    },
    {
        id: 12,
        name: "Shubman GIll",
        role: "Batsman",
        roleClass: "role-batsman",
        image: "images/GIll.jpg",
        description: "Right-handed opening batsman. Young talent with excellent technique and a wide range of shots.",
        matches: 41,
        runs: 2271,
        wickets: 0
    },
    {
        id: 13,
        name: "Ishan Kishan",
        role: "Wicket-Keeper",
        roleClass: "role-wk",
        image: "images/Kishan.jpg",
        description: "Left-handed batsman and wicket-keeper. Aggressive opener who can also play in the middle order.",
        matches: 27,
        runs: 894,
        wickets: 0
    },
    {
        id: 14,
        name: "Shardul Thakur",
        role: "All-Rounder",
        roleClass: "role-allrounder",
        image: "images/Thakur.jpg",
        description: "Right-arm medium-fast bowler and useful lower-order batsman. Known for breaking partnerships and scoring quick runs.",
        matches: 48,
        runs: 329,
        wickets: 67
    },
    {
        id: 15,
        name: "Axar Patel",
        role: "All-Rounder",
        roleClass: "role-allrounder",
        image: "images/Patel.jpg",
        description: "Left-handed batsman and left-arm orthodox spinner. Economical bowler and handy lower-order batsman.",
        matches: 57,
        runs: 505,
        wickets: 63
    }
];

// Function to create player card HTML
function createPlayerCard(player) {
    return `
        <div class="player-card">
            <div class="player-image">
                <img src="${player.image}" alt="${player.name}" onerror="this.src='images/placeholder.jpg'">
            </div>
            <div class="player-info">
                <h3 class="player-name">${player.name}</h3>
                <span class="player-role ${player.roleClass}">${player.role}</span>
                <p class="player-desc">${player.description}</p>
                <div class="stats">
                    <span>Matches: ${player.matches}</span>
                    <span>Runs: ${player.runs}</span>
                    <span>Wickets: ${player.wickets}</span>
                </div>
            </div>
        </div>
    `;
}

// Function to create bench player card HTML
function createBenchCard(player) {
    return `
        <div class="bench-card">
            <div class="bench-image">
                <img src="${player.image}" alt="${player.name}" onerror="this.src='images/placeholder.jpg'">
            </div>
            <div class="bench-info">
                <h4 class="bench-name">${player.name}</h4>
                <div class="bench-role">${player.role}</div>
            </div>
        </div>
    `;
}

// Populate Playing XI (first 11 players)
const playingXIContainer = document.getElementById('playingXI');
for (let i = 0; i < 11; i++) {
    playingXIContainer.innerHTML += createPlayerCard(players[i]);
}

// Populate Bench Players (remaining players)
const benchContainer = document.getElementById('benchPlayers');
for (let i = 11; i < players.length; i++) {
    benchContainer.innerHTML += createBenchCard(players[i]);
}