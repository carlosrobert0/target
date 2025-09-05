export interface CategoryData {
  category: string
  total: number
  percentage: number
}

export interface CategoryGroup {
  name: string
  percentage: number
  categories: string[]
  color: string
}

export interface RecommendationData {
  percentage: number
  recommendedValue: number
  actualValue: number
}
