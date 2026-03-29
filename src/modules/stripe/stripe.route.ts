import express ,{ Router } from "express";
import { handleStripeWebhookController } from "./stripe.controller";
import bodyParser from "body-parser";

const stripeRouter = Router();

stripeRouter.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleStripeWebhookController
);

export default stripeRouter 