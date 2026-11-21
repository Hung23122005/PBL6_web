import { useEffect, useState } from 'react'
import { readHistory, subscribeHistory } from '../services/history'
export function useHistory() {
  const [items, setItems] = useState(readHistory)
  useEffect(() => subscribeHistory(() => setItems(readHistory())), [])
  return items
}
