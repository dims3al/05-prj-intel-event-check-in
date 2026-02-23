// Get DOM Elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamInput = document.getElementById("teamSelect");

const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const greetingMessage = document.getElementById("greeting");

const celebrationMessage = document.getElementById("celebrationMessage");
const waterCount = document.getElementById("waterCount");
const zeroCount = document.getElementById("zeroCount");
const powerCount = document.getElementById("powerCount");
const attendeeList = document.getElementById("attendeeList");

const waterCard = document.querySelector(".team-card.water");
const zeroCard = document.querySelector(".team-card.zero");
const powerCard = document.querySelector(".team-card.power");

// Track attendance
let count = 0;
const maxCount = 50;
let teamCounts = {
  water: 0,
  zero: 0,
  power: 0,
};
let attendees = [];

function saveData() {
  localStorage.setItem("intelCheckInCount", `${count}`);
  localStorage.setItem("intelCheckInTeams", JSON.stringify(teamCounts));
  localStorage.setItem("intelCheckInAttendees", JSON.stringify(attendees));
}

function clearWinnerHighlight() {
  waterCard.classList.remove("winner");
  zeroCard.classList.remove("winner");
  powerCard.classList.remove("winner");
}

function getWinningTeams() {
  const highest = Math.max(teamCounts.water, teamCounts.zero, teamCounts.power);

  if (highest === 0) {
    return [];
  }

  const winners = [];

  if (teamCounts.water === highest) {
    winners.push("water");
  }
  if (teamCounts.zero === highest) {
    winners.push("zero");
  }
  if (teamCounts.power === highest) {
    winners.push("power");
  }

  return winners;
}

function getTeamDisplayName(teamKey) {
  if (teamKey === "water") {
    return "Team Water Wise";
  }
  if (teamKey === "zero") {
    return "Team Net Zero";
  }
  return "Team Renewables";
}

function renderAttendeeList() {
  attendeeList.innerHTML = "";

  let index = 0;
  while (index < attendees.length) {
    const attendee = attendees[index];
    const listItem = document.createElement("li");
    listItem.textContent = `${attendee.name} — ${attendee.teamName}`;
    attendeeList.appendChild(listItem);
    index++;
  }
}

function updateProgressBar() {
  const percentage = Math.round((count / maxCount) * 100);
  progressBar.style.width = `${percentage}%`;
  progressBar.style.backgroundImage = "none";

  if (percentage <= 25) {
    progressBar.style.backgroundColor = "#28a745";
  } else if (percentage <= 50) {
    progressBar.style.backgroundColor = "#ffc107";
  } else if (percentage <= 75) {
    progressBar.style.backgroundColor = "#fd7e14";
  } else {
    progressBar.style.backgroundColor = "#dc3545";
  }
}

function updateCounts() {
  attendeeCount.textContent = `${count}`;
  waterCount.textContent = `${teamCounts.water}`;
  zeroCount.textContent = `${teamCounts.zero}`;
  powerCount.textContent = `${teamCounts.power}`;
}

function showGoalCelebration() {
  clearWinnerHighlight();

  const winners = getWinningTeams();
  if (winners.length === 0) {
    return;
  }

  let winnerMessage = "";

  if (winners.length === 1) {
    winnerMessage = `🏆 Attendance goal reached! Winning team: ${getTeamDisplayName(winners[0])}.`;
  } else {
    const winnerNames = [];
    let winnerIndex = 0;
    while (winnerIndex < winners.length) {
      winnerNames.push(getTeamDisplayName(winners[winnerIndex]));
      winnerIndex++;
    }
    winnerMessage = `🏆 Attendance goal reached! It's a tie: ${winnerNames.join(" and ")}.`;
  }

  celebrationMessage.textContent = winnerMessage;
  celebrationMessage.style.display = "block";

  if (winners.indexOf("water") !== -1) {
    waterCard.classList.add("winner");
  }
  if (winners.indexOf("zero") !== -1) {
    zeroCard.classList.add("winner");
  }
  if (winners.indexOf("power") !== -1) {
    powerCard.classList.add("winner");
  }
}

function hideGoalCelebration() {
  celebrationMessage.style.display = "none";
  clearWinnerHighlight();
}

function restoreData() {
  const storedCount = localStorage.getItem("intelCheckInCount");
  const storedTeams = localStorage.getItem("intelCheckInTeams");
  const storedAttendees = localStorage.getItem("intelCheckInAttendees");

  if (storedCount !== null) {
    count = parseInt(storedCount, 10);
    if (Number.isNaN(count)) {
      count = 0;
    }
  }

  if (storedTeams) {
    const parsedTeams = JSON.parse(storedTeams);
    if (parsedTeams && typeof parsedTeams === "object") {
      teamCounts.water = parsedTeams.water || 0;
      teamCounts.zero = parsedTeams.zero || 0;
      teamCounts.power = parsedTeams.power || 0;
    }
  }

  if (storedAttendees) {
    const parsedAttendees = JSON.parse(storedAttendees);
    if (Array.isArray(parsedAttendees)) {
      attendees = parsedAttendees;
    }
  }

  if (count > maxCount) {
    count = maxCount;
  }

  updateCounts();
  updateProgressBar();
  renderAttendeeList();

  if (count >= maxCount) {
    showGoalCelebration();
  }
}

// Form submission handler

form.addEventListener("submit", function (event) {
  event.preventDefault();

  if (count >= maxCount) {
    greetingMessage.textContent =
      "Attendance is full at 50/50. Check-in is now closed.";
    greetingMessage.style.display = "block";
    showGoalCelebration();
    return;
  }

  const name = nameInput.value;
  const team = teamInput.value;
  const teamName = teamInput.selectedOptions[0].text;

  count++;

  teamCounts[team] = teamCounts[team] + 1;
  attendees.push({
    name: name,
    team: team,
    teamName: teamName,
  });

  updateCounts();
  updateProgressBar();
  renderAttendeeList();

  // Show Welcome Message
  const message = `🎉 Welcome, ${name} from ${teamName}!`;
  greetingMessage.textContent = message;
  greetingMessage.style.display = "block";

  if (count >= maxCount) {
    showGoalCelebration();
  } else {
    hideGoalCelebration();
  }

  saveData();

  // Reset form
  form.reset();
});

restoreData();
