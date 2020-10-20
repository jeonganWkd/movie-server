const moment = require("moment");
// 데이터베이스 처리 위한 라이브러리 필요
const connection = require("../db/mysql_connection");

// @desc        좌석 예약 하기
// @route       POST /api/v1/reservations
// @request     movie_id, seat_no_arr[], start_time, user_id(auth)
// @response    success
exports.setReservation = async (req, res, next) => {
  let movie_id = req.body.movie_id;
  let seat_no_arr = req.body.seat_no_arr;
  let start_time = req.body.start_time;
  let user_id = req.user.id;

  if (!movie_id || !seat_no_arr || !start_time || !user_id) {
    res.status(400).json();
    return;
  }
  // 첫번째 방법 : select 해서, 해당 좌석 정보가 있는지 확인 => rows.length == 1
  // 두번째 방법 : 테이블에, movie_id, start_time, seat_no 를 unique 하게 설정.
  let query =
    "insert into movie_reservation \
  (movie_id, start_time, seat_no, user_id) values ? ";
  let data = [];
  for (let i = 0; i < seat_no_arr.length; i++) {
    data.push([movie_id, start_time, seat_no_arr[i], user_id]);
  }
  console.log(data);
  try {
    [result] = await connection.query(query, [data]);
    res.status(200).json({ success: true });
  } catch (e) {
    if (e.errno == 1062) {
      res.status(400).json({ message: "이미 예약된 자석입니다." });
    } else {
      res.status(500).json({ error: e });
    }
  }
};

// @desc        상영시간의 해당영화 좌석 정보 불러오기(모든 좌석 정보)
// @route       GET /api/v1/reservations?start_time=&movie_id=
// @request     start_time, movie_id
// @response    success, items[], cnt

exports.getReservations = async (req, res, next) => {
  let start_time = req.query.start_time;
  let movie_id = req.query.movie_id;

  if (!start_time || !movie_id) {
    res.status(400).json();
    return;
  }
  let query =
    "select id, movie_id, seat_no from movie_reservation \
  where start_time = ? and movie_id = ?";
  let data = [start_time, movie_id];

  try {
    [rows] = await connection.query(query, data);
    res.status(200).json({ success: true, items: rows, cnt: rows.length });
  } catch (e) {
    res.status(500).json({ error: e });
  }
};

// @desc        내가 예약한 좌석 정보 불러오기
// @route       GET /api/v1/reservations/me
// @request     user_id(auth)
// @response    success, items[], cnt

exports.getMyReservations = async (req, res, next) => {
  let user_id = req.user.id;

  if (!user_id) {
    res.status(400).json();
    return;
  }

  // 지금 현재 시간보다, 상영시간이 지난 시간의 예약은,
  // 가져 올 필요가 없습니다.

  // 현재 시간을, 밀리세컨즈 1970년1월1일 이후의 시간 => 숫자 1596164845211
  let currentTime = Date.now();
  //currentTime = currentTime + 1000*60*30 => 현재부터 30분 이후의 영화가져오기
  // 위의 현재시간 숫자를 => 2020-07-31 12:07:25 식으로 바꿔준것.
  let compareTime = moment(currentTime).format("YYYY-MM-DD HH:mm:ss");
  console.log(currentTime);
  console.log(compareTime);
  // 영화시작시간이 현재 시간보다 이후의 시간으로 예약된 정보만 가져오는 쿼리.
  // 현재 2020-07-31 12:15  <  2020-07-31 14:00
  let query =
    "select r.* , m.title \
    from movie_reservation as r \
    join movie as m \
    on r.movie_id = m.id \
    where user_id = ? and start_time > ? ";

  let data = [user_id, compareTime];

  try {
    [rows] = await connection.query(query, data);
    res.status(200).json({ success: true, items: rows, cnt: rows.length });
  } catch (e) {
    res.status(500).json();
  }
};

// db 직접 처리법
// select
// if(TIMESTAMPDIFF(MINUTE, NOW(), start_at) > 30, true, false)
// 	as possible_cancel
// from table;

// @desc        좌석 예약을 취소
// @route       DELETE /api/v1/reservations/:reservation_id
// @request     reservation_id, user_id(auth)
// @response    success

exports.deleteReservation = async (req, res, next) => {
  let reservation_id = req.params.reservation_id;
  let user_id = req.user.id;

  // 시작시간 30분 전에는 취소 불가.
  let currentTime = Date.now(); // 밀리세컨즈 1596166702591
  let compareTime = currentTime + 1000 * 60 * 30; // 현재시간 + 30분

  let query = "select * from movie_reservation where id = ? ";
  let data = [reservation_id];

  try {
    [rows] = await connection.query(query, data);
    // DB에 저장된 timestamp 형식을 => 밀리세컨즈로 바꾸는 방법
    let start_time = rows[0].start_time;
    let mili_start_time = new Date(start_time).getTime();
    if (mili_start_time < compareTime) {
      res
        .status(400)
        .json({ message: "영화상영 30분 이전에는 취소가 안됩니다." });
      return;
    }
  } catch (e) {
    res.status(500).json();
  }

  query = "delete from movie_reservation where id = ? ";
  data = [reservation_id];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json();
  }
};