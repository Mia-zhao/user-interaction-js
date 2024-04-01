# user-interaction-js

A lightweight JavaScript library for capturing and recording user interactions like clicks, scrolls, and inputs on web pages.

## Example

```
import { Recorder } from "user-interaction-js";

/* configure mouse over style for the elements when enableMouseOverStyle is set to true */
const recorder = new Recorder({
  config: {
    enableMouseOverStyle: true,
    mouseOverStyle: { border: "dashed red", boxSizing: "border-box" },
  },
});

const logData = (data) => console.log(data);
recorder.subscribe(logData);
recorder.start();
...
recorder.stop();
```

The mouse over style specified above will look like this when recorder script is running
![](/assets/demo.gif)