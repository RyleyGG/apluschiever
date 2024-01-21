export interface User {
  id: string,
  first_name: string,
  last_name: string,
  email_address: string
}

export interface UserFilters {
  ids: string[],
  emails: string[],
}
