import { mkdir, writeFile } from "node:fs/promises";

const devtoolsPort = process.argv[2] ?? "9222";
const previewPort = process.argv[3] ?? "3000";
const previewHost = process.argv[4] ?? "localhost";
const outputDirectory = process.argv[5] ?? "/private/tmp/free-navigation-validation";
const previewUrl = `http://${previewHost}:${previewPort}`;
const targets = await fetch(`http://127.0.0.1:${devtoolsPort}/json/list`).then(
  (response) => response.json(),
);
const target = targets.find(
  (candidate) => candidate.type === "page"
    && new URL(candidate.url).port === previewPort,
);

if (!target) {
  throw new Error(`No exhibition preview page was found at ${previewUrl}.`);
}

await mkdir(outputDirectory, { recursive: true });

const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
let nextId = 1;

function call(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = nextId;
    nextId += 1;
    pending.set(id, { reject, resolve });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

function evaluate(expression) {
  return call("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  }).then((message) => message.result.result.value);
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function capture(name) {
  const response = await call("Page.captureScreenshot", {
    captureBeyondViewport: false,
    format: "png",
    fromSurface: true,
  });
  await writeFile(`${outputDirectory}/${name}.png`, response.result.data, "base64");
}

async function mouse(type, x, y, buttons) {
  await call("Input.dispatchMouseEvent", {
    button: "left",
    buttons,
    clickCount: 1,
    type,
    x,
    y,
  });
}

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);

  if (message.id && pending.has(message.id)) {
    const promise = pending.get(message.id);
    pending.delete(message.id);

    if (message.error) {
      promise.reject(new Error(message.error.message));
    } else {
      promise.resolve(message);
    }
  }
});

socket.addEventListener("open", async () => {
  try {
    await call("Runtime.enable");
    await call("Page.enable");
    await call("Emulation.setDeviceMetricsOverride", {
      deviceScaleFactor: 1,
      height: 1000,
      mobile: false,
      width: 1440,
    });
    await call("Page.navigate", { url: previewUrl });
    await delay(2_000);
    await capture("00-before-drag");

    await mouse("mousePressed", 760, 500, 1);
    await mouse("mouseMoved", 420, 500, 1);
    await mouse("mouseReleased", 420, 500, 0);
    await delay(300);
    await capture("01-after-drag");

    await call("Page.navigate", { url: previewUrl });
    await delay(2_000);
    await evaluate(`(() => {
      const checkbox = document.querySelector(".motion-toggle input");
      if (checkbox && !checkbox.checked) checkbox.click();
    })()`);

    await mouse("mousePressed", 760, 720, 1);
    await mouse("mouseReleased", 760, 720, 0);
    await delay(500);

    const location = await evaluate(
      'document.querySelector(".location-card strong")?.textContent',
    );

    if (!location || location === "Giriş eşiği" || location === "Hareket ediliyor…") {
      throw new Error(`Floor click did not reach a new navigation node: ${location}`);
    }

    await capture("02-after-floor-click");

    await call("Page.navigate", { url: previewUrl });
    await delay(2_000);
    await call("Input.dispatchKeyEvent", {
      key: "ArrowLeft",
      type: "keyDown",
      windowsVirtualKeyCode: 37,
    });
    await call("Input.dispatchKeyEvent", {
      key: "ArrowLeft",
      type: "keyUp",
      windowsVirtualKeyCode: 37,
    });
    await capture("03-after-arrow-key");

    await call("Emulation.setDeviceMetricsOverride", {
      deviceScaleFactor: 2,
      height: 844,
      mobile: true,
      width: 390,
    });
    await call("Emulation.setTouchEmulationEnabled", { enabled: true });
    await call("Page.navigate", { url: previewUrl });
    await delay(2_000);
    await call("Input.dispatchTouchEvent", {
      touchPoints: [{ id: 1, x: 300, y: 360 }],
      type: "touchStart",
    });
    await call("Input.dispatchTouchEvent", {
      touchPoints: [{ id: 1, x: 120, y: 360 }],
      type: "touchMove",
    });
    await call("Input.dispatchTouchEvent", {
      touchPoints: [],
      type: "touchEnd",
    });
    await delay(300);

    const touchLocation = await evaluate(
      'document.querySelector(".location-card strong")?.textContent',
    );

    if (touchLocation !== "Giriş eşiği") {
      throw new Error(`Touch drag unexpectedly triggered navigation: ${touchLocation}`);
    }

    await capture("04-after-touch-drag");
    process.stdout.write(
      `Mouse, keyboard, touch, and floor-click navigation passed; arrived at ${location}.\n`,
    );
  } catch (error) {
    process.stderr.write(`${error.stack ?? error}\n`);
    process.exitCode = 1;
  } finally {
    socket.close();
  }
});
