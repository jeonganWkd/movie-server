// 데이터베이스 처리 위한 라이브러리 필요
const connection = require("../db/mysql_connection");

// @desc    영화데이터 모두 불러오는 API (25개씩)
// @route   GET /api/v1/movies
// @req     offset, limit  ( ?offset=30&limit=25 )
// @res     success, items[ {id,title,attendance,year}, cnt ]
exports.getMovies = async (req, res, next) => {
  console.log("영화 전부 가져오는 API ");

  let offset = req.query.offset;
  let limit = req.query.limit;

  if (!offset || !limit) {
    res.status(400).json({ message: "parameters setting error" });
    return;
  }

  let query = `select m.*, count(r.movie_id) as reply_cnt, 
  round(avg(r.rating) , 1) as avg_rating
  from movie as m
  left join movie_reply as r
  on m.id = r.movie_id
  group by m.id
  order by m.id
  limit ${offset}, ${limit};`;

  try {
    [rows] = await connection.query(query);
    let cnt = rows.length;
    res.status(200).json({ success: true, items: rows, cnt: cnt });
    return;
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    영화명으로 검색하는 API (25개씩)
// @route   GET /api/v1/movies/search
// @req     offset, limit, keyword
//          (  ?offset=0&limit=25&keyword=war  )
// @res     success, items[ {  } ], cnt
exports.searchMovies = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;
  let keyword = req.query.keyword;

  if (!offset || !limit || !keyword) {
    res.status(400).json({ message: "parameters setting error" });
    return;
  }

  let query = `select * from movie \
   where title like '%${keyword}%' \
   limit ${offset}, ${limit};`;

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, items: rows, cnt: rows.length });
    return;
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    연도로 정렬하는 API (25개씩) 오름,내림 둘다 가능
// @route   /api/v1/movies/year
// @req     offset, limit, order : asc / desc (디폴트 오름차순)
//          (?offset=0&limit=25&order=asc)
// @res     success, items[ ]  , cnt

exports.getMoviesByYear = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;
  let order = req.query.order;

  if (!offset || !limit) {
    res.status(400).json({ message: "parameters setting error" });
    return;
  }
  if (!order) {
    order = "asc";
  }

  let query = `select * from movie order by year ${order} 
  limit ${offset} , ${limit};`;
  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, items: rows, cnt: rows.length });
    return;
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    관객수로 정렬하는 API (25개씩)
// @route   /api/v1/movies/attendance
// @req     offset, limit, order : asc / desc
// @res     success, items[] , cnt

exports.getMovieByAttendance = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;
  let order = req.query.order;

  if (!offset || !limit) {
    res.status(400).json({ message: "parameters setting error" });
    return;
  }

  if (!order) {
    order = "desc";
  }
  let query = `select * from movie order by attendance ${order} limit ${offset}, ${limit}`;

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, items: rows, cnt: rows.length });
    return;
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
