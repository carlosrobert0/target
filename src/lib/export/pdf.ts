import { numberToCurrency } from '@/utils/numberToCurrency'

export type MonthlyReportData = {
  monthLabel: string
  totalIncome: number
  totalExpense: number
  net: number
  byCategory: { category: string; total: number }[]
  byBucket: { name: string; allocated: number; spent: number; percentage: number }[]
  transactions: {
    date: string
    target_name: string
    amount: number
    category: string | null
    observation: string | null
  }[]
}

export function buildMonthlyReportHTML(data: MonthlyReportData): string {
  const categoryRows = data.byCategory
    .map(
      (c) => `
        <tr>
          <td>${escapeHtml(c.category)}</td>
          <td style="text-align:right">${numberToCurrency(c.total)}</td>
        </tr>`,
    )
    .join('')

  const bucketRows = data.byBucket
    .map((b) => {
      const ratio = b.allocated > 0 ? Math.min(100, (b.spent / b.allocated) * 100) : 0
      return `
        <div class="bucket">
          <div class="bucket-head">
            <span>${escapeHtml(b.name)}</span>
            <span>${numberToCurrency(b.spent)} / ${numberToCurrency(b.allocated)}</span>
          </div>
          <div class="bar"><div class="bar-fill" style="width:${ratio}%"></div></div>
        </div>`
    })
    .join('')

  const txRows = data.transactions
    .map(
      (t) => `
        <tr>
          <td>${escapeHtml(t.date)}</td>
          <td>${escapeHtml(t.target_name)}</td>
          <td>${escapeHtml(t.category ?? '—')}</td>
          <td>${escapeHtml(t.observation ?? '')}</td>
          <td style="text-align:right;color:${t.amount < 0 ? '#dc2626' : '#16a34a'}">
            ${numberToCurrency(t.amount)}
          </td>
        </tr>`,
    )
    .join('')

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Relatório ${escapeHtml(data.monthLabel)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, system-ui, sans-serif; margin: 32px; color: #111; }
  h1 { font-size: 24px; margin: 0 0 4px; }
  h2 { font-size: 16px; margin: 24px 0 8px; }
  .subtitle { color: #6b7280; margin: 0 0 16px; font-size: 12px; }
  .summary { display: flex; gap: 12px; margin: 16px 0 24px; }
  .card { flex: 1; padding: 12px; border-radius: 12px; background: #f3f4f6; }
  .card .label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: .5px; }
  .card .value { font-size: 18px; font-weight: 700; margin-top: 4px; }
  .income .value { color: #16a34a; }
  .expense .value { color: #dc2626; }
  .bucket { margin-bottom: 12px; }
  .bucket-head { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
  .bar { height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden; }
  .bar-fill { height: 100%; background: #3d44cd; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; text-align: left; }
  th { background: #f9fafb; font-weight: 600; color: #6b7280; }
</style>
</head>
<body>
  <h1>Relatório financeiro</h1>
  <p class="subtitle">${escapeHtml(data.monthLabel)} · gerado pelo Cofrin</p>

  <div class="summary">
    <div class="card income">
      <div class="label">Entradas</div>
      <div class="value">${numberToCurrency(data.totalIncome)}</div>
    </div>
    <div class="card expense">
      <div class="label">Saídas</div>
      <div class="value">${numberToCurrency(Math.abs(data.totalExpense))}</div>
    </div>
    <div class="card">
      <div class="label">Saldo</div>
      <div class="value">${numberToCurrency(data.net)}</div>
    </div>
  </div>

  <h2>Orçamento por bucket</h2>
  ${bucketRows || '<p class="subtitle">Sem gastos categorizados no período.</p>'}

  <h2>Gastos por categoria</h2>
  <table>
    <thead><tr><th>Categoria</th><th style="text-align:right">Total</th></tr></thead>
    <tbody>${categoryRows || '<tr><td colspan="2">—</td></tr>'}</tbody>
  </table>

  <h2>Transações</h2>
  <table>
    <thead>
      <tr>
        <th>Data</th><th>Meta</th><th>Categoria</th><th>Descrição</th>
        <th style="text-align:right">Valor</th>
      </tr>
    </thead>
    <tbody>${txRows || '<tr><td colspan="5">—</td></tr>'}</tbody>
  </table>
</body>
</html>`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
