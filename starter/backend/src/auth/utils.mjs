import { decode } from 'jsonwebtoken'
/**
 * Parse a JWT token and return a user id
 * @param {string} jwtToken - JWT token to parse
 * @returns {string | undefined} - a user id from the JWT token, or undefined if parsing fails
 */
export function parseUserId(jwtToken) {
  try {
    const decodedJwt = decode(jwtToken);
    return decodedJwt?.sub; // Safely access `sub` in case `decode` returns null or undefined
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return undefined; // Return undefined if parsing fails
  }
}
