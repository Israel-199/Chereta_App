import { Router } from "express";
import { SupportController } from "./support.controller";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = Router();
const supportController = new SupportController();

router.post("/", authMiddleware, supportController.createTicket);
router.get("/my", authMiddleware, supportController.getMyTickets);
router.delete("/:id", authMiddleware, supportController.deleteTicket);

export default router;
