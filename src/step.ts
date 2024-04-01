export enum StepType {
  Click,
  Input,
  Scroll,
}

type Delta = {
  x: number;
  y: number;
};

type ListenerType = (data: Step) => void;

export type Step = {
  type: StepType;
  element?: HTMLElement;
  selector?: string;
  scrollDelta?: Delta;
  inputData?: string;
};

export class StepLibrary {
  private steps: Step[];
  private listeners: ListenerType[];

  constructor() {
    this.steps = [];
    this.listeners = [];
  }

  public pushStep(step: Step) {
    this.steps.push(step);
    this.emitData(step);
  }

  public subscribe(listener: ListenerType) {
    this.listeners.push(listener);
  }

  public unsubscribe(listener: ListenerType) {
    this.listeners = this.listeners.filter((item) => item !== listener);
  }

  public destroy() {
    this.steps = [];
    this.listeners = [];
  }

  private emitData(data: Step) {
    this.listeners.forEach((listener) => listener(data));
  }
}
