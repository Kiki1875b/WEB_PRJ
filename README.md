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
