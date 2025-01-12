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

function getChamberFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("chamber") || "house"; 
}


function toggleVisibility(chamber) {
    const chambers = ["house", "senate"];
    chambers.forEach(c => {
        const shouldShow = c === chamber;
        document.getElementById(`${c}-at-glance-title`).style.display = shouldShow ? "block" : "none";
        document.getElementById(`${c}-loyalty-tables`).style.display = shouldShow ? "block" : "none";
    });
}


function calculatePartyStatistics(chamberData) {
    const counts = { D: 0, R: 0, ID: 0 };
    const votePercentages = { D: 0, R: 0, ID: 0 };
    let totalVotes = { D: 0, R: 0, ID: 0 };

    chamberData.results[0].members.forEach(member => {
        const party = member.party;
        const votePercentage = member.votes_with_party_pct;

        if (votePercentage && party) {
            counts[party]++;
            totalVotes[party] += votePercentage;
        }
    });

    
    if (counts.D > 0) votePercentages.D = totalVotes.D / counts.D;
    if (counts.R > 0) votePercentages.R = totalVotes.R / counts.R;
    if (counts.ID > 0) votePercentages.ID = totalVotes.ID / counts.ID;

    return { counts, votePercentages };
}


function populateTable(chamber, stats) {
    document.getElementById(`${chamber}-dem-reps`).textContent = stats.counts.D;
    document.getElementById(`${chamber}-rep-reps`).textContent = stats.counts.R;
    document.getElementById(`${chamber}-ind-reps`).textContent = stats.counts.ID;
    document.getElementById(`${chamber}-total-reps`).textContent = stats.counts.D + stats.counts.R + stats.counts.ID;

    document.getElementById(`${chamber}-dem-vote`).textContent = stats.votePercentages.D.toFixed(2) + '%';
    document.getElementById(`${chamber}-rep-vote`).textContent = stats.votePercentages.R.toFixed(2) + '%';
    document.getElementById(`${chamber}-ind-vote`).textContent = stats.votePercentages.ID.toFixed(2) + '%';
}


function calculateLeastLoyalMembers(chamberData) {
    const members = chamberData.results[0].members.filter(member => member.votes_with_party_pct > 0);
    const tenPercentCount = Math.ceil(members.length * 0.1);
    return members.sort((a, b) => a.votes_with_party_pct - b.votes_with_party_pct).slice(0, tenPercentCount);
}


function populateLoyaltyTable(tableId, members) {
    const tableBody = document.getElementById(tableId).querySelector("tbody");
    tableBody.innerHTML = "";

    members.forEach(member => {
        const name = `${member.first_name} ${member.middle_name || ""} ${member.last_name}`.trim();
        const partyVotes = Math.round((member.total_votes * member.votes_with_party_pct) / 100);
        const partyVotesPct = member.votes_with_party_pct.toFixed(1);

        const row = document.createElement("tr");
        row.innerHTML = `
            <td><a href="${member.url}">${member.first_name} ${member.last_name}</a></td>
            <td>${partyVotes}</td>
            <td>${partyVotesPct}%</td>
        `;
        tableBody.appendChild(row);
    });
}


function calculateMostLoyalMembers(chamberData) {
    const members = chamberData.results[0].members.filter(member => member.votes_with_party_pct > 0);
    const tenPercentCount = Math.ceil(members.length * 0.1);
    return members.sort((a, b) => b.votes_with_party_pct - a.votes_with_party_pct).slice(0, tenPercentCount);
}


function main() {
    const chamber = getChamberFromUrl(); 
    const chamberData = chamber === "house" ? houseData : senateData;

    
    toggleVisibility(chamber);

    
    const stats = calculatePartyStatistics(chamberData);
    populateTable(chamber, stats);

    
    const leastLoyal = calculateLeastLoyalMembers(chamberData);
    const mostLoyal = calculateMostLoyalMembers(chamberData);

    populateLoyaltyTable(`least-loyal-${chamber}`, leastLoyal);
    populateLoyaltyTable(`most-loyal-${chamber}`, mostLoyal);
}


document.addEventListener("DOMContentLoaded", main);
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const chamber = urlParams.get('chamber') || 'house'; 
    showSection(chamber);
});