import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '@/theme/colors'
import { TransactionTypeEnum, typeIcons } from './Transaction'

type Props = TouchableOpacityProps & {
  type: TransactionTypeEnum
  title: string
}

const transactionTypeColors = {
  bg: {
    [TransactionTypeEnum.INCOME]: 'bg-blue-500',
    [TransactionTypeEnum.OUTCOME]: 'bg-gray-100',
  },
  text: {
    [TransactionTypeEnum.INCOME]: 'text-white',
    [TransactionTypeEnum.OUTCOME]: 'text-gray-550',
  },
  icon: {
    [TransactionTypeEnum.INCOME]: colors.white,
    [TransactionTypeEnum.OUTCOME]: colors.gray[550],
  },
}

export function TransactionType({ type, title, ...rest }: Props) {
  return (
    <>
      <TouchableOpacity
        className={`${transactionTypeColors.bg[type]} rounded-lg h-[42px] justify-center items-center w-[50%] flex-row gap-2`}>
        <Feather
          name={typeIcons[type] as keyof typeof Feather.glyphMap}
          size={24}
          color={transactionTypeColors.icon[type]}
        />
        <Text className={`${transactionTypeColors.text[type]} font-inter font-medium`}>
          {title}
        </Text>
      </TouchableOpacity>
    </>
  )
}
