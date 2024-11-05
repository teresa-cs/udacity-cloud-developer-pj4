import { parseUserId } from '../auth/utils.mjs';
import { createLogger } from '../utils/logger.mjs';

const logger = createLogger('utils.mjs');

/**
 * Get a user id from an API Gateway event
 * @param {Object} event - an event from API Gateway
 *
 * @returns {string | undefined} - a user id from a JWT token or undefined if token extraction fails
 */
export function getUserId(event) {
  try {
    const authorization = event.headers.Authorization;
    logger.info('Authorization header:', authorization);

    if (!authorization) {
      logger.error('Authorization header is missing');
      return undefined;
    }

    const split = authorization.split(' ');
    const jwtToken = split[1];
    logger.info('JWT token:', jwtToken);

    const userId = parseUserId(jwtToken);
    logger.info('Parsed user id:', userId); // Log the result of parseUserId

    return userId;
  } catch (error) {
    logger.error('FAILED TO GET TOKEN', error);
    return undefined;
  }
}

