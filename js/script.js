const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", function () {
    navLinks.classList.toggle("show");
  });
}

const filterButtons = document.querySelectorAll(".filter-btn");
const workoutCards = document.querySelectorAll(".workout-video-card");

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const selectedFilter = button.getAttribute("data-filter");

    filterButtons.forEach(function (btn) {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    workoutCards.forEach(function (card) {
      const bodyPart = card.getAttribute("data-bodypart");

      if (selectedFilter === "all" || selectedFilter === bodyPart) {
        card.classList.remove("hidden");
      } else {
        card.classList.add("hidden");
      }
    });
  });
});

// WEGYM prestige: each unique workout date counts once per week.
// Old one-time completion records are retained in localStorage, but cannot
// award historical weeks because they did not include completion dates.
const searchInput = document.getElementById("workoutSearch");
const progressLabel = document.getElementById("workoutProgress");
const clearProgress = document.getElementById("clearProgress");
const noResults = document.getElementById("noWorkoutResults");
const logKey = "wegym-workout-log-v2";
const ranks = [
  { name: "Rookie", weeks: 0, color: "#888888" },
  { name: "Bronze", weeks: 1, color: "#b87945" },
  { name: "Silver", weeks: 2, color: "#b8c3ce" },
  { name: "Gold", weeks: 4, color: "#f0c34c" },
  { name: "Platinum", weeks: 8, color: "#83d7dc" },
  { name: "Diamond", weeks: 12, color: "#8fbaff" },
  { name: "Master", weeks: 20, color: "#bd90ff" },
  { name: "Black Diamond", weeks: 32, color: "#f6f6ff" }
];
let workoutLog = [];
try {
  const parsed = JSON.parse(localStorage.getItem(logKey) || "[]");
  if (Array.isArray(parsed)) workoutLog = parsed.filter(x => x && typeof x.id === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x.date));
} catch (error) { console.warn("Could not load workout history", error); }

function localDate(date = new Date()) {
  const y = date.getFullYear();
  return `${y}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}
function weekStart(dateString) {
  const [y,m,d] = dateString.split("-").map(Number);
  const date = new Date(y,m-1,d);
  date.setDate(date.getDate() - ((date.getDay()+6)%7)); // Monday
  return localDate(date);
}
function persistLog() {
  try { localStorage.setItem(logKey, JSON.stringify(workoutLog)); }
  catch (error) { alert("Unable to save progress in this browser."); }
}
function refreshPrestige() {
  const daysByWeek = new Map();
  workoutLog.forEach(entry => {
    const wk = weekStart(entry.date);
    if (!daysByWeek.has(wk)) daysByWeek.set(wk,new Set());
    daysByWeek.get(wk).add(entry.date);
  });
  const qualifyingWeeks = [...daysByWeek.values()].filter(days => days.size >= 3).length;
  const rankIndex = ranks.reduce((acc,r,i) => qualifyingWeeks >= r.weeks ? i : acc,0);
  const rank = ranks[rankIndex], next = ranks[rankIndex+1];
  const thisWeek = daysByWeek.get(weekStart(localDate()))?.size || 0;
  const today = localDate();
  const loggedToday = workoutLog.filter(x=>x.date===today).length;
  if (progressLabel) progressLabel.textContent = `${loggedToday} workout${loggedToday===1?"":"s"} logged today`;
  document.getElementById("prestigeRank").textContent = rank.name;
  const emblem = document.getElementById("prestigeEmblem");
  emblem.style.color = rank.color;
  emblem.textContent = rankIndex===7 ? "◆◆" : "◆";
  document.getElementById("prestigeDetail").textContent = `${qualifyingWeeks} qualifying week${qualifyingWeeks===1?"":"s"} earned`;
  document.getElementById("prestigeWeekly").textContent = `This week: ${Math.min(thisWeek,3)}/3 workout days${thisWeek>=3?" ✓ Week qualified!":""}`;
  const percent = next ? Math.min(100,Math.round((qualifyingWeeks-rank.weeks)/(next.weeks-rank.weeks)*100)) : 100;
  const bar = document.getElementById("prestigeBar");
  bar.setAttribute("aria-valuenow",String(percent));
  document.getElementById("prestigeFill").style.width = `${percent}%`;
  document.getElementById("prestigeNext").textContent = next ? `${next.weeks-qualifyingWeeks} more qualifying week${next.weeks-qualifyingWeeks===1?"":"s"} to ${next.name}` : "MAX PRESTIGE UNLOCKED — BLACK DIAMOND";
  const tierContainer = document.getElementById("prestigeTiers");
  tierContainer.replaceChildren();
  ranks.forEach((tier,i) => {
    const item=document.createElement("span");
    item.className = `prestige-tier${i===rankIndex?" current":""}${qualifyingWeeks>=tier.weeks?" unlocked":""}`;
    item.textContent = `${tier.name} · ${tier.weeks}w`;
    if(i===rankIndex) item.setAttribute("aria-current","step");
    tierContainer.appendChild(item);
  });
}
window.WEGYM_PROGRESS = {
  getLog: () => workoutLog.map(x => ({...x})),
  setLog: entries => { workoutLog = entries; refreshWorkouts(); document.querySelectorAll(".complete-btn").forEach(b => b.refresh?.()); }
};
function refreshWorkouts() {
  if (!searchInput) return;
  const query = searchInput.value.trim().toLowerCase();
  const activeFilter = document.querySelector(".filter-btn.active")?.dataset.filter || "all";
  let visible = 0;
  workoutCards.forEach(card => {
    const matchesText = card.textContent.toLowerCase().includes(query);
    const matchesCategory = activeFilter === "all" || card.dataset.bodypart === activeFilter;
    const show = matchesText && matchesCategory;
    card.classList.toggle("hidden", !show);
    if (show) visible++;
  });
  if (noResults) noResults.classList.toggle("hidden",visible !== 0);
  refreshPrestige();
}
if (searchInput) {
  workoutCards.forEach(card => {
    const id = card.querySelector(".workout-id")?.textContent.trim();
    if (!id) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "complete-btn";
    function updateButton() {
      const done = workoutLog.some(x => x.id === id && x.date === localDate());
      button.textContent = done ? "✓ Logged today (undo)" : "Log today's workout";
      button.setAttribute("aria-pressed",String(done));
    }
    button.refresh = updateButton;
    button.addEventListener("click",async () => {
      if (window.WEGYM_CLOUD?.signedIn) {
        const today = localDate();
        const shouldAdd = !workoutLog.some(x=>x.id===id && x.date===today);
        await window.WEGYM_CLOUD.toggle(id,today,shouldAdd);
        return;
      }
      const today=localDate();
      if (workoutLog.some(x=>x.id===id && x.date===today)) {
        workoutLog = workoutLog.filter(x=>!(x.id===id && x.date===today));
      } else { workoutLog.push({id,date:today}); }
      persistLog();
      updateButton();
      refreshWorkouts();
    });
    card.appendChild(button);
    updateButton();
  });
  searchInput.addEventListener("input",refreshWorkouts);
  filterButtons.forEach(button => button.addEventListener("click",refreshWorkouts));
  clearProgress?.addEventListener("click",async () => {
    if (window.WEGYM_CLOUD?.signedIn) {
      if (confirm("Permanently delete ALL workout history in your cloud account?")) await window.WEGYM_CLOUD.reset();
      return;
    }
    if (!confirm("Delete all workout history and prestige ranks on this browser? This cannot be undone.")) return;
    workoutLog = [];
    persistLog();
    document.querySelectorAll(".complete-btn").forEach(button => {
      button.textContent = "Log today's workout";
      button.setAttribute("aria-pressed","false");
    });
    refreshWorkouts();
  });
  refreshWorkouts();
}
