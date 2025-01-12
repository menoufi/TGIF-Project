import { senateData, houseData } from "./pro-congress-117-senate.mjs";

function showSection(chamber) {
    const houseSection = document.getElementById('house-section');
    const senateSection = document.getElementById('senate-section');

    if (chamber === 'house') {
        houseSection.style.display = 'block';
        senateSection.style.display = 'none';
    } else if (chamber === 'senate') {
        houseSection.style.display = 'none';
        senateSection.style.display = 'block';
    }
}

function calculatePartyStatistics(chamberData) {
    const counts = { D: 0, R: 0, ID: 0 };
    const votePercentages = { D: 0, R: 0, ID: 0 };
    let totalVotes = { D: 0, R: 0, ID: 0 };

    chamberData.results[0].members.forEach(member => {
        const party = member.party;
        const votePercentage = member.votes_with_party_pct || 0;

        if (party === "D") {
            counts.D++;
            totalVotes.D += votePercentage;
        } else if (party === "R") {
            counts.R++;
            totalVotes.R += votePercentage;
        } else if (party === "ID") {
            counts.ID++;
            totalVotes.ID += votePercentage;
        }
    });

    if (counts.D > 0) votePercentages.D = totalVotes.D / counts.D;
    if (counts.R > 0) votePercentages.R = totalVotes.R / counts.R;
    if (counts.ID > 0) votePercentages.ID = totalVotes.ID / counts.ID;

    return { counts, votePercentages };
}

function populateAtGlanceTable(chamber, stats) {
    document.getElementById(`${chamber}-dem-reps`).textContent = stats.counts.D;
    document.getElementById(`${chamber}-rep-reps`).textContent = stats.counts.R;
    document.getElementById(`${chamber}-ind-reps`).textContent = stats.counts.ID;
    document.getElementById(`${chamber}-total-reps`).textContent =
        stats.counts.D + stats.counts.R + stats.counts.ID;

    document.getElementById(`${chamber}-dem-vote`).textContent = stats.votePercentages.D.toFixed(2) + "%";
    document.getElementById(`${chamber}-rep-vote`).textContent = stats.votePercentages.R.toFixed(2) + "%";
    document.getElementById(`${chamber}-ind-vote`).textContent = stats.votePercentages.ID.toFixed(2) + "%";
}

function getEngagedMembers(chamberData, top = true) {
    const members = chamberData.results[0].members.filter(
        (member) => member.missed_votes_pct > 0
    );

    const sortedMembers = members.sort((a, b) =>
        top ? a.missed_votes_pct - b.missed_votes_pct : b.missed_votes_pct - a.missed_votes_pct
    );


    const tenPercentCount = Math.ceil(members.length * 0.1);
    return sortedMembers.slice(0, tenPercentCount);
}

function populateEngagementTable(chamber, tableId, members) {
    const tableBody = document.getElementById(tableId).querySelector("tbody");
    tableBody.innerHTML = ""; 

    members.forEach((member) => {
        const name = `${member.first_name} ${member.middle_name || ""} ${member.last_name}`.trim();
        const missedVotes = member.missed_votes || 0;
        const missedVotesPct = member.missed_votes_pct.toFixed(1);

        const row = document.createElement("tr");
        row.innerHTML = `
            <td><a href="${member.url}">${member.first_name} ${member.last_name}</a></td>
            <td>${missedVotes}</td>
            <td>${missedVotesPct}%</td>
        `;
        tableBody.appendChild(row);
    });
}

function toggleChamberVisibility(chamber) {
    const chambers = ["house", "senate"];
    chambers.forEach((c) => {
        const display = c === chamber ? "block" : "none";
        document.getElementById(`${c}-attendance-tables`).style.display = display;
        document.getElementById(`${c}-at-glance-title`).style.display = display;
    });
}

function getChamberFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("chamber") || "house"; 
}


function main() {
    const chamber = getChamberFromUrl(); 
    const chamberData = chamber === "house" ? houseData : senateData;

    
    const stats = calculatePartyStatistics(chamberData);
    populateAtGlanceTable(chamber, stats);

   
    const leastEngaged = getEngagedMembers(chamberData, false);
    const mostEngaged = getEngagedMembers(chamberData, true);

    populateEngagementTable(chamber, `least-engaged-${chamber}`, leastEngaged);
    populateEngagementTable(chamber, `most-engaged-${chamber}`, mostEngaged);

    
    toggleChamberVisibility(chamber);
}


document.addEventListener("DOMContentLoaded", main);
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const chamber = urlParams.get('chamber') || 'house'; 
    showSection(chamber);
});
