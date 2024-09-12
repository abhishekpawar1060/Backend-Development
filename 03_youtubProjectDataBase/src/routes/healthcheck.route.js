import { Router } from "express";

import {healthcheck} from "../controllers/healthcheck.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").get(healthcheck);


export default router;