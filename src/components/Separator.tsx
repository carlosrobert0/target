import { View } from 'react-native'

type Props = {
  color: string
}

export function Separator({ color }: Props) {
  return <View className={`bg-[${color}] w-full h-[1px]`} />
}
