import Keyv from 'keyv';

export class KeyvWithType<TValue> extends Keyv<TValue> {
  // Custom get method with type safety
  async getWithType<K extends keyof TValue>(key: K): Promise<TValue[K] | undefined> {
    const value = await this.get(key.toString());
    return value as TValue[K]; // Type assertion to ensure it matches TValue[K]
  }

  // Custom set method with type safety
  async setWithType<K extends keyof TValue>(
    key: K,
    value: TValue[K],
    ttl?: number,
  ): Promise<boolean> {
    return await this.set(key.toString(), value as TValue, ttl); // Directly pass TValue[K] which is valid
  }
}
