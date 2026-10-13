export function readRuntimeErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error.trim()) return error;
  if (error && typeof error === 'object') {
    const record = error as { errMsg?: unknown; message?: unknown };
    if (typeof record.errMsg === 'string' && record.errMsg.trim()) return record.errMsg;
    if (typeof record.message === 'string' && record.message.trim()) return record.message;
  }
  return '';
}

export function toRuntimeError(error: unknown) {
  if (error instanceof Error) return error;
  const message = readRuntimeErrorMessage(error);
  return new Error(message || 'UNKNOWN_RUNTIME_ERROR');
}

export function readableWechatError(error: unknown) {
  const message = readRuntimeErrorMessage(error);
  if (/url not in domain list|\u4e0d\u5728\u4ee5\u4e0b request \u5408\u6cd5\u57df\u540d|\u5408\u6cd5\u57df\u540d/iu.test(message)) {
    return '\u5c0f\u7a0b\u5e8f\u8fd8\u6ca1\u5141\u8bb8\u8bbf\u95ee\u767b\u5f55\u670d\u52a1\u5668\u3002\u8bf7\u5230\u5fae\u4fe1\u516c\u4f17\u5e73\u53f0\u628a\u63a5\u53e3\u57df\u540d\u52a0\u56de request \u5408\u6cd5\u57df\u540d\u3002';
  }
  if (/\u914d\u7f6e|APP_SECRET|40013|40125/u.test(message)) return '\u5fae\u4fe1\u767b\u5f55\u914d\u7f6e\u6682\u65f6\u4e0d\u53ef\u7528\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5\u3002';
  if (/40029|40163|\u51ed\u8bc1\u5df2\u5931\u6548|\u767b\u5f55\u51ed\u8bc1/u.test(message)) return '\u672c\u6b21\u6388\u6743\u5df2\u8fc7\u671f\uff0c\u8bf7\u91cd\u65b0\u8fde\u63a5\u5fae\u4fe1\u3002';
  if (/timeout|NETWORK_TIMEOUT|network|request:fail/iu.test(message)) {
    return '\u7f51\u7edc\u8fde\u63a5\u4e0d\u7a33\u5b9a\uff0c\u8bf7\u68c0\u67e5\u7f51\u7edc\u540e\u91cd\u65b0\u8fde\u63a5\u3002';
  }
  return '\u6682\u65f6\u6ca1\u6709\u8fde\u63a5\u6210\u529f\uff0c\u8bf7\u7a0d\u540e\u91cd\u65b0\u8fde\u63a5\u3002';
}
