import prisma from "../../utils/prisma/prisma";

export class ConfigService {
  static async getAppStatus() {
    const config = await prisma.appConfig.findFirst();

    if (!config) {
      throw new Error("App configuration not found");
    }

    if (!config.launchDate) {
      return {
        status: "CONFIG_INCOMPLETE",
        appLive: config.appLive,
        release: null,
        serverTime: new Date(),
      };
    }

    const now = new Date();
    const releaseDate = config.launchDate; 

    const diffMs = releaseDate.getTime() - now.getTime();
    const countdownSeconds = Math.max(Math.floor(diffMs / 1000), 0);

    const status = config.appLive
      ? "LIVE"
      : diffMs > 0
        ? "PRE_LAUNCH"
        : "READY_TO_GO_LIVE";

    return {
      status,
      appLive: config.appLive,
      release: {
        utcDate: releaseDate,
        ethiopianDate: "መስከረም 1 2019",
        countdownSeconds,
      },
      serverTime: now,
    };
  }
}
