export interface SignUpInfo {
  first_name: string,
  last_name: string,
  email_address: string,
  password: string
}

export interface SignInInfo {
  email_address: string,
  password: string,
}

export interface SuccessfulUserAuth {
  access_token: string,
  refresh_token: string,
  token_type: string
}
