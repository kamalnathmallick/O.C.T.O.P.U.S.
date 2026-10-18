const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const projectRoot = process.cwd();
const lockPath = path.join(projectRoot, ".next", "dev", "lock");

function run(cmd) {
  return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString();
}

try {
  if (!fs.existsSync(lockPath)) {
    process.exit(0);
  }

  let lockContent = "";
  try {
    lockContent = fs.readFileSync(lockPath, "utf8");
  } catch {
    // Lock may be held by another Next process. We still continue with PID discovery.
  }

  const pidMatch = lockContent.match(/pid["']?\s*[:=]\s*(\d+)/i) || lockContent.match(/\b(\d{2,})\b/);
  let pid = pidMatch ? Number(pidMatch[1]) : null;

  if (!pid) {
    const escapedRoot = projectRoot.replace(/\\/g, "\\\\");
    const ps = [
      "$procs = Get-CimInstance Win32_Process | Where-Object {",
      "  $_.Name -match 'node(.exe)?' -and",
      "  $_.CommandLine -match 'next\\\\s+dev' -and",
      `  $_.CommandLine -match '${escapedRoot}'`,
      "};",
      "if ($procs) { $procs | Select-Object -ExpandProperty ProcessId }",
    ].join(" ");

    const out = run(`powershell -NoProfile -Command "${ps}"`).trim();
    const firstPid = out.split(/\s+/).find(Boolean);
    pid = firstPid ? Number(firstPid) : null;
  }

  if (pid && !Number.isNaN(pid)) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
      console.log(`Stopped existing Next dev process PID ${pid}.`);
    } catch {
      // Ignore taskkill failures; next dev will report if conflict remains.
    }
  }

  try {
    fs.unlinkSync(lockPath);
  } catch {
    // If lock is still held by a live process, next dev will recreate/check it.
  }
} catch {
  // Never fail developer startup because of cleanup helper issues.
}
