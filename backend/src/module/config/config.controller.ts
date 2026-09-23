import { Request, Response, NextFunction } from "express";
import { ConfigService } from "./config.service";

export class ConfigController {
  static async getAppStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ConfigService.getAppStatus();

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
