export enum StepType {
  Click,
  Keydown,
  Scroll,
}

type Delta = {
  x: number;
  y: number;
};

export type Step = ClickStep | KeydownStep | ScrollStep;

type ClickStep = {
  type: StepType.Click;
  element: HTMLElement;
  selector: string;
};

type KeydownStep = {
  type: StepType.Keydown;
  element: HTMLElement;
  selector: string;
  key: string;
};

type ScrollStep = {
  type: StepType.Scroll;
  scrollDelta: Delta;
};

type ListenerType = (data: Step) => void;

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
