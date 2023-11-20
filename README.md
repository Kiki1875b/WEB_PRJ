# WEB_PRJ

node.js 다운받고
<br>
해당 폴더에 가서 터미널 열고
nmp init
control + c
nmp install express
nmp install mysql
nmp install multer

파일들 있는 폴더에서 (WEB_PRJ) 폴더에 uploads 폴더 생성
  - 차후 등록 상품 사진 저장될 공간

sql db 생성
CREATE DATABASE STATIONARY_STORE


CREATE TABLE USER (
  UID VARCHAR(255) NOT NULL,
  PWD VARCHAR(255) NOT NULL,
  phone_num VARCHAR(16) NOT NULL,
  Address VARCHAR(255) NOT NULL,
  Email VARCHAR(255) NOT NULL,
  `Register Date` DATE NOT NULL,
  Sex VARCHAR(16) NOT NULL,
  PRIMARY KEY (UID)
);


CREATE TABLE ITEM (
    IID INT AUTO_INCREMENT PRIMARY KEY,
    IName VARCHAR(255),
    ICost DECIMAL(10, 2),
    Sale DECIMAL(5, 2),
    ItemCount INT,
    Category VARCHAR(255),
    Color VARCHAR(255),
    DeliveryInfo VARCHAR(255),
    SoldCount INT,
    ItemImage VARCHAR(255)
);

server.js 의 13번줄 바꾸기 <- 본인 비밀번호로
server.js 의 124번줄 바꾸기 <- 본인 프로젝트 경로로
  - 프로젝트 경로에 한글있으면 오류

다 한뒤 WEB_PRJ 폴더에서 터미널 켠 뒤, node server.js 명령 실행
크롬에서 localhost:3000/login.html 혹은 localhost:3000/RegisterItems.html 접속
