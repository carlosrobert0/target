import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSQLiteContext } from 'expo-sqlite'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import { Alert } from 'react-native'
import { parseCSV, type ParsedRow } from '@/lib/export/csv'

export function useImportCSV() {
  const database = useSQLiteContext()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const picked = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values'],
        copyToCacheDirectory: true,
      })
      if (picked.canceled) return { inserted: 0, invalid: 0 }

      const uri = picked.assets[0].uri
      const text = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.UTF8,
      })
      const { valid, invalid } = parseCSV(text)

      if (valid.length === 0) {
        return { inserted: 0, invalid: invalid.length }
      }

      const targetIdByName = new Map<string, number>()
      const allTargets = await database.getAllAsync<{ id: number; name: string }>(
        `SELECT id, name FROM targets`,
      )
      for (const t of allTargets) targetIdByName.set(t.name, t.id)

      await database.execAsync('BEGIN TRANSACTION')
      let inserted = 0
      try {
        const insert = await database.prepareAsync(`
          INSERT INTO transactions
            (target_id, amount, observation, category, occurred_at)
          VALUES
            ($target_id, $amount, $observation, $category, $occurred_at)
        `)

        for (const row of valid) {
          const targetId = resolveTargetId(row, targetIdByName)
          if (!targetId) continue
          await insert.executeAsync({
            $target_id: targetId,
            $amount: row.amount,
            $observation: row.observation ?? null,
            $category: row.category ?? null,
            $occurred_at: row.date,
          })
          inserted++
        }

        await database.execAsync('COMMIT')
      } catch (error) {
        await database.execAsync('ROLLBACK')
        throw error
      }

      queryClient.invalidateQueries({ queryKey: ['targets'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })

      return { inserted, invalid: invalid.length }
    },
    onSuccess: ({ inserted, invalid }) => {
      Alert.alert(
        'Importação concluída',
        `${inserted} transação(ões) importada(s).${invalid > 0 ? `\n${invalid} linha(s) ignorada(s).` : ''}`,
      )
    },
    onError: (error) => {
      Alert.alert('Erro', 'Não foi possível importar o arquivo.')
      console.log(error)
    },
  })
}

function resolveTargetId(row: ParsedRow, map: Map<string, number>): number | null {
  if (row.target_id && Array.from(map.values()).includes(row.target_id)) {
    return row.target_id
  }
  if (row.target_name) {
    const id = map.get(row.target_name)
    if (id) return id
  }
  return map.values().next().value ?? null
}
