import { RiskClassifierService } from './risk-classifier.service.js';

export class OutputValidatorService {
  private readonly classifier = new RiskClassifierService();

  isSafe(output: string): boolean {
    return this.classifier.classify(output).decision === 'allow';
  }
}
