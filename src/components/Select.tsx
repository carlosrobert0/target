import React, { useState } from 'react'
import { Modal, TouchableOpacity, FlatList, View, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '@/theme/colors'

interface SelectOption {
  label: string
  value: string
  icon?: string
}

interface SelectProps {
  label?: string
  placeholder?: string
  value?: string
  options: SelectOption[]
  onValueChange: (value: string) => void
  disabled?: boolean
}

export function Select({
  label,
  placeholder = 'Selecione uma opção',
  value,
  options,
  onValueChange,
  disabled = false,
}: SelectProps) {
  const [isVisible, setIsVisible] = useState(false)

  const selectedOption = options.find((option) => option.value === value)

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue)
    setIsVisible(false)
  }

  return (
    <>
      <TouchableOpacity
        className="bg-background flex-row justify-between items-center rounded-lg p-4 mt-2 border border-gray-300 shadow-sm"
        onPress={() => !disabled && setIsVisible(true)}
        disabled={disabled}
        activeOpacity={0.7}>
        <Text
          className={`text-base font-normal bg-background ${selectedOption ? 'text-black' : 'text-gray-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Feather name="chevron-down" size={20} color={colors.gray[500]} />
      </TouchableOpacity>

      <Modal visible={isVisible} animationType="slide">
        <View className="flex-1 bg-gray-100">
          <View className="w-full bg-blue-500 items-center justify-end">
            <Text className="text-lg text-white font-medium p-4">
              {label || 'Selecionar Categoria'}
            </Text>
          </View>

          <FlatList
            data={options}
            className="flex-1 w-full"
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                className={`w-full p-4 flex-row items-center 
                  ${value === item.value ? 'bg-blue-100' : 'bg-white'}`}
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: colors.gray[200],
                }}
                onPress={() => handleSelect(item.value)}>
                {item.icon && (
                  <Feather
                    name={item.icon as any}
                    size={20}
                    color={value === item.value ? colors.blue[500] : colors.gray[500]}
                    style={{ marginRight: 16 }}
                  />
                )}
                <Text
                  className={`text-base ${value === item.value ? 'text-blue-500 font-semibold' : 'text-gray-600 font-normal'}`}>
                  {item.label}
                </Text>
                {value === item.value && (
                  <Feather
                    name="check"
                    size={20}
                    color={colors.blue[500]}
                    style={{ marginLeft: 'auto' }}
                  />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </>
  )
}
