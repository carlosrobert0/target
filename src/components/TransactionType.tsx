import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '@/theme/colors'
import { typeIcons } from './Transaction'
import { TransactionTypes } from '@/utils/TransactionTypes'

type Props = TouchableOpacityProps & {
  type: TransactionTypes
  title: string
}

const transactionTypeColors = {
  bg: {
    [TransactionTypes.Input]: 'bg-blue-500',
    [TransactionTypes.Output]: 'bg-gray-100',
  },
  text: {
    [TransactionTypes.Input]: 'text-white',
    [TransactionTypes.Output]: 'text-gray-550',
  },
  icon: {
    [TransactionTypes.Input]: colors.white,
    [TransactionTypes.Output]: colors.gray[550],
  },
}

export function TransactionType({ type, title, ...rest }: Props) {
  return (
    <TouchableOpacity
      className={`${transactionTypeColors.bg[type]} rounded-lg h-[42px] justify-center items-center w-[50%] flex-row gap-2`}
      {...rest}>
      <Feather
        name={typeIcons[type] as keyof typeof Feather.glyphMap}
        size={24}
        color={transactionTypeColors.icon[type]}
      />
      <Text className={`${transactionTypeColors.text[type]} font-inter font-medium`}>{title}</Text>
    </TouchableOpacity>
  )
}
