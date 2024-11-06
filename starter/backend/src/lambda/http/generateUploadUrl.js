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


require('source-map-support/register');
const middy = require('middy');
const { cors } = require('middy/middlewares');

module.exports.handler = middy(async (event) => {
  try {
    // Dynamically import utilities and dependencies
    const AWS = (await import('aws-sdk')).default;
    const AWSXRay = (await import('aws-xray-sdk')).default;
    const { createLogger } = await import('../../utils/logger.mjs');
    const { TodoAccess } = await import('../../dataLayer/todoAccess.mjs');
    const { getUserId } = await import('../utils.mjs');

    // Initialize AWS SDK with X-Ray tracing
    const XAWS = AWSXRay.captureAWS(AWS);
    const bucketName = process.env.S3_BUCKET;
    const urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION);
    const s3 = new XAWS.S3({
      signatureVersion: 'v4'
    });

    // Set up logger and data access layer
    const logger = createLogger('generateUploadUrl');
    const todoAccess = new TodoAccess();

    // Retrieve todoId from path parameters
    const todoId = event.pathParameters.todoId;
    logger.info('Generating upload URL:', { todoId });

    // Extract userId and generate signed URL
    const userId = getUserId(event);
    const uploadUrl = s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: todoId,
      Expires: urlExpiration
    });

    logger.info('Generated upload URL:', { todoId, uploadUrl });

    // Save the image URL to the data layer
    await todoAccess.saveImgUrl(userId, todoId, bucketName);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ uploadUrl })
    };
  } catch (error) {
    const { createLogger } = await import('../../utils/logger.mjs');
    const logger = createLogger('generateUploadUrl');
    logger.error('Error generating upload URL', { error: error.message, stack: error.stack });

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to generate upload URL.' })
    };
  }
});

module.exports.handler.use(
  cors({
    credentials: true
  })
);

