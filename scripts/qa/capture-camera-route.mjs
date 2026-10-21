import { mkdir, writeFile } from "node:fs/promises";

const devtoolsPort = process.argv[2] ?? "9222";
const previewPort = process.argv[3] ?? "3000";
const outputDirectory = process.argv[4] ?? "/private/tmp/camera-route-validation";
const captureMotion = process.argv.includes("--animated");
const hostArgument = process.argv.find((argument) => argument.startsWith("--host="));
const previewHost = hostArgument?.slice("--host=".length) || "localhost";
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
let nextId = 1;
const pending = new Map();

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
  }).then((message) => {
    if (message.result.exceptionDetails) {
      throw new Error(message.result.exceptionDetails.text);
    }

    return message.result.result.value;
  });
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForLocation(expectedLabel, timeout = 6_000) {
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    const label = await evaluate(
      'document.querySelector(".location-card strong")?.textContent',
    );

    if (label === expectedLabel) {
      return;
    }

    await delay(100);
  }

  throw new Error(`Timed out waiting for location: ${expectedLabel}`);
}

async function clickDestination(shortLabel) {
  const rect = await evaluate(`(() => {
    const button = [...document.querySelectorAll(".destination-button")]
      .find((candidate) => candidate.querySelector("span")?.textContent === ${JSON.stringify(shortLabel)});
    return button?.getBoundingClientRect().toJSON() ?? null;
  })()`);

  if (!rect) {
    throw new Error(`Destination button was not found: ${shortLabel}`);
  }

  const x = rect.x + rect.width / 2;
  const y = rect.y + rect.height / 2;

  await call("Input.dispatchMouseEvent", {
    button: "left",
    buttons: 1,
    clickCount: 1,
    type: "mousePressed",
    x,
    y,
  });
  await call("Input.dispatchMouseEvent", {
    button: "left",
    buttons: 0,
    clickCount: 1,
    type: "mouseReleased",
    x,
    y,
  });
}

async function capture(name) {
  const response = await call("Page.captureScreenshot", {
    captureBeyondViewport: false,
    format: "png",
    fromSurface: true,
  });
  await writeFile(`${outputDirectory}/${name}.png`, response.result.data, "base64");
}

async function enableReducedMotion() {
  await evaluate(`(() => {
    const checkbox = document.querySelector(".motion-toggle input");

    if (checkbox && !checkbox.checked) {
      checkbox.click();
    }
  })()`);
}

const route = [
  ["passage", "Koridor", "Giriş koridoru"],
  ["gallery-entry", "Ana galeri", "Ana galeri açılışı", true],
  ["west-bay", "Batı bölümü", "Batı sergi bölümü", true],
  ["west-turn", "Duvar arkası", "Çapraz duvarın arkası"],
  ["center-from-west", "Merkez bölüm", "Merkez sergi bölümü"],
  ["upper-from-center", "Üst rota", "Üst sergi rotası"],
  ["gallery-from-upper", "Ana galeri", "Ana galeri açılışı"],
  ["upper-from-gallery", "Üst rota", "Üst sergi rotası"],
  ["center-from-upper", "Merkez bölüm", "Merkez sergi bölümü"],
  ["east-turn", "Doğu geçişi", "Doğu geçişi"],
  ["rear-gallery", "Arka galeri", "Arka galeri"],
  ["corridor-entry", "Koridor girişi", "Uzun koridor girişi"],
  ["corridor-mid", "Koridor ortası", "Uzun koridor"],
  ["round-reveal", "Dairesel oda", "Dairesel oda eşiği"],
  ["round-center", "Oda merkezi", "Dairesel oda merkezi"],
  ["round-west", "Batı görünümü", "Dairesel oda batı görünümü"],
  ["round-back-from-west", "Arka görünüm", "Dairesel oda arka görünümü"],
  ["round-east-from-back", "Doğu görünümü", "Dairesel oda doğu görünümü"],
  ["round-center-from-east", "Oda merkezi", "Dairesel oda merkezi"],
  ["round-back-from-center", "Arka görünüm", "Dairesel oda arka görünümü"],
  ["round-center-from-back", "Oda merkezi", "Dairesel oda merkezi"],
];

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
  const timeout = setTimeout(() => {
    process.stderr.write("Route capture timed out.\n");
    process.exitCode = 1;
    socket.close();
  }, 90_000);

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
    await waitForLocation("Giriş eşiği", 10_000);
    await delay(1_000);
    await capture("00-entrance");

    if (!captureMotion) {
      await enableReducedMotion();
    }

    let index = 1;

    for (const [name, shortLabel, locationLabel, captureTransition] of route) {
      await clickDestination(shortLabel);

      if (captureMotion && captureTransition) {
        let frame = 0;

        while (frame < 20) {
          await delay(150);
          const label = await evaluate(
            'document.querySelector(".location-card strong")?.textContent',
          );

          if (label === locationLabel) {
            break;
          }

          frame += 1;
          await capture(
            `${String(index).padStart(2, "0")}-${name}-transition-${String(frame).padStart(2, "0")}`,
          );
        }
      }

      await waitForLocation(locationLabel);
      await delay(150);
      await capture(`${String(index).padStart(2, "0")}-${name}`);
      index += 1;
    }

    process.stdout.write(`Captured ${index} route positions in ${outputDirectory}.\n`);
  } catch (error) {
    process.stderr.write(`${error.stack ?? error}\n`);
    process.exitCode = 1;
  } finally {
    clearTimeout(timeout);
    socket.close();
  }
});
