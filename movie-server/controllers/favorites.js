// 데이터베이스 처리 위한 라이브러리 필요
const connection = require("../db/mysql_connection");

// @desc    좋아하는 영화 추가
// @route   POST /api/v1/favorites
// @parameters  movie_id

exports.addFavorite = async (req, res, next) => {
  // 즐겨찾기에 이미 추가된 영화는, 즐겨찾기에 추가되지 않도록 한다.

  let movie_id = req.body.movie_id;
  let user_id = req.user.id;

  let query = "insert into favorite_movie (movie_id, user_id) values (?,?)";
  let data = [movie_id, user_id];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true });
  } catch (e) {
    if (e.errno == 1062) {
      res.status(500).json({ message: "이미 즐겨찾기에 추가되었습니다." });
    } else {
      res.status(500).json({ error: e });
    }
  }
};

// @desc    즐겨찾기 저장된 영화 가져오는 API
// @route   GET /api/v1/favorites?offset=0&limit=25
// @request  offset, limit
// @response success, cnt, items : [ {title, genre, attendance, year } ]
exports.getMyFavorites = async (req, res, next) => {
  let offset = Number(req.query.offset);
  let limit = Number(req.query.limit);
  let user_id = req.user.id;

  let query =
    "select m.id, m.title, m.genre, m.attendance, m.year, f.id as favorite_id \
  from favorite_movie as f \
  join movie as m \
  on f.movie_id = m.id \
  where f.user_id = ? \
  limit ? , ? ;";

  let data = [user_id, offset, limit];

  try {
    [rows] = await connection.query(query, data);
    let cnt = rows.length;
    res.status(200).json({ success: true, items: rows, cnt: cnt });
  } catch (e) {
    res.status(500).json({ error: e });
  }
};

// @desc    즐겨찾기 삭제
// @route   DELETE  /api/v1/favorites
// @request  favorite_id

exports.deleteFavorite = async (req, res, next) => {
  let favorite_id = req.body.favorite_id;

  if (!favorite_id) {
    res.status(400).json();
    return;
  }

  let query = "delete from favorite_movie where id = ?";
  let data = [favorite_id];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json();
  }
};