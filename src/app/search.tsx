import { useState } from 'react'
import {
  FlatList,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'

import { PageHeader } from '@/components/PageHeader'
import { TagPicker } from '@/components/TagPicker'
import { useSearchTransactions, type SearchFilters } from '@/hooks/services/transactions/useSearchTransactions'
import { TransactionCategories } from '@/utils/TransactionCategories'
import { numberToCurrency } from '@/utils/numberToCurrency'
import { colors } from '@/theme/colors'

const categoryOptions = Object.values(TransactionCategories)

export default function Search() {
  const [text, setText] = useState('')
  const [category, setCategory] = useState<string | undefined>()
  const [type, setType] = useState<SearchFilters['type']>('all')
  const [tagIds, setTagIds] = useState<number[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const filters: SearchFilters = { text, category, type, tagIds }
  const { data, isLoading } = useSearchTransactions(filters)

  return (
    <SafeAreaView className="flex-1 px-6 bg-background dark:bg-gray-900" edges={['top']}>
      <StatusBar barStyle="dark-content" translucent />
      <PageHeader title="Buscar" subtitle="Encontre qualquer transação registrada." />

      <View className="mt-6 gap-3">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 gap-2">
          <Feather name="search" size={18} color={colors.gray[500]} />
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Descrição ou meta..."
            placeholderTextColor={colors.gray[400]}
            className="flex-1 py-3 font-inter text-sm"
          />
          <TouchableOpacity onPress={() => setShowFilters((s) => !s)}>
            <Feather
              name="sliders"
              size={18}
              color={showFilters ? colors.blue[500] : colors.gray[500]}
            />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <ScrollView className="max-h-72">
            <View className="gap-3 pb-3">
              <View>
                <Text className="font-inter text-sm text-gray-600 mb-1">Tipo</Text>
                <View className="flex-row gap-2">
                  {(['all', 'income', 'expense'] as const).map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setType(t)}
                      className={`flex-1 py-2 rounded-lg items-center ${
                        type === t ? 'bg-blue-500' : 'bg-gray-100'
                      }`}>
                      <Text
                        className={`font-inter text-xs ${
                          type === t ? 'text-white' : 'text-gray-600'
                        }`}>
                        {t === 'all' ? 'Todos' : t === 'income' ? 'Entradas' : 'Saídas'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text className="font-inter text-sm text-gray-600 mb-1">Categoria</Text>
                <View className="flex-row flex-wrap gap-2">
                  <TouchableOpacity
                    onPress={() => setCategory(undefined)}
                    className={`px-3 py-1.5 rounded-full ${
                      !category ? 'bg-blue-500' : 'bg-gray-100'
                    }`}>
                    <Text
                      className={`font-inter text-xs ${
                        !category ? 'text-white' : 'text-gray-600'
                      }`}>
                      Todas
                    </Text>
                  </TouchableOpacity>
                  {categoryOptions.map((c) => (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setCategory(c)}
                      className={`px-3 py-1.5 rounded-full ${
                        category === c ? 'bg-blue-500' : 'bg-gray-100'
                      }`}>
                      <Text
                        className={`font-inter text-xs ${
                          category === c ? 'text-white' : 'text-gray-600'
                        }`}>
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TagPicker selectedIds={tagIds} onChange={setTagIds} />
            </View>
          </ScrollView>
        )}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingVertical: 16, gap: 8 }}
        ListEmptyComponent={
          <Text className="font-inter text-gray-500 text-center mt-12">
            {isLoading ? 'Buscando...' : 'Nenhuma transação encontrada.'}
          </Text>
        }
        renderItem={({ item }) => (
          <View className="bg-gray-100 rounded-lg p-3 flex-row items-center justify-between">
            <View className="flex-1 pr-2">
              <Text className="font-inter font-medium text-sm text-black" numberOfLines={1}>
                {item.target_name}
              </Text>
              {item.observation && (
                <Text className="font-inter text-xs text-gray-500" numberOfLines={1}>
                  {item.observation}
                </Text>
              )}
              <Text className="font-inter text-xs text-gray-400 mt-0.5">
                {new Date(item.occurred_at).toLocaleDateString('pt-BR')}
                {item.category ? ` · ${item.category}` : ''}
              </Text>
            </View>
            <Text
              className={`font-inter font-bold text-sm ${
                item.amount < 0 ? 'text-red-500' : 'text-green-600'
              }`}>
              {numberToCurrency(item.amount)}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  )
}
