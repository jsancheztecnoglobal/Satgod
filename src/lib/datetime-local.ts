function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function isoToLocalDateTimeInput(iso: string) {
  const date = new Date(iso);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function localDateTimeInputToIso(value: string) {
  return new Date(value).toISOString();
}
