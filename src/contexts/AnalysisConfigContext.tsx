import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import {
  useAnalysisCategoriesDatabase,
  type AnalysisCategories,
} from '@/database/useAnalysisCategoriesDatabase'
import { TransactionCategories } from '@/utils/TransactionCategories'

interface AnalysisConfigContextType {
  categories: AnalysisCategories | null
  isLoading: boolean
  updateCategoryField: (key: string, field: string, value: string | number) => Promise<void>
  saveConfigurations: () => Promise<void>
  toggleCategory: (category: TransactionCategories) => Promise<void>
  isCategorySelected: (category: TransactionCategories, groupKey: string) => boolean
  isCategoryUsedElsewhere: (category: TransactionCategories, currentGroup: string) => boolean
  editingGroup: string | null
  setEditingGroup: (group: string | null) => void
  isConfigModalVisible: boolean
  setIsConfigModalVisible: (visible: boolean) => void
  isCategoriesModalVisible: boolean
  setIsCategoriesModalVisible: (visible: boolean) => void
}

const AnalysisConfigContext = createContext<AnalysisConfigContextType | undefined>(undefined)

export function useAnalysisConfig() {
  const context = useContext(AnalysisConfigContext)
  if (context === undefined) {
    throw new Error('useAnalysisConfig must be used within an AnalysisConfigProvider')
  }
  return context
}

interface AnalysisConfigProviderProps {
  children: ReactNode
}

export function AnalysisConfigProvider({ children }: AnalysisConfigProviderProps) {
  const { load, update } = useAnalysisCategoriesDatabase()
  const [categories, setCategories] = useState<AnalysisCategories | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [isConfigModalVisible, setIsConfigModalVisible] = useState(false)
  const [isCategoriesModalVisible, setIsCategoriesModalVisible] = useState(false)

  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true)
      const loadedCategories = await load()
      setCategories(loadedCategories)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    } finally {
      setIsLoading(false)
    }
  }, [load])

  useEffect(() => {
    loadCategories()
  }, [])

  const updateCategoryField = async (key: string, field: string, value: string | number) => {
    try {
      if (!categories) return
      const updatedCategories = { ...categories }
      updatedCategories[key] = { ...updatedCategories[key], [field]: value }
      await update(updatedCategories)
      setCategories(updatedCategories)
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error)
      throw error
    }
  }

  const saveConfigurations = async () => {
    try {
      if (!categories) return
      let totalPercentage =
        categories.essentials.percentage +
        categories.wants.percentage +
        categories.investments.percentage

      if (totalPercentage !== 100) {
        throw new Error('A soma das porcentagens deve ser igual a 100%.')
      }

      await update(categories)
      setIsConfigModalVisible(false)
      alert('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert(error instanceof Error ? error.message : 'Não foi possível salvar as configurações.')
      throw error
    }
  }

  const toggleCategory = async (category: TransactionCategories) => {
    try {
      if (!editingGroup || !categories) return

      const newCategories = { ...categories }

      Object.keys(newCategories).forEach((key) => {
        if (key !== editingGroup) {
          newCategories[key as keyof typeof newCategories].categories = newCategories[
            key as keyof typeof newCategories
          ].categories.filter((cat) => cat !== category)
        }
      })

      const currentGroup = newCategories[editingGroup as keyof typeof newCategories]
      const hasCategory = currentGroup.categories.includes(category)

      if (hasCategory) {
        currentGroup.categories = currentGroup.categories.filter((cat) => cat !== category)
      } else {
        currentGroup.categories = [...currentGroup.categories, category]
      }

      await update(newCategories)
      setCategories(newCategories)
    } catch (error) {
      console.error('Erro ao salvar categorias:', error)
      throw error
    }
  }

  const isCategorySelected = (category: TransactionCategories, groupKey: string) => {
    if (!categories) return false
    return categories[groupKey as keyof typeof categories].categories.includes(category)
  }

  const isCategoryUsedElsewhere = (category: TransactionCategories, currentGroup: string) => {
    if (!categories) return false
    return Object.entries(categories).some(
      ([key, group]) => key !== currentGroup && group.categories.includes(category),
    )
  }

  const value: AnalysisConfigContextType = {
    categories,
    isLoading,
    updateCategoryField,
    saveConfigurations,
    toggleCategory,
    isCategorySelected,
    isCategoryUsedElsewhere,
    editingGroup,
    setEditingGroup,
    isConfigModalVisible,
    setIsConfigModalVisible,
    isCategoriesModalVisible,
    setIsCategoriesModalVisible,
  }

  return <AnalysisConfigContext.Provider value={value}>{children}</AnalysisConfigContext.Provider>
}
