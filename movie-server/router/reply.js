const express = require("express");
const auth = require("../middleware/auth");
const {
  addReply,
  getReply,
  updateReply,
  deleteReply,
} = require("../controllers/reply");

const router = express.Router();

// /api/v1/reply

router
  .route("/")
  .post(auth, addReply)
  .get(getReply)
  .put(auth, updateReply)
  .delete(auth, deleteReply);

module.exports = router;