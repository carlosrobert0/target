export type AchievementKey =
  | 'first_target'
  | 'first_transaction'
  | 'target_completed'
  | 'ten_transactions'
  | 'fifty_transactions'
  | 'first_recurring'
  | 'three_targets'
  | 'budget_within'

export type AchievementDef = {
  key: AchievementKey
  title: string
  description: string
  icon: string
  color: string
}

export const ACHIEVEMENTS: Record<AchievementKey, AchievementDef> = {
  first_target: {
    key: 'first_target',
    title: 'Primeira meta',
    description: 'Você criou sua primeira meta. O começo de tudo.',
    icon: 'target',
    color: 'green',
  },
  first_transaction: {
    key: 'first_transaction',
    title: 'Primeira transação',
    description: 'Registrou seu primeiro lançamento. O hábito começou.',
    icon: 'edit-3',
    color: 'blue',
  },
  target_completed: {
    key: 'target_completed',
    title: 'Meta concluída',
    description: 'Atingiu 100% de uma meta. Parabéns!',
    icon: 'check-circle',
    color: 'green',
  },
  ten_transactions: {
    key: 'ten_transactions',
    title: '10 transações',
    description: 'Já registrou 10 transações. Está pegando o ritmo.',
    icon: 'trending-up',
    color: 'blue',
  },
  fifty_transactions: {
    key: 'fifty_transactions',
    title: '50 transações',
    description: 'Cinquenta lançamentos. Disciplina financeira de verdade.',
    icon: 'award',
    color: 'yellow',
  },
  first_recurring: {
    key: 'first_recurring',
    title: 'Automatizou',
    description: 'Configurou sua primeira recorrência. Trabalho menos, controle mais.',
    icon: 'repeat',
    color: 'blue',
  },
  three_targets: {
    key: 'three_targets',
    title: 'Múltiplos objetivos',
    description: 'Criou 3 metas. Você sabe onde quer chegar.',
    icon: 'flag',
    color: 'green',
  },
  budget_within: {
    key: 'budget_within',
    title: 'Dentro do orçamento',
    description: 'Manteve gastos dentro do orçamento por um mês.',
    icon: 'shield',
    color: 'green',
  },
}

export const ACHIEVEMENT_LIST: AchievementDef[] = Object.values(ACHIEVEMENTS)
