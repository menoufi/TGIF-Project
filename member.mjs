import { senateData, houseData } from "./pro-congress-117-senate.mjs"; 
import { states } from './states.mjs';

function getChamberFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("chamber") || "senate";
}

function makeStatesMenu() {
  return `
    <option value="">Select a state</option>
    ${states.map(state => `
      <option value="${state.abbreviation}">${state.name}</option>
    `).join('')}`;
}

function getSelectedParties() {
  return ['D', 'R', 'ID'].filter(partyCode => {
    const checkbox = document.getElementById(`party-${partyCode}`);
    return checkbox && checkbox.checked;
  });
}

function makeMemberRows(data, selectedParties, selectedState) {
  return data
    .filter(member => selectedParties.includes(member.party))
    .filter(member => !selectedState || member.state === selectedState)
    .map(member => `
      <tr>
        <td><a href="${member.url}">${member.first_name} ${member.last_name}</a></td>
        <td>${member.party}</td>
        <td>${member.state}</td>
        <td>${member.seniority}</td>
        <td>${member.votes_with_party_pct}%</td>
      </tr>
    `)
    .join('');
}

function refreshTable(membersData) {
  const selectedParties = getSelectedParties();
  const selectedState = document.getElementById("state-filter").value;
  const tableBody = document.querySelector("table tbody");
  tableBody.innerHTML = makeMemberRows(membersData, selectedParties, selectedState);
}

function toggleIntroText(chamber) {
  const senateIntro = document.getElementById('senate-intro');
  const houseIntro = document.getElementById('house-intro');

  if (chamber === 'house') {
    senateIntro.style.display = 'none';
    houseIntro.style.display = 'block';
  } else {
    houseIntro.style.display = 'none';
    senateIntro.style.display = 'block';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const chamber = getChamberFromURL();
  toggleIntroText(chamber);

  const membersData = (chamber === "house")
    ? houseData.results[0].members
    : senateData.results[0].members;

  const stateDropdown = document.getElementById("state-filter");
  stateDropdown.innerHTML = makeStatesMenu();

  refreshTable(membersData);

  ['D', 'R', 'ID'].forEach(partyCode => {
    const checkbox = document.getElementById(`party-${partyCode}`);
    if (checkbox) {
      checkbox.addEventListener('change', () => refreshTable(membersData));
    }
  });

  stateDropdown.addEventListener('change', () => refreshTable(membersData));
});

document.addEventListener("DOMContentLoaded", () => {
  const readMoreBtn = document.getElementById("read-more-btn");
  const moreText = document.getElementById("more-text");

  if (readMoreBtn && moreText) {
    readMoreBtn.addEventListener("click", () => {
      const isHidden = moreText.style.display === "none";
      moreText.style.display = isHidden ? "block" : "none";
      readMoreBtn.textContent = isHidden ? "Read Less" : "Read More";
    });
  }
});










