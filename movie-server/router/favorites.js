const express = require("express");
const auth = require("../middleware/auth");
const {
  addFavorite,
  getMyFavorites,
  deleteFavorite,
} = require("../controllers/favorites");

const router = express.Router();

// /api/v1/favorites
router
  .route("/")
  .post(auth, addFavorite)
  .get(auth, getMyFavorites)
  .delete(auth, deleteFavorite);

module.exports = router;
