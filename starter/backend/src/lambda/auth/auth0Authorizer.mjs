import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'
import jwksClient from 'jwks-rsa'


const logger = createLogger('auth')

// const jwksUrl = 'https://test-endpoint.auth0.com/.well-known/jwks.json'

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')
  
  const token = getToken(authHeader)
  const decodedToken = jsonwebtoken.decode(token, { complete: true })

  if (!decodedToken) throw new Error('Invalid token')

  const client = jwksClient({
    jwksUri: 'https://dev-pj4-cloud-developer.us.auth0.com/.well-known/jwks.json' 
  })

  const getSigningKey = (kid) => 
    new Promise((resolve, reject) => {
      client.getSigningKey(kid, (err, key) => {
        if (err) reject(err)
        const signingKey = key.getPublicKey()
        resolve(signingKey)
      })
    })

  const signingKey = await getSigningKey(decodedToken.header.kid)

  // Verify the token using the signing key
  return jsonwebtoken.verify(token, signingKey, {
    algorithms: ['RS256'],
    issuer: 'https://dev-pj4-cloud-developer.us.auth0.com/',
    audience: 'https://dev-pj4-cloud-developer.us.auth0.com/api/v2/'
  })
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
