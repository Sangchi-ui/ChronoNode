export interface AlgorithmData {
  id: string;
  name: string;
  category: string;
  complexity: {
    time: string;
    space: string;
  };
  explanation: string;
  realWorldExample: string;
  stepByStepLogic: string[];
  pythonCode: string;
}
