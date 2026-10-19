const devtoolsPort = process.argv[2] ?? "9222";
const targets = await fetch(`http://127.0.0.1:${devtoolsPort}/json/list`).then(
  (response) => response.json(),
);
const target = targets.find(
  (candidate) => candidate.type === "page" && candidate.url.startsWith("http://127.0.0.1:3000"),
);

if (!target) {
  throw new Error("No exhibition preview page was found.");
}

const socket = new WebSocket(target.webSocketDebuggerUrl);
let nextId = 1;
const pending = new Map();

function call(method, params = {}) {
  return new Promise((resolve) => {
    const id = nextId;
    nextId += 1;
    pending.set(id, resolve);
    socket.send(JSON.stringify({ id, method, params }));
  });
}

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);

  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
  }

  if (message.method === "Runtime.exceptionThrown" || message.method === "Log.entryAdded") {
    process.stdout.write(`${JSON.stringify(message)}\n`);
  }
});

socket.addEventListener("open", async () => {
  await call("Runtime.enable");
  await call("Log.enable");
  await call("Page.enable");
  await call("Page.reload", { ignoreCache: true });
  await new Promise((resolve) => setTimeout(resolve, 4_000));

  const result = await call("Runtime.evaluate", {
    expression: `(() => {
      const canvas = document.querySelector("canvas");
      const gl = canvas?.getContext("webgl2") || canvas?.getContext("webgl");
      return {
        title: document.title,
        canvas: canvas ? {
          width: canvas.width,
          height: canvas.height,
          rect: canvas.getBoundingClientRect().toJSON(),
          computed: {
            display: getComputedStyle(canvas).display,
            width: getComputedStyle(canvas).width,
            height: getComputedStyle(canvas).height,
          },
          parentRect: canvas.parentElement?.getBoundingClientRect().toJSON(),
          parentHtml: canvas.parentElement?.outerHTML.slice(0, 600),
        } : null,
        webgl: gl ? {
          version: gl.getParameter(gl.VERSION),
          renderer: gl.getParameter(gl.RENDERER),
          error: gl.getError(),
        } : null,
        resources: performance.getEntriesByType("resource")
          .map((entry) => entry.name)
          .filter((name) => name.includes("gallery.")),
        bodyText: document.body.innerText.slice(0, 500),
      };
    })()`,
    returnByValue: true,
  });

  process.stdout.write(`${JSON.stringify(result.result.result.value, null, 2)}\n`);
  socket.close();
});

setTimeout(() => socket.close(), 12_000);
