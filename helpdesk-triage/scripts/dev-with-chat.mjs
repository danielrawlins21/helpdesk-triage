import { spawn } from "node:child_process";

const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm.cmd" : "npm";

const children = [
  spawn(npmCommand, ["run", "chat:proxy"], {
    stdio: "inherit",
    shell: false,
  }),
  spawn(npmCommand, ["run", "dev"], {
    stdio: "inherit",
    shell: false,
  }),
];

let shuttingDown = false;

function stopChildren(signal = "SIGTERM") {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
}

for (const child of children) {
  child.on("exit", (code, signal) => {
    if (shuttingDown) return;

    if (code && code !== 0) {
      console.error(`Proceso dev finalizado con codigo ${code}.`);
      stopChildren();
      process.exitCode = code;
      return;
    }

    if (signal) {
      stopChildren(signal);
    }
  });
}

process.on("SIGINT", () => {
  stopChildren("SIGINT");
});

process.on("SIGTERM", () => {
  stopChildren("SIGTERM");
});
