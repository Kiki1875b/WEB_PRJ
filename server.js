const express = require('express');
const mysql = require('mysql');
const multer= require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');

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

//파일 저장 위치
const storage = multer.diskStorage({
  destination: function(req, file, cb){
    try{
    const folderName = req.body.item_name;
    const folderPath = `uploads/${folderName}`;

    fs.mkdirSync(folderPath, { recursive: true }); // Create folder if it doesn't exist

    cb(null, folderPath);
    }catch(err){
      console.lo.error("Error during folder", err);
      cb(err,null);
    }
  },
  filename: function(req, file, cb){
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Adjust the file size limit as needed
});

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
// 정적 파일 제공 (login.html과 login.js)
//app.use(express.static('public'));

app.use((req, res, next) => {
  const isLoggedIn = req.cookies.isLoggedIn === 'true';
  req.isLoggedIn = isLoggedIn;
  next();
});

// 로그인 요청 처리
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  // MySQL에서 사용자 정보 확인
  const sql = 'SELECT * FROM USER WHERE UID = ? AND PWD = ?';
  db.query(sql, [username, password], (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      res.cookie('isLoggedIn', 'true', { maxAge: 60 * 60 * 1000 }); 
      res.cookie('username', username, {maxAge: 60 * 60 * 1000}); 
      res.send(true);
    } else {
      res.send(false);
    }
  });
});

app.post('/check', (req, res) => {
  const isLoggedIn = req.cookies.isLoggedIn === 'true';
  if (!isLoggedIn) {
    res.json({
      status: false,
    });
    return;
  } else {
    res.json({
      status: true,
      uname: req.cookies.username,
    });
    return;
  }
});

//사용자 회원가입
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

//상품 등록
app.post('/upload', upload.array('item_image'), (req, res) => {
  const {
    item_name,
    item_cost,
    item_count,
    item_category,
    item_color,
    delivery_info,
  } = req.body;

  const images= req.files;

  const imagePaths = images.map(image => image.path);

  const imagePath = imagePaths.join(',');
  const query = 'INSERT INTO ITEM (IName, ICost, ItemCount, Category, Color, DeliveryInfo, SoldCount, ItemImage) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?)';
  
  db.query(
    query,
    [item_name, item_cost, item_count, item_category, item_color, delivery_info, 0, imagePath],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      } else {
        res.status(200).send('Data Inserted');
      }
    }
  );
});

  


app.get('/images', async (req, res) => {
  const uploadPath = path.join(__dirname, 'uploads');

  try {
    const folders = await fs.promises.readdir(uploadPath);

    const imagePromises = folders.map(async (folder) => {
      const folderPath = path.join(uploadPath, folder);
      const files = await fs.promises.readdir(folderPath);

      if (files.length > 0) {
        const firstImage = files[0];
        const imagePath = path.join('uploads', folder, firstImage);
        // 아이템 아이디 쿼리
        const query = `SELECT IID, IName, ICost FROM ITEM WHERE ItemImage LIKE "%${firstImage}%"`;

        return new Promise((resolve, reject) => {
          db.query(query, (err, result) => {
            if (err) {
              reject(err);
            } else {

              resolve({ path: imagePath, alt: folder, folderPath: folder, iID: result[0].IID, itemName: result[0].IName, itemCost: result[0].ICost});
            }
          });
        });
      }
    });

    const images = await Promise.all(imagePromises);

    res.json(images);
  } catch (err) {
    console.error('Error reading folders or files:', err);
    return res.status(500).send('Internal server error while fetching folders');
  }
});


app.get('/popular', async(req, res)=>{
  const uploadPath = path.join(__dirname, 'uploads');
  try {
    const folders = await fs.promises.readdir(uploadPath);
  

    const imagePromises = folders.map(async (folder) => {
      const folderPath = path.join(uploadPath, folder);
      const files = await fs.promises.readdir(folderPath);

      if (files.length > 0) {
        const firstImage = files[0];
        const imagePath = path.join('uploads', folder, firstImage);
        // 아이템 아이디 쿼리
        const query = `SELECT IID, IName, ICost FROM ITEM WHERE ItemImage LIKE "%${firstImage}%" AND SoldCount > 50`;


        return new Promise((resolve, reject) => {
          db.query(query, (err, result) => {
            if (err) {
              reject(err);
            } else {
              if (result.length > 0) {
                resolve({
                  path: imagePath,
                  alt: folder,
                  folderPath: folder,
                  iID: result[0].IID,
                  itemName: result[0].IName,
                  itemCost: result[0].ICost
                });
              } else {
                // 데이터가 없는 경우에 대한 처리
                // 예: resolve에 빈 객체를 전달하거나 다른 기본값을 사용할 수 있습니다.
                resolve({}); 
              }
            }
          });
        });
      }
    });

    const images = await Promise.all(imagePromises);

    res.json(images);
  } catch (err) {
    console.error('Error reading folders or files:', err);
    return res.status(500).send('Internal server error while fetching folders');
  }
});


//상세정보

app.get('/images/:folderPath', (req, res) => {
  const decodedFolderPath = decodeURIComponent(req.params.folderPath);
  const folderPath = path.join(__dirname, 'uploads', decodedFolderPath);
  
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error(`Error reading files in ${decodedFolderPath} folder:`, err);
      return res.status(500).send('Internal Server Error');
    }

    const folderImages = files.map(file => ({
      path: `/uploads/${decodedFolderPath}/${file}`,
      alt: file
    }));
    res.json({
      folderImages,
    });
  });
});

//카트에 추가
app.post('/addToCartEndpoint', (req, res) => {
  const { username, itemID, quantity } = req.body;
  var itemCount = 0;
  const inDBQuery = 'SELECT ItemCount FROM cart WHERE UID="'+username+'" AND IID="'+itemID+'" AND OrderStatus = FALSE';
  const checkQuery = 'SELECT * FROM cart WHERE UID="'+username+'" AND itemID="'+itemID;

  db.query(inDBQuery, (err,results) => {
    if(err){
      console.log(err);
    }else{
      if(results.length > 0){
        itemCount = results[0].ItemCount;

        console.log(results);
        
        const query = 'UPDATE CART SET ItemCount='+(itemCount+quantity) +' WHERE IID="'+itemID+'" AND OrderStatus = FALSE';
        db.query(query,(err,result)=>{
          if(err){
            console.error(err);
            return res.status(500).json({success: false});
          }
    
          console.log('Item Successfully Updated');
          res.json({success: true});
          });

        }else if(results.length == 0){
          const query = 'INSERT INTO cart (UID, IID, ItemCount) VALUES (?, ?, ?)';
          db.query(query, [username, itemID, quantity], (err, result) => {
              if (err) {
                  console.error('Error adding item to cart:', err);
                  return res.status(500).json({ success: false, message: 'Internal Server Error' });
              }
              console.log('Item added to cart:', result);
              res.json({ success: true, message: 'Item added to cart successfully' });
          });
        }
      }
      
    });
  });


app.post('/mypage', (req, res) => {
  const query = 'SELECT phone_num, Address, Email, `Register Date` FROM user where (UID) = ?';
  db.query(query, req.body.UID, (err, result) => {
    if(err){
      console.error('Error while fetching data', err);
      return res.status(500).send('internal server error');
    }

    if (result.length > 0) {

      const rawDate = result[0]['Register Date'];
      const dateObject = new Date(rawDate);
      const formattedDate = dateObject.toISOString().split('T')[0];

      const userData = {
        username: req.body.UID,
        phone_num: result[0].phone_num,
        address: result[0].Address,
        email: result[0].Email,
        registerDate: formattedDate,
      };
      
      res.json(userData);
    }
    
  });
});

app.post('/cart', (req, res) => {
  const query = 'SELECT IID, ItemCount, CartNumber FROM cart WHERE UID = (?) AND OrderStatus = FALSE';

  db.query(query, req.body.UID, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('internal server error');
    }

    let cartItems = [];

    if (results.length > 0) {
      cartItems = results.map(item => ({ IID: item.IID, ItemCount: item.ItemCount, CartNumber: item.CartNumber}));

      const placeholders = cartItems.map(() => '?').join(',');

      const pathQuery = `SELECT IID, ItemImage, ICost FROM item WHERE IID IN (${placeholders})`;

      db.query(pathQuery, cartItems.map(item => item.IID), (_err, result) => {
        if (_err) {
          return res.status(500).send('internal server error');
        } else {
          
          const extractedPaths = result.map(pathResult => {
            const matchedItem = cartItems.find(item => item.IID === pathResult.IID);
            const imagePath = pathResult.ItemImage;
            const firstPart = imagePath.split(',')[0];
            return { 
              ItemID: matchedItem.IID,
              CartNum: matchedItem.CartNumber,
              ItemCount: matchedItem.ItemCount, 
              ItemImage: firstPart,
              ICost: pathResult.ICost  
            };
          });
          console.log("EXTRACTED: ", extractedPaths);
          res.json({ extractedPaths });
        }
      });
    } else {
      res.json({ extractedPaths: [] });
    }
  });
});


app.post('/removeCart', (req, res) => {
  const query = 'DELETE FROM cart WHERE CartNumber = ?';

  db.query(query, [req.body.cartNumber], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ status: "error" });
    } else {
      res.json({ status: "success" });
    }
  });
});

app.post('/order', (req, res) => {
  const cartNumbers = req.body.cartNumbers;
  const placeholders = cartNumbers.map(() => '?').join(',');
  const query = `UPDATE cart SET OrderStatus = TRUE WHERE CartNumber IN (${placeholders})`;

  db.query(query, cartNumbers, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ status: 'error' });
    } else {
      res.json({ status: 'success' });
    }
  });
});

app.get('/search', (req, res) => {
  
  const query = `SELECT * FROM item WHERE IName LIKE '%${req.query.searchTerm}%' OR Category LIKE '%${req.query.searchTerm}%'`;

  db.query(query, (err, result) => {
    if(err){
      res.status(500).json({ status : 'error' });
    }else{
      if (result.length > 0) {
        const resultData = [];
        result.forEach(item => {

          const iid = item.IID;
          const iName = item.IName;
          const iCost = item.ICost;
          const itemPath = item.ItemImage;
          const firstPart = itemPath.split(',')[0];
          console.log(`Item ID: ${firstPart}, Item Name: ${iName}, Item Cost: ${iCost}`);
          resultData.push({ iid, iName, iCost, firstPart, });
    });
    console.log(resultData);
    res.json({data: resultData});
  }
}
});
});

app.use(express.static('C:/ww/WEB_PRJ'));


// 서버 시작
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

