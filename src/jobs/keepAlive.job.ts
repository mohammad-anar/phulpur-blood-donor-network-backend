import cron from "node-cron";
import env from "../config/env.js";

/**
 * Keep-alive cron job that pings the server's root route ("/") every 14 minutes.
 * Prevents sleep/spin-down on free hosting platforms (Render, Railway, etc.).
 *
 * Cron expression: "STAR/14 * * * *" runs every 14 minutes.
 */
export const initKeepAliveJob = () => {
  // Cron schedule: every 14 minutes
  const task = cron.schedule("*/14 * * * *", async () => {
    const rawUrl = env.server_url || `http://localhost:${env.port}`;
    const baseUrl = rawUrl.replace(/\/+$/, "");
    const rootUrl = `${baseUrl}/`;

    const timestamp = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Dhaka",
    });

    try {
      console.log(`⏳ [Cron Job - 14 Min] Pinging root route at ${timestamp} -> ${rootUrl}`);

      const response = await fetch(rootUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Phulpur-KeepAlive-Cron/1.0",
          Accept: "application/json, text/plain",
        },
      });

      if (response.ok) {
        console.log(
          `✅ [Cron Job - 14 Min] Ping successful! Status: ${response.status} (${response.statusText}) at ${timestamp}`,
        );
      } else {
        console.warn(
          `⚠️ [Cron Job - 14 Min] Ping responded with non-200 status: ${response.status} at ${timestamp}`,
        );
      }
    } catch (error: any) {
      console.error(
        `❌ [Cron Job - 14 Min] Error pinging root route (${rootUrl}) at ${timestamp}:`,
        error?.message || error,
      );
    }
  });

  console.log("⏰ Keep-Alive Cron Job initialized (Every 14 minutes: */14 * * * *)");
  return task;
};

export default initKeepAliveJob;
