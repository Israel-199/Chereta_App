import { Router } from "express";
import { ConfigController } from "./config.controller";

const router = Router();

router.get("/app-status", ConfigController.getAppStatus);

export default router;
