import { View, Text, TouchableOpacity, ScrollView, Modal, SafeAreaView } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { Button } from '@/components/Button'
import { TransactionCategories } from '@/utils/TransactionCategories'
import { AnalysisCategories } from '@/database/useAnalysisCategoriesDatabase'

interface CategoriesModalProps {
  visible: boolean
  editingGroup: string | null
  categories: AnalysisCategories | null
  onClose: () => void
  onToggleCategory: (category: TransactionCategories) => void
  isCategorySelected: (category: TransactionCategories, groupKey: string) => boolean
  isCategoryUsedElsewhere: (category: TransactionCategories, currentGroup: string) => boolean
}

export function CategoriesModal({
  visible,
  editingGroup,
  categories,
  onClose,
  onToggleCategory,
  isCategorySelected,
  isCategoryUsedElsewhere,
}: CategoriesModalProps) {
  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row justify-between items-center p-6 bg-white border-b border-gray-200">
          <Text className="text-xl font-bold text-gray-800">
            Editar Categorias -{' '}
            {editingGroup &&
              categories &&
              categories[editingGroup as keyof typeof categories]?.name}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-6">
          <Text className="text-base text-gray-600 mb-6 leading-6">
            Selecione as categorias que pertencem a este grupo. Cada categoria pode pertencer a
            apenas um grupo.
          </Text>

          {Object.values(TransactionCategories).map((category) => {
            const isSelected = editingGroup ? isCategorySelected(category, editingGroup) : false
            const isUsedElsewhere = editingGroup
              ? isCategoryUsedElsewhere(category, editingGroup)
              : false

            return (
              <TouchableOpacity
                key={category}
                onPress={() => editingGroup && onToggleCategory(category)}
                className={`flex-row items-center p-4 mb-3 rounded-xl  border 
                  ${isSelected
                    ? 'bg-blue-50 border-blue-200'
                    : isUsedElsewhere
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : 'bg-white border-gray-200'
                  }`}
                disabled={isUsedElsewhere && !isSelected}>
                <View
                  className={`w-6 h-6 rounded border-2 mr-4 items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                    }`}>
                  {isSelected && <Feather name="check" size={14} color="white" />}
                </View>

                <View className="flex-1">
                  <Text
                    className={`font-medium ${isSelected
                        ? 'text-blue-700'
                        : isUsedElsewhere
                          ? 'text-gray-500'
                          : 'text-gray-800'
                      }`}>
                    {category}
                  </Text>
                  {isUsedElsewhere && !isSelected && (
                    <Text className="text-xs text-gray-500 mt-1">Usada em outro grupo</Text>
                  )}
                </View>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        <View className="p-6 bg-white border-t border-gray-200">
          <Button title="Confirmar Seleção" onPress={onClose} />
        </View>
      </SafeAreaView>
    </Modal>
  )
}
