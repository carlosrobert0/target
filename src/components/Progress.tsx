import { View, Text } from 'react-native'

type SaveValue = {
  current: string
  target: string
  percentage: string
}

type Props = {
  data: SaveValue
}

export function Progress({ data }: Props) {
  return (
    <View>
      <View className="flex-row items-center w-full justify-between">
        <View>
          <Text className="text-gray-600 font-medium font-inter text-xs">Valor guardado</Text>
          <Text className="text-lg text-black font-medium font-inter">
            {data.current}
            <Text className="text-gray-600 font-medium font-inter text-sm"> de {data.target}</Text>
          </Text>
        </View>
        <Text className="text-blue-500 font-bold font-inter text-sm">{data.percentage}</Text>
      </View>
      <View className="my-4">
        <View
          className={`h-1 bg-blue-500 z-50 rounded-full rounded-r-none`}
          style={{ width: `${data.percentage}` }}
        />
        <View className="h-1 bg-gray-300 -mt-1 rounded-full" />
      </View>
    </View>
  )
}
