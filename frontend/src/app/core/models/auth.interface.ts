/**
 * Information required for a new user to sign up
 */
export interface SignUpInfo {
  first_name: string,
  last_name: string,
  email_address: string,
  password: string
}

/**
 * Information required for a user to sign in
 */
export interface SignInInfo {
  username: string,
  password: string,
}

/**
 * Information given on successful authentication requests
 */
export interface SuccessfulUserAuth {
  access_token: string,
  refresh_token: string,
  token_type: string
}
