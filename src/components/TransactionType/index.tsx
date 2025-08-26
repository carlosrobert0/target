import { TouchableOpacityProps, View } from 'react-native'
import { colors } from '@/theme/colors'
import { TransactionTypes } from '@/utils/TransactionTypes'
import { Option } from './Option'

type Props = TouchableOpacityProps & {
  selected: TransactionTypes
  onChange: (type: TransactionTypes) => void
}

export function TransactionType({ selected, onChange }: Props) {
  return (
    <View className="rounded-lg h-[42px] bg-gray-100 justify-center items-center flex-row w-full">
      <Option
        icon="arrow-upward"
        title="Guardar"
        isSelected={selected === TransactionTypes.Input}
        selectedColor={colors.blue[500]}
        onPress={() => onChange(TransactionTypes.Input)}
      />

      <Option
        icon="arrow-downward"
        title="Resgatar"
        isSelected={selected === TransactionTypes.Output}
        selectedColor={colors.red[400]}
        onPress={() => onChange(TransactionTypes.Output)}
      />
    </View>
  )
}
