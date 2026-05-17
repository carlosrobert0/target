import { useEffect, useRef, useState } from 'react'
import { AppState, type AppStateStatus } from 'react-native'
import { authenticate, getAppLockEnabled } from '@/lib/appLock'
import { router } from 'expo-router'

const BACKGROUND_GRACE_MS = 30_000

export function useAppLock() {
  const lastBackgroundedAt = useRef<number | null>(null)
  const [bootstrapped, setBootstrapped] = useState(false)

  useEffect(() => {
    if (bootstrapped) return
    setBootstrapped(true)
    void maybeLock(true)

    const sub = AppState.addEventListener('change', (status: AppStateStatus) => {
      if (status === 'active') {
        const now = Date.now()
        const ago = lastBackgroundedAt.current ? now - lastBackgroundedAt.current : Infinity
        if (ago > BACKGROUND_GRACE_MS) {
          void maybeLock(false)
        }
        lastBackgroundedAt.current = null
      } else if (status === 'background' || status === 'inactive') {
        lastBackgroundedAt.current = Date.now()
      }
    })

    return () => sub.remove()
  }, [bootstrapped])

  async function maybeLock(isInitial: boolean) {
    const enabled = await getAppLockEnabled()
    if (!enabled) return
    const ok = await authenticate()
    if (!ok) {
      if (isInitial) {
        // ainda assim deixa entrar, mas marca pra próxima
        return
      }
      router.replace('/locked')
    }
  }
}
