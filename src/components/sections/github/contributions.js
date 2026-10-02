// Contribution data comes from a public proxy of the GitHub profile calendar
// (same counts as github.com/<user>, including private contributions if shown there).
const API = "https://github-contributions-api.jogruber.de/v4";

export async function fetchContributions(user, year = "last", signal) {
  const res = await fetch(`${API}/${user}?y=${year}`, { signal });
  if (!res.ok) throw new Error(`GitHub contributions request failed (${res.status})`);
  const data = await res.json();
  const days = (data.contributions || []).map((d) => ({ date: d.date, count: d.count, level: d.level }));
  const total = Object.values(data.total || {}).reduce((a, b) => a + b, 0);
  return { days, total };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Sunday-first weekly columns, padded with nulls like the GitHub calendar.
export function toWeeks(days) {
  if (!days.length) return { weeks: [], months: [] };
  const first = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  const cells = [...Array(first).fill(null), ...days];
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const last = weeks[weeks.length - 1];
  while (last.length < 7) last.push(null);

  // Month label on the first week that contains days 1 to 7 of a month.
  const months = [];
  let prev = -1;
  weeks.forEach((week, col) => {
    const day = week.find(Boolean);
    if (!day) return;
    const m = Number(day.date.slice(5, 7)) - 1;
    if (m !== prev) {
      months.push({ col, label: MONTHS[m] });
      prev = m;
    }
  });
  // Drop a leading label that would collide with the next one.
  if (months.length > 1 && months[1].col - months[0].col < 3) months.shift();
  return { weeks, months };
}

export function summarize(days) {
  let longest = 0;
  let run = 0;
  let best = null;
  let activeDays = 0;
  for (const d of days) {
    if (d.count > 0) {
      run += 1;
      activeDays += 1;
      longest = Math.max(longest, run);
      if (!best || d.count > best.count) best = d;
    } else {
      run = 0;
    }
  }
  // Current streak counts back from the latest day; an empty "today" doesn't break it.
  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) current += 1;
    else if (i === days.length - 1) continue;
    else break;
  }
  return { longest, current, best, activeDays };
}
