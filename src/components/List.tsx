import { View, Text, FlatList, type FlatListProps, type StyleProp, type ViewStyle } from "react-native";
import { Separator } from "./Separator";
import { colors } from "@/theme/colors";

type Props<T> = FlatListProps<T> & {
  title: string;
  emptyMessage?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export function List<T>(
  {
    title,
    emptyMessage,
    containerStyle,
    data,
    renderItem,
    ...rest
  }: Props<T>
) {
  return (
    <View className="gap-4 max-h-[400px] overflow-auto" style={containerStyle}>
      <Text className="font-inter font-medium text-base text-black pb-4 border-b border-gray-200">{title}</Text>

      <FlatList
        data={data}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <Separator color={colors.gray[200]} />}
        contentContainerStyle={{ paddingBottom: 72, gap: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="text-center text-gray-500">
            {emptyMessage}
          </Text>
        }
        {...rest}
      />
    </View>
  )
}