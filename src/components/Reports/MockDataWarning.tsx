import { View, Text } from 'react-native'

interface MockDataWarningProps {
  hasRealData: boolean
}

export function MockDataWarning({ hasRealData }: MockDataWarningProps) {
  if (hasRealData) return null

  return (
    <View className="mt-6 p-4 bg-blue-50 rounded-xl shadow">
      <Text className="text-blue-800 text-sm text-center">
        📊 Estes são dados de exemplo. {'\n'}
        Adicione transações com categorias para ver seus dados reais.
      </Text>
    </View>
  )
}
