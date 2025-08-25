import { View, TouchableOpacity } from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { router } from "expo-router";

export function PageHeader() {
  return (
    <View className="flex-row justify-between items-center w-full">
      <TouchableOpacity onPress={() => router.back()}>
        <Feather name="arrow-left" size={32} color={colors.black} />
      </TouchableOpacity>
      <MaterialIcons name="mode-edit" size={24} color={colors.gray[600]} />
    </View>
  )
}