#!/usr/bin/env node

// src/statusline.ts
import fs from "node:fs";
import path from "node:path";
import { buffer } from "node:stream/consumers";


// src/api/glmApi.ts
import https from "node:https";
var DEFAULT_API_TIMEOUT_MS = 2000;
var SUPPORTED_GLM_DOMAINS = ["api.z.ai", "open.bigmodel.cn", "dev.bigmodel.cn"];

function buildGlmApiEndpoints(baseUrl) {
  const isSupportedDomain = SUPPORTED_GLM_DOMAINS.some((domain) =>
    baseUrl.includes(domain),
  );
  if (!isSupportedDomain) {
    throw new Error(
      `Unsupported baseUrl. Supported domains: ${SUPPORTED_GLM_DOMAINS.join(", ")}`,
    );
  }
  const baseDomain = `${new URL(baseUrl).protocol}//${new URL(baseUrl).host}`;
  return {
    quotaLimitUrl: `${baseDomain}/api/monitor/usage/quota/limit`,
    toolUsageUrl: `${baseDomain}/api/monitor/usage/tool-usage`,
  };
}

function buildGlmApiConfig(baseUrl, authToken, timeout) {
  if (!baseUrl || !authToken) {
    return null;
  }
  try {
    const urls = buildGlmApiEndpoints(baseUrl);
    return {
      ...urls,
      authToken: authToken,
      timeout: timeout ?? DEFAULT_API_TIMEOUT_MS,
    };
  } catch {
    return null;
  }
}
function httpsGet(
  url,
  authToken,
  queryParams = "",
  timeout = DEFAULT_API_TIMEOUT_MS,
) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + queryParams,
      method: "GET",
      headers: {
        Authorization: authToken,
        "Accept-Language": "en-US,en",
        "Content-Type": "application/json",
      },
    };
    const req = https.request(requestOptions, (res) => {
      let responseData = "";
      res.on("data", (chunk) => {
        responseData += chunk;
      });
      res.on("end", () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        try {
          resolve(JSON.parse(responseData));
        } catch {
          reject(new Error("Invalid JSON response"));
        }
      });
    });
    req.on("error", reject);
    const timeoutId = setTimeout(() => {
      req.destroy();
      reject(new Error("Request timeout"));
    }, timeout);
    req.on("close", () => {
      clearTimeout(timeoutId);
    });
    req.end();
  });
}

function formatDateToApiString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
async function getQuotaLimitFromApi(apiConfig) {
  return httpsGet(apiConfig.quotaLimitUrl, apiConfig.authToken, "", apiConfig.timeout);
}

async function getToolUsageFromApi(apiConfig, startTime, endTime) {
  const queryParams = `?startTime=${encodeURIComponent(
    startTime,
  )}&endTime=${encodeURIComponent(endTime)}`;
  return httpsGet(
    apiConfig.toolUsageUrl,
    apiConfig.authToken,
    queryParams,
    apiConfig.timeout,
  );
}

// src/utils/sessionHelpers.ts
function extractCurrentDirectoryName(sessionContext) {
  const currentDir = sessionContext.workspace?.current_dir;
  if (!currentDir) return void 0;
  const pathParts = currentDir.split(/\/|\\/);
  return pathParts[pathParts.length - 1] || currentDir;
}

// src/statusline.ts
function loadClaudeEnvironmentVariables(projectDir = process.cwd()) {
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  if (!homeDir) {
    return null;
  }
  const candidates = [
    path.join(projectDir, ".claude", "settings.local.json"),
    // 최우선 (git ignored)
    path.join(projectDir, ".claude", "settings.json"),
    // 프로젝트 레벨
    path.join(homeDir, ".claude", "settings.json"),
    // 전역 설정
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
        if (
          env.ANTHROPIC_BASE_URL !== void 0 &&
          env.ANTHROPIC_AUTH_TOKEN !== void 0
        ) {
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
var CACHE_FILE_PATH = path.join(
  process.env.HOME || "~",
  ".claude",
  "zai-usage-cache.json",
);
var CACHE_VALIDITY_DURATION_MS = 60000;
var CACHE_ERROR_RETRY_DURATION_MS = 15000;
var colors = {
  reset: "\x1B[0m",
  orange: "\x1B[38;5;208m",
  blue: "\x1B[38;5;39m",
  green: "\x1B[38;5;76m",
  yellow: "\x1B[38;5;226m",
  gray: "\x1B[38;5;245m",
  red: "\x1B[38;5;196m",
};
var claudeEnvironment = loadClaudeEnvironmentVariables();
var glmBaseUrl =
  process.env.ANTHROPIC_BASE_URL || claudeEnvironment?.ANTHROPIC_BASE_URL || "";
var glmAuthToken =
  process.env.ANTHROPIC_AUTH_TOKEN || claudeEnvironment?.ANTHROPIC_AUTH_TOKEN || "";
var glmApiConfig = buildGlmApiConfig(glmBaseUrl, glmAuthToken);

function loadCacheFromFile() {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const cacheContent = fs.readFileSync(CACHE_FILE_PATH, "utf8");
      return JSON.parse(cacheContent);
    }
  } catch {}
  return null;
}

function saveCacheToFile(data) {
  try {
    const cacheDir = path.dirname(CACHE_FILE_PATH);
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(data));
  } catch {}
}

function isCacheEntryValid(cache) {
  if (!cache) return false;
  if (!cache.timestamp) return false;
  const ttl = cache.data?.apiUnavailable
    ? CACHE_ERROR_RETRY_DURATION_MS
    : CACHE_VALIDITY_DURATION_MS;
  return Date.now() - cache.timestamp < ttl;
}

function getCachedDataIfValid() {
  const cache = loadCacheFromFile();
  if (cache && isCacheEntryValid(cache)) {
    return cache.data;
  }
  return null;
}
function formatTimeUntilReset(resetTimestamp) {
  const now = Date.now();
  const timeUntilReset = resetTimestamp - now;
  if (timeUntilReset <= 0) {
    return "0m";
  }
  const hours = Math.floor(timeUntilReset / (1000 * 60 * 60));
  const minutes = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
}
async function fetchQuotaDataFromApi() {
  if (!glmApiConfig) {
    return { quotaPercent: 0, mcpPercent: 0, weeklyPercent: 0 };
  }
  try {
    const apiResponse = await getQuotaLimitFromApi(glmApiConfig);
    if (apiResponse.success && apiResponse.data?.limits) {
      const limits = apiResponse.data.limits;
      let quotaPercent = 0;
      let mcpPercent = 0;
      let weeklyPercent = 0;
      let nextResetTimestamp;
      for (const limit of limits) {
        if (limit.type === "TOKENS_LIMIT") {
          quotaPercent = Math.round(limit.percentage || 0);
          nextResetTimestamp = limit.nextResetTime;
        }
        if (limit.type === "TIME_LIMIT") {
          mcpPercent = Math.round(limit.percentage || 0);
        }
        if (limit.type === "WEEKLY_LIMIT") {
          weeklyPercent = Math.round(limit.percentage || 0);
        }
      }
      const formattedResetTime = nextResetTimestamp
        ? formatTimeUntilReset(nextResetTimestamp)
        : void 0;
      return { quotaPercent, mcpPercent, weeklyPercent, nextResetTimestamp, formattedResetTime };
    }
  } catch {}
  return { quotaPercent: 0, mcpPercent: 0, weeklyPercent: 0 };
}

async function fetchToolUsageDataFromApi(startTime, endTime) {
  if (!glmApiConfig) {
    return 0;
  }
  try {
    const apiResponse = await getToolUsageFromApi(glmApiConfig, startTime, endTime);
    if (apiResponse.success && apiResponse.data?.list && apiResponse.data.list.length > 0) {
      return Math.min(100, Math.round(apiResponse.data.list.length * 5));
    }
  } catch {}
  return 0;
}
async function fetchAllUsageData() {
  const cachedData = getCachedDataIfValid();
  if (cachedData) {
    return cachedData;
  }
  if (!glmApiConfig) {
    return {
      error: "setup_required",
      quotaPercent: 0,
      mcpPercent: 0,
      weeklyPercent: 0,
    };
  }
  const now = new Date();
  const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);
  const startTime = formatDateToApiString(fiveHoursAgo);
  const endTime = formatDateToApiString(now);
  try {
    const [quotaResult, toolUsageResult] = await Promise.allSettled([
      fetchQuotaDataFromApi(),
      fetchToolUsageDataFromApi(startTime, endTime),
    ]);
    let quotaPercent = 0;
    let finalMcpPercent = 0;
    let weeklyPercent = 0;
    let nextResetTimestamp;
    let formattedResetTime;
    if (quotaResult.status === "fulfilled") {
      quotaPercent = quotaResult.value.quotaPercent;
      finalMcpPercent = quotaResult.value.mcpPercent;
      weeklyPercent = quotaResult.value.weeklyPercent;
      nextResetTimestamp = quotaResult.value.nextResetTimestamp;
      formattedResetTime = quotaResult.value.formattedResetTime;
    }
    if (toolUsageResult.status === "fulfilled" && toolUsageResult.value > 0) {
      finalMcpPercent = toolUsageResult.value;
    }
    const result = {
      quotaPercent,
      mcpPercent: finalMcpPercent,
      weeklyPercent,
      timestamp: Date.now(),
      nextResetTimestamp,
      formattedResetTime,
    };
    saveCacheToFile(result);
    return result;
  } catch {
    return { error: "loading", apiUnavailable: true };
  }
}
function renderColoredPercentage(percentage = 0) {
  let color;
  if (percentage >= 90) {
    color = colors.red;
  } else if (percentage >= 70) {
    color = colors.yellow;
  } else {
    color = colors.green;
  }
  return `${color}${percentage}%${colors.reset}`;
}

function getCurrentGitBranch() {
  try {
    const headPath = path.join(process.cwd(), ".git", "HEAD");
    const headContent = fs.readFileSync(headPath, "utf8").trim();
    if (headContent.startsWith("ref: refs/heads/")) {
      return headContent.replace("ref: refs/heads/", "");
    }
  } catch {}
  return "";
}
function formatStatuslineOutput(usageData, sessionContext) {
  if (!usageData || usageData.error === "setup_required") {
    return `${colors.yellow}\u26A0\uFE0F Setup required${colors.reset}`;
  }
  if (usageData.error === "loading") {
    return `${colors.yellow}\u26A0\uFE0F Loading...${colors.reset}`;
  }

  // Git info first
  const currentDirStr = `\u{1F4C1} ${extractCurrentDirectoryName(sessionContext)}`;
  const gitBranch = getCurrentGitBranch();
  const gitBranchStr = gitBranch ? ` | git:(${gitBranch})` : "";

  // Context usage from session data
  let contextUsagePercent = null;
  if (sessionContext?.context_window?.used_percentage != null) {
    contextUsagePercent = Math.round(sessionContext.context_window.used_percentage);
  } else if (sessionContext?.context_window?.remaining_percentage != null) {
    contextUsagePercent =
      100 - Math.round(sessionContext.context_window.remaining_percentage);
  }
  const contextUsageStr = contextUsagePercent !== null
    ? `Ctx: ${renderColoredPercentage(contextUsagePercent)}`
    : "Ctx: --";

  // Quota usage from GLM API
  const quotaUsageStr = `Quota: ${renderColoredPercentage(usageData.quotaPercent)}`;
  const weeklyUsageStr = usageData.weeklyPercent > 0 ? ` | Weekly: ${renderColoredPercentage(usageData.weeklyPercent)}` : "";
  const mcpUsageStr = `MCP: ${usageData.mcpPercent}%`;
  const resetTimeStr = `Reset: ${usageData.formattedResetTime || "--"}`;

  return `${colors.gray}${currentDirStr}${gitBranchStr}${colors.reset} | ${contextUsageStr} | ${quotaUsageStr}${weeklyUsageStr} | ${resetTimeStr} | ${mcpUsageStr}`;
}
async function main() {
  let sessionContext = {};
  const stdinBuffer = (await buffer(process.stdin)).toString("utf8");
  if (stdinBuffer) {
    sessionContext = JSON.parse(stdinBuffer);
  }
  const usageData = await fetchAllUsageData();
  console.log(formatStatuslineOutput(usageData, sessionContext));
}

main().catch((error) => {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
});
