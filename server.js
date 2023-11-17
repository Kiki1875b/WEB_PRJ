const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// MySQL 연결 설정
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Gjwldnd!1',
  database: 'STATIONARY_STORE'
});

// MySQL 연결
db.connect((err) => {
  if (err) {
    console.error('MySQL connection error: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});



// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// 정적 파일 제공 (login.html과 login.js)
//app.use(express.static('public'));
app.use(express.static('C:/ww/WEB_PRJ'));

// 로그인 요청 처리
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // MySQL에서 사용자 정보 확인
  const sql = 'SELECT * FROM USER WHERE UID = ? AND PWD = ?';
  db.query(sql, [username, password], (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      res.send('로그인 성공!');
    } else {
      res.send('로그인 실패. 사용자 정보를 확인하세요.');
    }
  });
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

