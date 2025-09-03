export enum TransactionCategories {
  FOOD = 'Alimentação',
  TRANSPORT = 'Transporte',
  LEISURE = 'Lazer',
  HEALTH = 'Saúde',
  EDUCATION = 'Educação',
  HOUSING = 'Moradia',
  CLOTHING = 'Vestuário',
  ENTERTAINMENT = 'Entretenimento',
  TECHNOLOGY = 'Tecnologia',
  OTHER = 'Outros',
}

export const getAllCategories = (): string[] => {
  return Object.values(TransactionCategories)
}
