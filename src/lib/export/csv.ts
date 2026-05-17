export type CsvTransactionRow = {
  id: number
  date: string
  target_id: number
  target_name: string
  amount: number
  category: string | null
  observation: string | null
}

const HEADER = ['id', 'data', 'meta_id', 'meta', 'valor', 'categoria', 'descricao']

const BOM = '﻿'

export function transactionsToCSV(rows: CsvTransactionRow[]): string {
  const lines = [HEADER.join(',')]
  for (const row of rows) {
    lines.push(
      [
        row.id,
        row.date,
        row.target_id,
        escapeField(row.target_name),
        formatAmount(row.amount),
        escapeField(row.category ?? ''),
        escapeField(row.observation ?? ''),
      ].join(','),
    )
  }
  return BOM + lines.join('\n')
}

export type ParsedRow = {
  date: string
  target_id?: number
  target_name?: string
  amount: number
  category?: string
  observation?: string
}

export type ParseResult = {
  valid: ParsedRow[]
  invalid: { line: number; reason: string }[]
}

export function parseCSV(text: string): ParseResult {
  const stripped = text.replace(/^﻿/, '')
  const lines = stripped.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length === 0) return { valid: [], invalid: [] }

  const valid: ParsedRow[] = []
  const invalid: { line: number; reason: string }[] = []

  const headerLine = lines[0]
  const headers = parseLine(headerLine).map((h) => h.trim().toLowerCase())

  const idx = {
    date: headers.indexOf('data'),
    target_id: headers.indexOf('meta_id'),
    target_name: headers.indexOf('meta'),
    amount: headers.indexOf('valor'),
    category: headers.indexOf('categoria'),
    observation: headers.indexOf('descricao'),
  }

  if (idx.date === -1 || idx.amount === -1) {
    invalid.push({ line: 1, reason: 'Cabeçalho inválido — precisa conter "data" e "valor"' })
    return { valid, invalid }
  }

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i])
    const dateStr = cols[idx.date]?.trim()
    const amountStr = cols[idx.amount]?.trim()
    const amount = Number(amountStr.replace(',', '.'))

    if (!dateStr || Number.isNaN(amount)) {
      invalid.push({ line: i + 1, reason: 'Data ou valor inválido' })
      continue
    }

    valid.push({
      date: dateStr,
      target_id: idx.target_id >= 0 ? Number(cols[idx.target_id]) || undefined : undefined,
      target_name: idx.target_name >= 0 ? cols[idx.target_name] : undefined,
      amount,
      category: idx.category >= 0 ? cols[idx.category] || undefined : undefined,
      observation: idx.observation >= 0 ? cols[idx.observation] || undefined : undefined,
    })
  }

  return { valid, invalid }
}

function escapeField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function formatAmount(value: number): string {
  return value.toFixed(2)
}

function parseLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        cur += ch
      }
    } else {
      if (ch === '"') inQuotes = true
      else if (ch === ',') {
        out.push(cur)
        cur = ''
      } else cur += ch
    }
  }
  out.push(cur)
  return out
}
