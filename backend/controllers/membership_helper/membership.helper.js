// helpers/membership.js
export function daysFromType(type) {
  switch ((type || "").toLowerCase()) {
    case "daily":
      return 1;
    case "weekly":
      return 7;
    case "monthly":
      return 30;
    case "yearly":
      return 365;
    default:
      return 30;
  }
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + Number(days));
  return d;
}

export function nowUTC() {
  return new Date(); // store as ISO, prefer UTC server time
}
