// Redis removed — not required for local development
// All functionality works without it

export async function connectRedis(): Promise<void> {
  console.log('ℹ️  Redis disabled — running without cache');
}

export function getRedis() {
  return null;
}
