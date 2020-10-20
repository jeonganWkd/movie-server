const express = require("express");
const auth = require("../middleware/auth");
const {
  setReservation,
  getReservations,
  getMyReservations,
  deleteReservation,
} = require("../controllers/reservations");

const router = express.Router();

// /api/v1/reservations

router.route("/").post(auth, setReservation);
router.route("/").get(auth, getReservations);
router.route("/me").get(auth, getMyReservations);
router.route("/:reservation_id").delete(auth, deleteReservation);

module.exports = router;