import express from "express";
import publicController from "../controller/publicController.js";

const router = express.Router();

router.post("/request-access", (req, res, next) => publicController.requestAccess(req, res, next));

export default router;
