const jwt = require("jsonwebtoken");
const connection = require("../db/mysql_connection");

const auth = async (req, res, next) => {
  let token = req.header("Authorization").replace("Bearer ", "");
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  let user_id = decoded.user_id;

  let query =
    "select * from movie_token mt \
    join movie_user mu \
    on mt.user_id = mu.id\
     where mt.user_id = ? and mt.token = ?";

  let data = [user_id, token];

  try {
    [rows] = await connection.query(query, data);
    console.log(rows);
    if (rows.length == 0) {
      res.status(500).json({ success: false, message: "no data" });
      return;
    } else {
      console.log(rows);
      req.user = rows[0];
      req.user.token = token;
      next();
    }
  } catch (e) {
    res.status(401).json({ success: false, message: "인증필요" });
  }
};
module.exports = auth;
