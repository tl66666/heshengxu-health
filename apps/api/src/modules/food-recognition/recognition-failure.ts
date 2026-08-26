export const FOOD_RECOGNITION_FAILURE_CODE = 'recognition_failed' as const;
export const FOOD_RECOGNITION_FAILURE_MESSAGE = '暂时无法完成识别，请重试或改用食物目录记录';

export function safeRecognitionFailure(_error: unknown) {
  return {
    code: FOOD_RECOGNITION_FAILURE_CODE,
    message: FOOD_RECOGNITION_FAILURE_MESSAGE,
  };
}
