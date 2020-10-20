// 데이터베이스 처리 위한 라이브러리 필요
const connection = require("../db/mysql_connection");

// @desc    댓글 추가
// @route   POST /api/v1/reply
// @request movie_id, content, rating

exports.addReply = async (req, res, next) => {
  let movie_id = req.body.movie_id;
  let user_id = req.user.id;
  let content = req.body.content;
  let rating = req.body.rating;

  let query =
    "insert into movie_reply \
    (movie_id, user_id, content, rating) values (?,?,?,?)";
  let data = [movie_id, user_id, content, rating];
  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json();
  }
};

// @desc    해당 영화의 댓글을 가져오는 API
// @route   GET /api/v1/reply?movie_id=124&offset=0&limit=25
// @request movie_id, offset, limit
// @response    success, items : [], cnt

exports.getReply = async (req, res, next) => {
  let movie_id = req.query.movie_id;
  let offset = req.query.offset;
  let limit = req.query.limit;

  let query =
    "select r.id as reply_id, m.title, u.id as user_id, u.email, r.content, \
    r.rating, r.created_at \
    from movie_reply as r \
    join movie as m on r.movie_id = m.id \
    join movie_user as u  on r.user_id = u.id \
    where r.movie_id = ?  limit  ? , ?  ;";

  let data = [movie_id, Number(offset), Number(limit)];
  try {
    [rows] = await connection.query(query, data);
    res.status(200).json({ success: true, items: rows, cnt: rows.length });
  } catch (e) {
    res.status(500).json();
  }
};

// @desc    내가 쓴 댓글 수정
// @route   PUT /api/v1/reply
// @request reply_id, user_id, content, rating

exports.updateReply = async (req, res, next) => {
  // 이 사람이 쓴 댓글이 맞는지 체크 => 맞으면 댓글 수정

  let reply_id = req.body.reply_id;
  let user_id = req.user.id;
  let content = req.body.content;
  let rating = req.body.rating;

  let query = "select * from movie_reply where id = ? ";
  let data = [reply_id];

  try {
    [rows] = await connection.query(query, data);
    // 댓글 쓴 사람이 아니면, 401 로 보낸다.
    if (rows[0].user_id != user_id) {
      res.status(401).json();
      return;
    }
  } catch (e) {
    res.status(500).json({ error: e });
    return;
  }

  query = "update movie_reply set content = ? , rating = ? where id = ? ";
  data = [content, rating, reply_id];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true });
    return;
  } catch (e) {
    res.status(500).json();
    return;
  }
};

// @desc    자신이 적은 댓글 삭제하기
// @route   Delete /api/v1/reply
// @request reply_id,  user_id

exports.deleteReply = async (req, res, next) => {
  let reply_id = req.body.reply_id;
  let user_id = req.user.id;

  // 해당 유저의 댓글이 맞는지 체크
  let query = "select * from movie_reply where id = ? ";
  let data = [reply_id];

  try {
    [rows] = await connection.query(query, data);
    if (rows[0].user_id != user_id) {
      res.status(401).json();
      return;
    }
  } catch (e) {
    res.status(500).json();
    return;
  }

  query = "delete from movie_reply where id = ? ";
  data = [reply_id];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true });
    return;
  } catch (e) {
    res.status(500).json();
    return;
  }
};