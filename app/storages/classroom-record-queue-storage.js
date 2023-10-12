import redisStore from "./../services/redis-store.js";

const REDIS_RECORD_QUEUE_KEY =
  process.env.REDIS_RECORD_QUEUE_KEY || "classroom-record-queue";
const REDIS_RECORD_QUEUE_KEY_PROCESSING = `${REDIS_RECORD_QUEUE_KEY}-processing`;

async function unshift() {
  const rawElement = await redisStore.blpop(REDIS_RECORD_QUEUE_KEY);
  if (
    !rawElement || (await redisStore.sismember(REDIS_RECORD_QUEUE_KEY_PROCESSING, rawElement))
  ) {
    return null;
  }

  await redisStore.sadd(REDIS_RECORD_QUEUE_KEY_PROCESSING, rawElement);
  return JSON.parse(rawElement);
}

async function deleteFromProcessing(element) {
  await redisStore.srem(REDIS_RECORD_QUEUE_KEY_PROCESSING, JSON.stringify(element));
}

export default { unshift, deleteFromProcessing };
