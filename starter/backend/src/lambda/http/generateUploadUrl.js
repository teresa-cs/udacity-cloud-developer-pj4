// export async function handler(event) {
//   const todoId = event.pathParameters.todoId;

//   if (!todoId) {
//     return {
//       statusCode: 400,
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Credentials': true
//       },
//       body: JSON.stringify({ message: 'todoId is required' }),
//     };
//   }

//   const params = {
//     Bucket: process.env.S3_BUCKET,
//     Key: `${todoId}.png`,
//     Expires: parseInt(process.env.SIGNED_URL_EXPIRATION),
//     ContentType: 'image/png',
//   };

//   try {
//     const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
//     return {
//       statusCode: 200,
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Credentials': true
//       },
//       body: JSON.stringify({ uploadUrl }),
//     };
//   } catch (error) {
//     console.error(error);
//     return {
//       statusCode: 500,
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Credentials': true
//       },
//       body: JSON.stringify({ message: 'Could not generate upload URL' }),
//     };
//   }
// }


import 'source-map-support/register'
import AWS from 'aws-sdk'
import AWSXRay from 'aws-xray-sdk'
import middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger.mjs'
import { TodoAccess } from '../../dataLayer/todoAccess.mjs'
import { getUserId } from '../utils.mjs'

const XAWS = AWSXRay.captureAWS(AWS)
const bucketName = process.env.S3_BUCKET
const urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION)
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const todoAccess = new TodoAccess()
const logger = createLogger('generateUploadUrl')

export const handler = middy(async (event) => {
  const todoId = event.pathParameters.todoId

  logger.info('Generating upload URL:', {
    todoId
  })

  const userId = getUserId(event)

  const uploadUrl = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })
  
  logger.info('Generated upload URL:', {
    todoId,
    uploadUrl
  })

  await todoAccess.saveImgUrl(userId, todoId, bucketName)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl: uploadUrl
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)
