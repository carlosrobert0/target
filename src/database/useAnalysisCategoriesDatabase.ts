import { useSQLiteContext } from 'expo-sqlite'
import { TransactionCategories } from '@/utils/TransactionCategories'

export interface AnalysisCategory {
  id?: number
  key: string
  name: string
  percentage: number
  color: string
  categories: TransactionCategories[]
  examples: string
}

export interface AnalysisCategories {
  [key: string]: AnalysisCategory
}

const DEFAULT_CATEGORIES: AnalysisCategories = {
  essentials: {
    key: 'essentials',
    name: 'Essenciais',
    percentage: 50,
    color: 'green',
    categories: [
      TransactionCategories.FOOD,
      TransactionCategories.TRANSPORT,
      TransactionCategories.HOUSING,
      TransactionCategories.HEALTH,
    ],
    examples: 'Moradia, alimentação, transporte, saúde',
  },
  wants: {
    key: 'wants',
    name: 'Desejos',
    percentage: 30,
    color: 'yellow',
    categories: [
      TransactionCategories.LEISURE,
      TransactionCategories.ENTERTAINMENT,
      TransactionCategories.CLOTHING,
    ],
    examples: 'Lazer, entretenimento, compras pessoais',
  },
  investments: {
    key: 'investments',
    name: 'Investimentos',
    percentage: 20,
    color: 'blue',
    categories: [
      TransactionCategories.EDUCATION,
      TransactionCategories.TECHNOLOGY,
      TransactionCategories.OTHER,
    ],
    examples: 'Poupança, reserva de emergência, aplicações',
  },
}

export function useAnalysisCategoriesDatabase() {
  const database = useSQLiteContext()

  async function load() {
    try {
      const result = await database.getAllAsync<AnalysisCategory & { categories: string }>(
        'SELECT * FROM analysis_categories ORDER BY id',
      )

      if (result.length > 0) {
        const loadedCategories: AnalysisCategories = {}

        result.forEach((row) => {
          loadedCategories[row.key] = {
            ...row,
            categories: JSON.parse(row.categories),
          }
        })

        return loadedCategories
      }

      return DEFAULT_CATEGORIES
    } catch (error) {
      console.error('Erro ao carregar categorias de análise:', error)
      return DEFAULT_CATEGORIES
    }
  }

  async function update(data: AnalysisCategories) {
    try {
      await database.execAsync('BEGIN TRANSACTION')

      await database.execAsync('DELETE FROM analysis_categories')

      for (const [key, category] of Object.entries(data)) {
        const statement = await database.prepareAsync(`
          INSERT INTO analysis_categories (key, name, percentage, color, categories, examples)
          VALUES ($key, $name, $percentage, $color, $categories, $examples)
        `)

        await statement.executeAsync({
          $key: key,
          $name: category.name,
          $percentage: category.percentage,
          $color: category.color,
          $categories: JSON.stringify(category.categories),
          $examples: category.examples,
        })
      }

      await database.execAsync('COMMIT')
    } catch (error) {
      await database.execAsync('ROLLBACK')
      console.error('Erro ao atualizar categorias de análise:', error)
      throw error
    }
  }

  return {
    load,
    update,
  }
}
