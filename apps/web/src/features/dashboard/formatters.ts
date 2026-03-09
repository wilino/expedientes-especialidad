const dateFormatter = new Intl.DateTimeFormat('es-BO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('es-BO', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatLongDate(value: Date): string {
  return dateFormatter.format(value);
}

export function formatDateTime(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return dateTimeFormatter.format(date);
}

export function formatRelativeMinutes(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / (60 * 1000));

  if (diffMinutes < 1) {
    return 'hace unos segundos';
  }

  if (diffMinutes < 60) {
    return `hace ${diffMinutes} min`;
  }

  const hours = Math.round(diffMinutes / 60);
  if (hours < 24) {
    return `hace ${hours} h`;
  }

  const days = Math.round(hours / 24);
  return `hace ${days} d`;
}
