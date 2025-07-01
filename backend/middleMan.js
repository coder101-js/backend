import express from "express";
import { authenticate } from "./module/jwt.js";
import { middleManController } from "./controller/middleManController.js";
const router = express.Router();

router.use(express.json());
router.use(authenticate); // validate JWT on every request

router.post("/", middleManController);

export default router;
