import { Config } from "./config";
import { StepLibrary, StepType } from "./step";

enum State {
  Idle,
  Started,
  Paused,
  Stopped,
}
export class Recorder {
  private stepLib: StepLibrary;
  private config: Config;
  private state: State;
  private disableMouseOverStyle: (() => void) | undefined;

  constructor({ config }: { config: Config }) {
    this.config = config;
    this.stepLib = new StepLibrary();
    this.state = State.Idle;
  }

  public start() {
    if (this.state === State.Started) {
      throw new Error("Recorder has already started");
    }
    this.state = State.Started;

    this.registerEventListeners();
  }

  public resume() {
    if (this.state !== State.Paused) {
      throw new Error("Cannot resume a recorder not in paused state");
    }
    this.state = State.Started;

    this.registerEventListeners();
  }

  public subscribe(callback: (data: any) => void) {
    this.stepLib.subscribe(callback);
  }

  public unsubscribe(callback: () => void) {
    this.stepLib.unsubscribe(callback);
  }

  public pause() {
    if (this.state !== State.Started) return;
    this.state = State.Paused;

    this.deregisterEventListeners();
  }

  public stop() {
    this.state = State.Stopped;

    this.deregisterEventListeners();
    this.stepLib.destroy();
  }

  private registerEventListeners() {
    if (this.config.enableMouseOverStyle) {
      this.disableMouseOverStyle = this.enableMouseOverStyle();
    }

    document.addEventListener("click", this.clickHandler);
    document.addEventListener("wheel", this.scrollHandler);
    document.addEventListener("keydown", this.keydownHandler);
  }

  private deregisterEventListeners() {
    if (this.disableMouseOverStyle !== undefined) {
      this.disableMouseOverStyle();
      this.disableMouseOverStyle = undefined;
    }
    document.removeEventListener("click", this.clickHandler);
    document.removeEventListener("wheel", this.scrollHandler);
    document.removeEventListener("keydown", this.keydownHandler);
  }

  private enableMouseOverStyle() {
    const { mouseOverStyle } = this.config;
    if (mouseOverStyle === undefined) return;

    const overlayContainer = document.createElement("div");
    overlayContainer.id = "recorder-overlay-container";
    document.body.appendChild(overlayContainer);

    const shadow = overlayContainer.attachShadow({ mode: "open" });
    const overlay = document.createElement("div");
    overlay.id = "recorder-overlay";
    shadow.appendChild(overlay);

    let overlayStyle: Partial<CSSStyleDeclaration> = {
      boxSizing: "border-box",
      pointerEvents: "none",
      position: "fixed",
      zIndex: "2147483647",
    };

    const mouseOverHandler = (event: MouseEvent) => {
      const element = getBoundingElement(event);
      if (element === null) return;
      const { top, left, width, height } = element.getBoundingClientRect();
      overlayStyle = {
        ...overlayStyle,
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        height: `${height}px`,
      };
      Object.assign(overlay.style, { ...overlayStyle, ...mouseOverStyle });
    };

    const mouseOutHandler = () => {
      Object.keys({ ...overlayStyle, ...mouseOverStyle }).forEach((key) =>
        overlay.style.removeProperty(key)
      );
    };

    document.addEventListener("mouseover", mouseOverHandler);
    document.addEventListener("mouseout", mouseOutHandler);

    return function destroy() {
      document.body.removeChild(overlayContainer);
      document.removeEventListener("mouseover", mouseOverHandler);
      document.removeEventListener("mouseout", mouseOutHandler);
    };
  }

  clickHandler = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    this.stepLib.pushStep({
      type: StepType.Click,
      element: target,
      selector: getCssSelectorPath(target),
    });
  };

  scrollHandler = (event: WheelEvent) => {
    this.stepLib.pushStep({
      type: StepType.Scroll,
      scrollDelta: { x: event.deltaX, y: event.deltaY },
    });
  };

  keydownHandler = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    this.stepLib.pushStep({
      type: StepType.Keydown,
      element: target,
      selector: getCssSelectorPath(target),
      key: event.key,
    });
  };
}

function getBoundingElement(event: MouseEvent): HTMLElement | null {
  for (const target of event.composedPath()) {
    if (!(target instanceof HTMLElement)) continue;
    const rect = target.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    return target;
  }
  return null;
}

// get CSS selector of a single element
function getCssSelector(target: Element): string {
  const id = target.id ? `#${target.id}` : "";
  const selector = `${target.tagName.toLowerCase()}${id}`;
  if (id !== "") return selector;
  const href = target.getAttribute("href");
  if (href) return `${selector}[href=${href}]`;
  const parent = target.parentElement;
  if (parent === null || parent.childNodes.length === 1) {
    return selector;
  }
  const children = Array.from(parent.children);
  const idx = children.indexOf(target);
  const nth = idx === 0 ? "first-child" : `nth-child(${idx + 1})`;
  return `${selector}:${nth}`;
}

// get CSS selector path from html
function getCssSelectorPath(target: Element) {
  let path = "";
  let current: Element | null = target;
  while (current !== null && current.tagName.toLowerCase() !== "html") {
    const selector = getCssSelector(current);
    path = `${selector} > ${path}`;
    current = current.parentElement;
  }
  return path.substring(0, path.length - 3);
}
