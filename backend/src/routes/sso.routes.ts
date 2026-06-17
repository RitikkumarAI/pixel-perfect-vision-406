import { Router } from "express";
import { SSOController } from "../controllers/sso.controller";
import passport from "passport";

const router = Router();
const ssoController = new SSOController();

router.post("/configure", ssoController.configure);
router.get("/login", ssoController.login);
router.post(
  "/callback",
  passport.authenticate("saml", { failureRedirect: "/login", session: false }),
  ssoController.callback,
);
router.get("/slo", ssoController.slo);
router.post("/slo/callback", ssoController.sloCallback);

export default router;
