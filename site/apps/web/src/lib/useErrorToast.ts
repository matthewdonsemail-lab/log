import { useEffect } from 'react'
import { toast } from '@listeningkit/ui'
import { errorText } from '@/lib/controlApi'

export function useErrorToast(failed: boolean, error: unknown, title?: string) {
  useEffect(() => {
    if (!failed) return
    if (title) toast.error(title, error ? errorText(error) : undefined)
    else toast.error(errorText(error))
  }, [failed, error, title])
}
