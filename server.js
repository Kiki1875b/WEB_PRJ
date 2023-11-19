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


app.post('/register',(req,res)=> {
  const{username, password, phoneNum, address, email, sex} = req.body;
  const insertQuery = 'INSERT INTO USER (UID, PWD, phone_num, Address, Email, `Register Date`, Sex) VALUES (?, ?, ?, ?, ?, CURDATE(), ?)';
  const values = [username, password, phoneNum, address, email, sex];

  if (!username) {
    // 클라이언트에서 'username' 값을 전달하지 않았을 경우
    return res.status(400).send("Bad Request: 'username' is required. A" + req.body.username);
  }

  db.query(insertQuery, values, (err, results) => {
    if(err){
      throw err;
    }

    if(results.length >0){
      res.send("회원가입 성공!");
    }else{
      res.send("실패");
    }
  });

});

app.use(express.static('C:/ww/WEB_PRJ'));

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

