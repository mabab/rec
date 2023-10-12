import Redis from "ioredis";

/**
 * @class RedisAdapterStorage
 */
class RedisAdapterStorage {
  static instance = null;
  #redis = null;

  /**
   * @constructor
   */
  constructor() {
    this.#redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
      db: 0,
    });
  }

  /**
   * Method to get instance of RedisAdapterStorage
   * @static
   * @method getInstance
   * @returns {RedisAdapterStorage}
   */
  static getInstance() {
    if (!this.instance) {
      this.instance = new RedisAdapterStorage();
    }
    return this.instance;
  }

  /**
   * Redis method lpop - get and remove first element from list
   *
   * @param key {string}  - key of list
   * @param timeout {number} - timeout in seconds
   * @returns {*}
   */
  async blpop(key, timeout = 100) {
    return (await this.#redis.blpop(key, timeout))?.[1];
  }

  async sismember(key, value) {
    return this.#redis.sismember(key, value);
  }

  async sadd(key, value) {
    return this.#redis.sadd(key, value);
  }

  async srem(key, value) {
    return this.#redis.srem(key, value);
  }

  async quit() {
    await this.#redis.quit();
  }
}

export default RedisAdapterStorage.getInstance();
