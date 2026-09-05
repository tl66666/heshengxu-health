/**
 * 本机用户外观资料：头像与昵称。
 * 与健康档案（heshengxu.local.health-profile）分开存储：
 * 健康档案来自建档流程，这里只存"我的"页面里用户主动修改的外观信息。
 */

import { userStorageKey } from '../auth/user-storage.js';

const KEY = 'heban.user-profile.v1';

export type LocalUserProfile = {
  displayName?: string;
  avatarPath?: string;
};

export function loadUserProfile(): LocalUserProfile {
  try {
    const value = uni.getStorageSync(userStorageKey(KEY)) as LocalUserProfile | null;
    if (!value) return {};
    return {
      displayName: typeof value.displayName === 'string' ? value.displayName : '',
      avatarPath: typeof value.avatarPath === 'string' ? value.avatarPath : '',
    };
  } catch {
    return {};
  }
}

export function saveUserProfile(patch: Partial<LocalUserProfile>) {
  const next = { ...loadUserProfile(), ...patch };
  uni.setStorageSync(userStorageKey(KEY), next);
  return next;
}

/**
 * 选择一张图片并持久化到本机（微信临时文件会过期，saveFile 后跨会话可用）。
 * 失败时退回临时路径，保证当次会话仍能生效。
 */
export function pickAndSaveAvatar(): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: ({ tempFilePaths }) => {
        const tempPath = tempFilePaths?.[0];
        if (!tempPath) {
          reject(new Error('未选择图片'));
          return;
        }
        try {
          uni.getFileSystemManager().saveFile({
            tempFilePath: tempPath,
            success: ({ savedFilePath }) => resolve(savedFilePath),
            fail: () => resolve(tempPath),
          });
        } catch {
          resolve(tempPath);
        }
      },
      fail: () => reject(new Error('未选择图片')),
    });
  });
}
