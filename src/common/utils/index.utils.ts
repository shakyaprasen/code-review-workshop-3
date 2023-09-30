export function formattedLog(log: {
  type: 'debug' | 'info' | 'error';
  context: string;
  requestId?: string;
  message: string;
}) {
  return `${new Date().toUTCString()} [${log.type}] [${log.requestId ?? ''}] [${
    log.context
  }] ${log.message}`;
}
