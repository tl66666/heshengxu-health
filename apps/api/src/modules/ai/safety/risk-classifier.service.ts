export type SafetyDecision =
  | { decision: 'allow' }
  | {
      decision: 'block';
      reason: 'acute_symptom' | 'self_harm' | 'medication_or_diagnosis';
    };

export class RiskClassifierService {
  classify(message: string): SafetyDecision {
    if (/(胸痛|呼吸困难|昏迷|中风|大出血)/u.test(message)) {
      return { decision: 'block', reason: 'acute_symptom' };
    }
    if (/(自杀|自残|不想活|伤害自己)/u.test(message)) {
      return { decision: 'block', reason: 'self_harm' };
    }
    if (/(处方|剂量|停药|诊断|开什么药|增加剂量)/u.test(message)) {
      return { decision: 'block', reason: 'medication_or_diagnosis' };
    }
    return { decision: 'allow' };
  }
}
