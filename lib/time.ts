const DIVISIONS = [
  { amount: 60, name: "seconds" },
  { amount: 60, name: "minutes" },
  { amount: 24, name: "hours" },
  { amount: 7, name: "days" },
  { amount: 4.34524, name: "weeks" },
  { amount: 12, name: "months" },
  { amount: Infinity, name: "years" },
] as const;

const relativeFormatter = new Intl.RelativeTimeFormat(undefined, {
  numeric: "auto",
});

export function formatRelativeTime(input: string | number | Date) {
  const date = new Date(input);
  const diff = (date.getTime() - Date.now()) / 1000;
  let duration = diff;

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return relativeFormatter.format(
        Math.round(duration),
        division.name as Intl.RelativeTimeFormatUnit,
      );
    }
    duration /= division.amount;
  }

  return relativeFormatter.format(Math.round(duration), "years");
}

export function formatTimestampLabel(input: string | number | Date) {
  const date = new Date(input);
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
}

export function formatHeaderTimestamp(input: string | number | Date) {
  const date = new Date(input);
  return date.toLocaleString(undefined, {
    timeZone: "UTC",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
