import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

/**
 * Upload stream to S3
 * @param stream {ReadStream}
 * @param key {string}
 * @returns {Promise<string>}
 */
async function upload(stream, key) {
  const uploader = new Upload({
    client: new S3Client({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
      },
    }),
    params: {
      Bucket: process.env.S3_VIDEO_RECORD_BUCKET_NAME,
      Key: key,
      ContentType: 'video/webm',
      Body: stream,
    },
    leavePartsOnError: false,
  });

  let data = await uploader.done();
  return `https://videos.allright.com/video/${data.Key}`;
}

export default { upload };
