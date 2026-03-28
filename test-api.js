#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import https from "node:https";

function loadClaudeEnvironmentVariables(projectDir = process.cwd()) {
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  if (!homeDir) {
    return null;
  }
  const candidates = [
    path.join(projectDir, ".claude", "settings.local.json"),
    path.join(projectDir, ".claude", "settings.json"),
    path.join(homeDir, ".claude", "settings.json"),
  ];
  for (const filePath of candidates) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      const config = JSON.parse(content);
      if (config.env && typeof config.env === "object") {
        const env = {};
        if (typeof config.env.ANTHROPIC_BASE_URL === "string") {
          env.ANTHROPIC_BASE_URL = config.env.ANTHROPIC_BASE_URL;
        }
        if (typeof config.env.ANTHROPIC_AUTH_TOKEN === "string") {
          env.ANTHROPIC_AUTH_TOKEN = config.env.ANTHROPIC_AUTH_TOKEN;
        }
        if (env.ANTHROPIC_BASE_URL !== void 0 && env.ANTHROPIC_AUTH_TOKEN !== void 0) {
          return env;
        }
      }
    } catch (err) {
      try {
        if (fs.existsSync(filePath)) {
          console.error(`Warning: Failed to read ${filePath}: ${err.message}`);
        }
      } catch {}
    }
  }
  return null;
}

const claudeEnvironment = loadClaudeEnvironmentVariables();
const glmBaseUrl = process.env.ANTHROPIC_BASE_URL || claudeEnvironment?.ANTHROPIC_BASE_URL || "";
const glmAuthToken = process.env.ANTHROPIC_AUTH_TOKEN || claudeEnvironment?.ANTHROPIC_AUTH_TOKEN || "";

console.log("🔍 Testing GLM API Response\n");
console.log(`Base URL: ${glmBaseUrl}`);
console.log(`Token: ${glmAuthToken ? glmAuthToken.substring(0, 20) + "..." : "NOT FOUND"}\n`);

if (!glmBaseUrl || !glmAuthToken) {
  console.error("❌ Error: ANTHROPIC_BASE_URL or ANTHROPIC_AUTH_TOKEN not found in environment or config files");
  process.exit(1);
}

const url = new URL(glmBaseUrl);
const quotaLimitUrl = `${url.protocol}//${url.host}/api/monitor/usage/quota/limit`;

console.log(`Fetching from: ${quotaLimitUrl}\n`);

https.get({
  hostname: url.host,
  port: 443,
  path: "/api/monitor/usage/quota/limit",
  method: "GET",
  headers: {
    Authorization: glmAuthToken,
    "Accept-Language": "en-US,en",
    "Content-Type": "application/json",
  },
}, (res) => {
  let responseData = "";
  res.on("data", (chunk) => {
    responseData += chunk;
  });
  res.on("end", () => {
    console.log(`Status Code: ${res.statusCode}\n`);

    if (res.statusCode !== 200) {
      console.error(`❌ HTTP Error: ${res.statusCode}`);
      console.error(responseData);
      return;
    }

    try {
      const parsed = JSON.parse(responseData);
      console.log("✅ Success! Full API Response:\n");
      console.log(JSON.stringify(parsed, null, 2));

      if (parsed.success && parsed.data?.limits) {
        console.log("\n📊 Limits Found:\n");
        for (const limit of parsed.data.limits) {
          console.log(`  Type: ${limit.type}`);
          console.log(`  Percentage: ${limit.percentage}%`);
          console.log(`  Limit: ${limit.limit}`);
          console.log(`  Used: ${limit.used}`);
          if (limit.nextResetTime) {
            console.log(`  Next Reset: ${new Date(limit.nextResetTime).toLocaleString()}`);
          }
          console.log("");
        }

        const weeklyLimit = parsed.data.limits.find(l => l.type === "WEEKLY_LIMIT");
        if (weeklyLimit) {
          console.log("✅ WEEKLY_LIMIT found!");
          console.log(`   Percentage: ${weeklyLimit.percentage}%`);
        } else {
          console.log("❌ WEEKLY_LIMIT not found in response");
          console.log("   Available types:", parsed.data.limits.map(l => l.type).join(", "));
        }
      }
    } catch (err) {
      console.error("❌ Failed to parse JSON:", err.message);
      console.error("Raw response:", responseData);
    }
  });
}).on("error", (err) => {
  console.error("❌ Request failed:", err.message);
});
