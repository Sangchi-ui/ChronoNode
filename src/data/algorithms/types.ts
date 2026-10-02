export interface AlgorithmComplexity {
  time: string;
  space: string;
  best?: string;
  average?: string;
  worst?: string;
  breakdownExplanation?: string;
}

export interface ConcreteWalkthroughStep {
  step: number;
  action: string;
  state: string;
  explanation: string;
}

export interface ConcreteWalkthrough {
  inputExample: string;
  initialState?: string;
  steps: ConcreteWalkthroughStep[];
  finalState?: string;
  summary?: string;
}

export interface AlgorithmData {
  id: string;
  name: string;
  category: string;
  complexity: AlgorithmComplexity;
  explanation: string;
  inDepthExplanation?: string;
  realWorldExample: string;
  concreteWalkthrough?: ConcreteWalkthrough;
  stepByStepLogic: string[];
  pythonCode: string;
  applications?: string[];
  edgeCases?: string[];
  advantages?: string[];
  disadvantages?: string[];
}

