import express from "express";
const router = express.Router();

import * as BillingController from "../controllers/billingController.js";

router.post("/payment/complete", BillingController.upsertPayment);

export default router;
