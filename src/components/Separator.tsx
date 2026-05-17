import { View } from 'react-native'

type Props = {
  color: string
}

export function Separator({ color }: Props) {
  return <View style={{ backgroundColor: color }} className="w-full h-[1px]" />
}
