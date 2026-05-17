import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '@/theme/colors'
import { useListWallets } from '@/hooks/services/wallets/useListWallets'

type Props = {
  selectedId: number | null
  onChange: (id: number) => void
  label?: string
}

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-500', text: 'text-white' },
  green: { bg: 'bg-green-500', text: 'text-white' },
  red: { bg: 'bg-red-400', text: 'text-white' },
  yellow: { bg: 'bg-yellow-500', text: 'text-white' },
}

export function WalletPicker({ selectedId, onChange, label = 'Carteira' }: Props) {
  const { data: wallets } = useListWallets()

  return (
    <View className="gap-2">
      <Text className="font-inter text-sm text-gray-600">{label}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {wallets?.map((wallet) => {
          const selected = wallet.id === selectedId
          const palette = COLOR_MAP[wallet.color] ?? COLOR_MAP.blue
          return (
            <TouchableOpacity
              key={wallet.id}
              onPress={() => onChange(wallet.id)}
              className={`flex-row items-center gap-2 px-4 py-2 rounded-xl ${
                selected ? palette.bg : 'bg-gray-100'
              }`}>
              <Feather
                name={(wallet.icon as any) ?? 'credit-card'}
                size={16}
                color={selected ? 'white' : colors.gray[600]}
              />
              <Text
                className={`font-inter text-sm ${selected ? palette.text : 'text-gray-600'}`}>
                {wallet.name}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}
