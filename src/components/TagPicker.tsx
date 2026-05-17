import { useState } from 'react'
import { Text, TouchableOpacity, View, TextInput } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '@/theme/colors'
import { useListTags } from '@/hooks/services/tags/useListTags'
import { useCreateTag } from '@/hooks/services/tags/useCreateTag'

type Props = {
  selectedIds: number[]
  onChange: (ids: number[]) => void
  label?: string
}

export function TagPicker({ selectedIds, onChange, label = 'Tags' }: Props) {
  const { data: tags } = useListTags()
  const { mutate: createTag } = useCreateTag()
  const [newTagName, setNewTagName] = useState('')

  function toggle(id: number) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  function handleCreate() {
    const name = newTagName.trim()
    if (!name) return
    createTag(
      { name },
      {
        onSuccess: (newId) => {
          setNewTagName('')
          onChange([...selectedIds, newId])
        },
      },
    )
  }

  return (
    <View className="gap-2">
      <Text className="font-inter text-sm text-gray-600">{label}</Text>

      <View className="flex-row flex-wrap gap-2">
        {tags?.map((tag) => {
          const selected = selectedIds.includes(tag.id)
          return (
            <TouchableOpacity
              key={tag.id}
              onPress={() => toggle(tag.id)}
              className={`px-3 py-1.5 rounded-full flex-row items-center gap-1 ${
                selected ? 'bg-blue-500' : 'bg-gray-100'
              }`}>
              {selected && <Feather name="check" size={12} color={colors.white} />}
              <Text
                className={`font-inter text-xs ${selected ? 'text-white' : 'text-gray-600'}`}>
                {tag.name}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      <View className="flex-row gap-2 items-center mt-2">
        <TextInput
          value={newTagName}
          onChangeText={setNewTagName}
          placeholder="Nova tag"
          placeholderTextColor={colors.gray[400]}
          className="flex-1 bg-gray-100 rounded-lg px-3 py-2 font-inter text-sm"
          onSubmitEditing={handleCreate}
          returnKeyType="done"
        />
        <TouchableOpacity
          className="bg-blue-500 rounded-lg w-9 h-9 items-center justify-center"
          onPress={handleCreate}>
          <Feather name="plus" size={18} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  )
}
