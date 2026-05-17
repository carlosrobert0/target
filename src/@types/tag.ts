export type Tag = {
  id: number
  name: string
  color: string
  created_at: string
}

export type TagCreate = {
  name: string
  color?: string
}
