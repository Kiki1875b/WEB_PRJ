# WEB_PRJ

nodejs 다운로드
mysql 다운로드

이 프로젝트 저장한 폴더로 이동 -> 여기에 터미널 연 뒤
npm init
npm install express 
npm install mysql

sql 문
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

프로젝트 저장된 폴더에서 터미널 열고 node server.js 입력 후, http://localhost:3000/login.html 접속

===================================================================================================

npm install multer 한 뒤 진행

파일들 있는 폴더에 uploads 폴더 하나 생성 (차후 상품 업로드 할 때 사용할 사진들 들어갈 폴더)

상품 sql

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


