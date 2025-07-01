import express from "express";
import { authenticate } from "./module/jwt.mjs";
import { middleManController } from "./controller/middleManController.mjs";
const router = express.Router();

router.use(express.json());
router.use(authenticate); // validate JWT on every request

router.post("/", middleManController);

export default router;
