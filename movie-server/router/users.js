const express = require("express");
const auth = require("../middleware/auth");
const {
  createUser,
  loginUser,
  logout,
  userPhotoUpload,
} = require("../controllers/users");

const router = express.Router();

// api/v1/users
router.route("/").post(createUser);
router.route("/login").post(loginUser);
router.route("/logout").delete(auth, logout);
router.route("/me/photo").put(auth, userPhotoUpload);

module.exports = router;