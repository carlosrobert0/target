import { useState } from 'react'
import { StatusBar, Text, TouchableOpacity, View, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'

import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/Button'
import { useExportCSV } from '@/hooks/services/export/useExportCSV'
import { useExportPDF } from '@/hooks/services/export/useExportPDF'
import { useImportCSV } from '@/hooks/services/export/useImportCSV'
import { colors } from '@/theme/colors'

const MONTH_LABELS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
]

export default function Export() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const { mutate: exportCSV, isPending: csvPending } = useExportCSV()
  const { mutate: exportPDF, isPending: pdfPending } = useExportPDF()
  const { mutate: importCSV, isPending: importPending } = useImportCSV()

  function handleCsv() {
    const start = new Date(year, month, 1).toISOString()
    const end = new Date(year, month + 1, 1).toISOString()
    exportCSV({ fromDate: start, toDate: end })
  }

  return (
    <SafeAreaView className="flex-1 px-6 bg-background dark:bg-gray-900" edges={['top']}>
      <StatusBar barStyle="dark-content" translucent />
      <PageHeader title="Exportar e importar" subtitle="Leve seus dados pra onde quiser." />

      <ScrollView className="mt-6" contentContainerStyle={{ gap: 24, paddingBottom: 32 }}>
        <View className="gap-2">
          <Text className="font-inter text-sm text-gray-600">Período</Text>
          <View className="flex-row gap-2 items-center">
            <TouchableOpacity onPress={() => setYear((y) => y - 1)}>
              <Feather name="chevron-left" size={20} color={colors.gray[600]} />
            </TouchableOpacity>
            <Text className="font-inter font-bold text-base text-black">{year}</Text>
            <TouchableOpacity onPress={() => setYear((y) => y + 1)}>
              <Feather name="chevron-right" size={20} color={colors.gray[600]} />
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap gap-2 mt-2">
            {MONTH_LABELS.map((label, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setMonth(idx)}
                className={`px-3 py-2 rounded-lg ${month === idx ? 'bg-blue-500' : 'bg-gray-100'}`}>
                <Text
                  className={`font-inter text-xs ${
                    month === idx ? 'text-white' : 'text-gray-600'
                  }`}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="gap-3">
          <Text className="font-inter font-bold text-base text-black">Exportar</Text>
          <Button title="Exportar CSV do período" onPress={handleCsv} isProcessing={csvPending} />
          <Button
            title="Relatório PDF do mês"
            onPress={() => exportPDF({ year, month })}
            isProcessing={pdfPending}
          />
        </View>

        <View className="gap-3">
          <Text className="font-inter font-bold text-base text-black">Importar</Text>
          <Text className="font-inter text-xs text-gray-500">
            Formato CSV com cabeçalho: id, data, meta_id, meta, valor, categoria, descricao.
            Valores negativos = gastos.
          </Text>
          <Button
            title="Selecionar arquivo CSV"
            onPress={() => importCSV()}
            isProcessing={importPending}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
