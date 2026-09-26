import { Router, type IRouter } from "express";
import healthRouter from "./health";
import birthdaysRouter from "./birthdays";

const router: IRouter = Router();

router.use(healthRouter);
router.use(birthdaysRouter);

export default router;
