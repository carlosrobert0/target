import { View, Text, TouchableOpacity, ScrollView, Modal, SafeAreaView } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { AnalysisCategories } from '@/database/useAnalysisCategoriesDatabase'

interface ConfigurationModalProps {
  visible: boolean
  categories: AnalysisCategories | null
  onClose: () => void
  onUpdateCategory: (key: string, field: string, value: string | number) => void
  onSave: () => void
  onOpenCategoriesModal: (groupKey: string) => void
}

export function ConfigurationModal({
  visible,
  categories,
  onClose,
  onUpdateCategory,
  onSave,
  onOpenCategoriesModal,
}: ConfigurationModalProps) {
  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row justify-between items-center p-6 bg-white border-b border-gray-200">
          <Text className="text-xl font-bold text-gray-800">Análise Financeira</Text>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-6">
          <Text className="text-base text-gray-600 mb-6 leading-6">
            Personalize as categorias, porcentagens e descrições conforme suas necessidades.
          </Text>

          {categories &&
            Object.entries(categories).map(([key, category]) => (
              <View
                key={key}
                className="bg-white p-5 rounded-xl mb-4 shadow-sm border border-gray-100">
                <View className="mb-4">
                  <Input
                    label="Nome da Categoria"
                    value={category.name}
                    onChangeText={(value) => onUpdateCategory(key, 'name', value)}
                    className="text-base font-medium text-gray-800 border border-gray-300 rounded-lg px-4 py-3"
                    placeholder="Nome da categoria"
                  />
                </View>

                <View className="mb-4">
                  <View className="flex-row items-end">
                    <Input
                      label="Porcentagem Recomendada"
                      value={category.percentage.toString()}
                      onChangeText={(value) => {
                        const numValue = parseInt(value) || 0
                        onUpdateCategory(key, 'percentage', Math.min(100, Math.max(0, numValue)))
                      }}
                      keyboardType="numeric"
                      className="flex-1 text-base border border-gray-300 rounded-lg px-4 py-3 mr-3"
                      placeholder="0"
                    />
                    <Text className="text-lg font-semibold text-gray-600">%</Text>
                  </View>
                </View>

                <View>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm font-medium text-gray-700">Categorias Incluídas</Text>
                    <TouchableOpacity
                      onPress={() => onOpenCategoriesModal(key)}
                      className="flex-row items-center bg-blue-50 px-3 py-1 rounded-lg">
                      <Feather name="settings" size={14} color="#3B82F6" />
                      <Text className="text-xs text-blue-600 ml-1 font-medium">
                        Editar Categorias
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 min-h-[60px]">
                    <Text className="text-sm text-gray-700 leading-5">
                      {category.categories.length > 0
                        ? category.categories.join(', ')
                        : 'Nenhuma categoria selecionada'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
        </ScrollView>

        <View className="p-6 bg-white border-t border-gray-200">
          <Button title="Salvar Personalização" onPress={onSave} />
        </View>
      </SafeAreaView>
    </Modal>
  )
}
