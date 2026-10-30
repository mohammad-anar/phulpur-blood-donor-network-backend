import cron from "node-cron";
import env from "../config/env.js";

/**
 * Keep-alive cron job that pings the server's root route ("/") every 10 minutes.
 * Prevents sleep/spin-down on free hosting platforms (Render, Railway, etc.).
 *
 * Cron expression: "*\/10 * * * *" runs every 10 minutes.
 */
export const initKeepAliveJob = () => {
  const isLocalhost = !env.server_url || env.server_url.includes("localhost") || env.server_url.includes("127.0.0.1");

  if (isLocalhost && env.node_env === "production") {
    console.warn(
      "⚠️ [Keep-Alive Cron] SERVER_URL is not set to your public Render URL! Internal localhost pings will NOT prevent Render from sleeping. Please add SERVER_URL=https://<your-service>.onrender.com in Render Environment Variables or use an external service like cron-job.org / UptimeRobot.",
    );
  }

  // Cron schedule: every 10 minutes (safer than 14 min to stay well within Render's 15 min idle timeout)
  const task = cron.schedule("*/10 * * * *", async () => {
    const rawUrl = env.server_url || `http://localhost:${env.port}`;
    const baseUrl = rawUrl.replace(/\/+$/, "");
    const rootUrl = `${baseUrl}/`;

    const timestamp = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Dhaka",
    });

    try {
      console.log(`⏳ [Cron Job - 10 Min] Pinging root route at ${timestamp} -> ${rootUrl}`);

      const response = await fetch(rootUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Phulpur-KeepAlive-Cron/1.0",
          Accept: "application/json, text/plain",
        },
      });

      if (response.ok) {
        console.log(
          `✅ [Cron Job - 10 Min] Ping successful! Status: ${response.status} (${response.statusText}) at ${timestamp}`,
        );
      } else {
        console.warn(
          `⚠️ [Cron Job - 10 Min] Ping responded with non-200 status: ${response.status} at ${timestamp}`,
        );
      }
    } catch (error: any) {
      console.error(
        `❌ [Cron Job - 10 Min] Error pinging root route (${rootUrl}) at ${timestamp}:`,
        error?.message || error,
      );
    }
  });

  console.log("⏰ Keep-Alive Cron Job initialized (Every 10 minutes: */10 * * * *)");
  return task;
};

export default initKeepAliveJob;
