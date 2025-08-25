import { PageHeader } from "@/components/PageHeader";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { TransactionType } from "@/components/TransactionType";
import { TransactionTypeEnum } from "@/components/Transaction";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { CurrencyInput } from "@/components/CurrencyInput";

export default function NewTransaction() {
  return (
    <View className="flex-1 p-6 gap-8 pt-16">
      <PageHeader />

      <View>
        <Text className="text-2xl text-black font-bold font-inter">Nova transação</Text>

        <Text className="text-sm text-gray-600 font-inter">
          A cada valor guardado você fica mais próximo da sua meta. Se esforce para guardar e evitar retirar.
        </Text>
      </View>

      <View className="flex-row bg-gray-100">
        <TransactionType
          type={TransactionTypeEnum.INCOME}
          title="Guardar"
        />
        <TransactionType
          type={TransactionTypeEnum.OUTCOME}
          title="Resgatar"
        />
      </View>

      <CurrencyInput
        placeholder="50,00"
      />

      <Input
        placeholder="Ex: Investir em CDB de 110% no banco XPTO"
      />

      <Button
        title="Salvar"
        className="mx-0"
      />
    </View>
  );
}