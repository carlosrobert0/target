import { useState } from 'react'
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { colors } from '@/theme/colors'

type Props = {
  uri: string | null
  onChange: (uri: string | null) => void
  label?: string
}

export function ReceiptPicker({ uri, onChange, label = 'Comprovante' }: Props) {
  const [working, setWorking] = useState(false)

  async function ensurePermission() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Habilite o acesso a fotos nas configurações do sistema.',
      )
      return false
    }
    return true
  }

  async function pickFromLibrary() {
    if (!(await ensurePermission())) return
    setWorking(true)
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      })
      if (!result.canceled && result.assets[0]) {
        const saved = await persistToAppDir(result.assets[0].uri)
        onChange(saved)
      }
    } finally {
      setWorking(false)
    }
  }

  async function pickFromCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Habilite o acesso à câmera.')
      return
    }
    setWorking(true)
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
      })
      if (!result.canceled && result.assets[0]) {
        const saved = await persistToAppDir(result.assets[0].uri)
        onChange(saved)
      }
    } finally {
      setWorking(false)
    }
  }

  async function persistToAppDir(sourceUri: string) {
    const ext = sourceUri.split('.').pop()?.toLowerCase() ?? 'jpg'
    const destDir = `${FileSystem.documentDirectory}receipts/`
    const dirInfo = await FileSystem.getInfoAsync(destDir)
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(destDir, { intermediates: true })
    }
    const dest = `${destDir}${Date.now()}.${ext}`
    await FileSystem.copyAsync({ from: sourceUri, to: dest })
    return dest
  }

  return (
    <View className="gap-2">
      <Text className="font-inter text-sm text-gray-600">{label}</Text>

      {uri ? (
        <View className="bg-gray-100 rounded-xl p-2 flex-row items-center gap-3">
          <Image source={{ uri }} className="w-16 h-16 rounded-lg" resizeMode="cover" />
          <View className="flex-1">
            <Text className="font-inter text-sm text-black">Comprovante anexado</Text>
            <Text className="font-inter text-xs text-gray-500" numberOfLines={1}>
              {uri.split('/').pop()}
            </Text>
          </View>
          <TouchableOpacity onPress={() => onChange(null)}>
            <Feather name="x" size={20} color={colors.red[400]} />
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-row gap-2">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-2 bg-gray-100 rounded-lg py-3"
            onPress={pickFromLibrary}
            disabled={working}>
            <Feather name="image" size={16} color={colors.gray[600]} />
            <Text className="font-inter text-sm text-gray-600">Da galeria</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-2 bg-gray-100 rounded-lg py-3"
            onPress={pickFromCamera}
            disabled={working}>
            <Feather name="camera" size={16} color={colors.gray[600]} />
            <Text className="font-inter text-sm text-gray-600">Câmera</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}
