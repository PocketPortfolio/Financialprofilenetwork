const buckets = new Map<string, { count: number; resetAt: number }>();

export function resetBuckets() { 
  buckets.clear(); 
}

export function take(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const item = buckets.get(key);
  if (!item || now > item.resetAt) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }
  if (item.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: item.resetAt };
  }
  item.count += 1;
  return { allowed: true, remaining: limit - item.count, resetAt: item.resetAt };
}







