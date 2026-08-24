(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.HebanProfileUtils = factory();
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  function calculateBmi(heightCm, weightKg) {
    if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return 0;
    return Math.round((weightKg / Math.pow(heightCm / 100, 2)) * 10) / 10;
  }

  function classifyBmi(bmi) {
    if (bmi < 18.5) return { label: "偏瘦", tone: "low" };
    if (bmi < 24) return { label: "正常", tone: "normal" };
    if (bmi < 28) return { label: "超重", tone: "high" };
    return { label: "肥胖", tone: "very-high" };
  }

  function shouldLockApp(profile) {
    return !profile;
  }

  return { calculateBmi, classifyBmi, shouldLockApp };
});
