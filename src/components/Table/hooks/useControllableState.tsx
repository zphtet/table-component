import { useState } from 'react'

export const useControllableState = <V,>(
  value: V,
  onChange?: (value: V) => void,
) => {
  const [inner, setInner] = useState(value)
  const isControlled = typeof onChange ==='function'
  const current = isControlled ? value : inner

  const setValue = (next: V) => {
    if (!isControlled) setInner(next)
    onChange?.(next)
  }

  return [current, setValue] as const
}
