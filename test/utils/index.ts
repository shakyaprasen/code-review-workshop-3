export function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const TEST_TIMEOUT_LIMIT = 1000;
