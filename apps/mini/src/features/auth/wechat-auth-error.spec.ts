import { describe, expect, it } from 'vitest';
import { readableWechatError, readRuntimeErrorMessage, toRuntimeError } from './wechat-auth-error.js';

describe('WeChat authorization errors', () => {
  it('reads errMsg from uni-app failure objects', () => {
    expect(
      readRuntimeErrorMessage({ errMsg: 'request:fail url not in domain list' }),
    ).toBe('request:fail url not in domain list');
    expect(toRuntimeError({ errMsg: 'login:fail' }).message).toBe('login:fail');
  });

  it('explains a missing request domain instead of a generic retry', () => {
    expect(readableWechatError({ errMsg: 'request:fail url not in domain list' })).toContain(
      '\u5408\u6cd5\u57df\u540d',
    );
  });

  it('does not treat a missing JSON code field as an expired WeChat code', () => {
    expect(
      readableWechatError(new Error("Cannot read properties of undefined (reading 'code')")),
    ).toBe('\u6682\u65f6\u6ca1\u6709\u8fde\u63a5\u6210\u529f\uff0c\u8bf7\u7a0d\u540e\u91cd\u65b0\u8fde\u63a5\u3002');
  });
});
