import { router } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { Progress } from "@/components/Progress";
import { List } from "@/components/List";
import { Transaction, TransactionType, type TransactionProps } from "@/components/Transaction";
import { Button } from "@/components/Button";

export default function TargetDetails() {
  const transactions: TransactionProps[] = [
    {
      id: '1',
      type: TransactionType.INCOME,
      createdAt: '10/10/2023',
      description: 'Salário'
    },
    {
      id: '2',
      type: TransactionType.OUTCOME,
      createdAt: '11/10/2023',
      description: 'Conta de luz'
    },
    {
      id: '3',
      type: TransactionType.OUTCOME,
      createdAt: '12/10/2023',
      description: 'Supermercado'
    },
    {
      id: '4',
      type: TransactionType.INCOME,
      createdAt: '13/10/2023',
      description: 'Freela'
    },
    {
      id: '5',
      type: TransactionType.OUTCOME,
      createdAt: '14/10/2023',
      description: 'Transporte'
    },
    {
      id: '6',
      type: TransactionType.INCOME,
      createdAt: '15/10/2023',
      description: 'Venda de item'
    },
    {
      id: '7',
      type: TransactionType.OUTCOME,
      createdAt: '16/10/2023',
      description: 'Lazer'
    },
    {
      id: '8',
      type: TransactionType.INCOME,
      createdAt: '17/10/2023',
      description: 'Bônus'
    },
    {
      id: '9',
      type: TransactionType.OUTCOME,
      createdAt: '18/10/2023',
      description: 'Assinatura de serviço'
    },
    {
      id: '10',
      type: TransactionType.INCOME,
      createdAt: '19/10/2023',
      description: 'Renda extra'
    }
  ]

  return (
    <View className="flex-1 p-6 gap-8 pt-16">
      <View className="flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={32} color={colors.black} />
        </TouchableOpacity>
        <MaterialIcons name="mode-edit" size={24} color={colors.gray[600]} />
      </View>

      <Text className="text-2xl text-black font-bold font-inter">Apple Watch</Text>

      <Progress />

      <List
        title="Transações"
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <Transaction data={item} />}
        emptyMessage="Nenhuma transação cadastrada"
      />

      <Button
        className={"mt-auto"}
        title="Nova transação"
        onPress={() => router.push('/new-transaction')}
      />
    </View>
  );
}