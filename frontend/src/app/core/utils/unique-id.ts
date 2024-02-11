/**
 * Generates a (semi) unique ID based on the current date and a random number.
 * 
 * @returns { string } the unique id.
 */
export const uid = (): string => Date.now().toString(36) + Math.random().toString(36);