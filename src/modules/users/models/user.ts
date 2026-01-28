export type User = {
  id: string
  name: string
  email: string
  password: string
  role: 'admin' | 'customer'
  phone?: string | null
  location?: string | null
  birth_date?: string | null
}
