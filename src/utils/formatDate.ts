export function formatDate(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  }
  return new Date(dateString).toLocaleDateString('pt-BR', options)
}
