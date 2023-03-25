// -------------------------------------------------------------
//                    ROUTER AUTH  /user
// -------------------------------------------------------------
const express = require("express");
const ctrl = require("../../controllers/auth");
const { validateBody } = require("../../middlewares");
const { authSchema, resendSchema } = require("../../models/user");
const { authorization, upload } = require("../../middlewares");

const router = express.Router();

router.post("/signup", validateBody(authSchema), ctrl.signup);
router.post("/login", validateBody(authSchema), ctrl.login);
router.post("/logout", authorization, ctrl.logout);
router.get("/current", authorization, ctrl.current);
router.patch(
  "/avatars",
  authorization,
  upload.single("avatar"),
  ctrl.updateAvatar
);
router.get("/verify/:verificationToken", ctrl.verify);
router.post("/verify", validateBody(resendSchema), ctrl.resendVerifyEmail);

module.exports = router;
