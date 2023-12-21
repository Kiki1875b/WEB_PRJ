const express = require('express');
const mysql = require('mysql');
const multer= require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const validator = require('validator');

const app = express();


const port = 9000;
app.set('port', process.env.PORT || 9000);
// MySQL 연결 설정
const db = mysql.createConnection({
  host: 'mydb.c9mk84i2830p.ap-northeast-2.rds.amazonaws.com',
  user: 'admin',
  password: 'kau2018!',
  database: 'STATIONARY_STORE'
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/main.html');
});

app.use(express.static(__dirname));



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
    const folderName = req.body.itemName;
    const folderPath = `uploads/${folderName}`;
    // console.log('n: ', req.body);
    // console.log('nn: ', req.body.itemName);

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

app.use((req, res, next) => {
  const isLoggedIn = req.cookies.isLoggedIn === 'true';
  req.isLoggedIn = isLoggedIn;
  next();
});

// 로그인 요청 처리
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Retrieve user information from MySQL
  const sql = 'SELECT * FROM user WHERE UID = ?'; // Only retrieve hashed password for comparison
  db.query(sql, [username], (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      const user = result[0];

      // Compare hashed passwords using bcrypt
      bcrypt.compare(password, user.PWD, (err, isMatch) => {
        if (err) throw err;

        if (isMatch) {
          // Authentication successful
          const isAdmin = user.UID.toLowerCase() === 'admin';
          res.cookie('isLoggedIn', 'true', { maxAge: 60 * 60 * 1000 });
          res.cookie('username', username, { maxAge: 60 * 60 * 1000 });
          res.cookie('isAdmin', isAdmin.toString(), { maxAge: 60 * 60 * 1000 });
          res.send(true);
        } else {
          // Invalid password
          res.send(false);
        }
      });
    } else {
      // User not found
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

  console.log(username, password, phoneNum, address);

  const saltRounds = 10;
  const hashedPassword = bcrypt.hashSync(password, saltRounds);

  const insertQuery = 'INSERT INTO user (UID, PWD, phone_num, Address, Email, `Register Date`, Sex) VALUES (?, ?, ?, ?, ?, CURDATE(), ?)';
  const values = [username, hashedPassword, phoneNum, address, email, sex];

  if (!username) {
    // 클라이언트에서 'username' 값을 전달하지 않았을 경우
    return res.status(400).send("Bad Request: 'username' is required. A" + req.body.username);
  }

  if (!validator.isEmail(email)) {
    // 이메일 유효성 검사 실패
    console.log("!");
    return res.status(400).send("Bad Request: Invalid email address.");
  }

  db.query(insertQuery, values, (err, results) => {
    if(err){
      throw err;
    }

    if (results.affectedRows === 0) {
      res.json({result: "F"});
    } else {
      res.json({result: "T"});
    }
  });

});

app.post('/selected', async (req, res) => {
  const category = req.body.category;
  let value = '';
  console.log(category);
  if(category == 'writing-materials'){
    value = '필기구';
  }else if(category == 'office-materials'){
    value='사무용품';
  }else if(category == 'etc-materials'){
    value = '기타';
  }

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
        const query = `SELECT IID, IName, ICost, Category FROM item WHERE ItemImage LIKE "%${firstImage}%"`;

        return new Promise((resolve, reject) => {
          db.query(query, (err, result) => {
            if (err) {
              reject(err);
            } else {
              if(result.length>0){
                console.log(result[0].IName);
                resolve({ path: imagePath, alt: folder, folderPath: folder, iID: result[0].IID, itemName: result[0].IName, itemCost: result[0].ICost, category: result[0].Category });
                
              }
            }
          });
        });
      }
    });
    
    const images = await Promise.all(imagePromises);
    const filteredImages = images.filter(image => image.category === value);
    res.json(filteredImages);
  } catch (err) {
    console.error('Error reading folders or files:', err);
    return res.status(500).send('Internal server error while fetching folders');
  }

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
  const query = 'INSERT INTO item (IName, ICost, ItemCount, Category, Color, DeliveryInfo, SoldCount, ItemImage) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?)';
  
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
        console.log(firstImage);
        // 아이템 아이디 쿼리
        const query = `SELECT IID, IName, ICost FROM item WHERE ItemImage LIKE "%${firstImage}%"`;

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
        const query = `SELECT IID, IName, ICost, RegisterDate, SoldCount FROM item WHERE ItemImage LIKE "%${firstImage}%" AND SoldCount > 400`;


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
                  itemCost: result[0].ICost,
                  registerDate: result[0].RegisterDate,
                  soldCount: result[0].SoldCount,
                });
                
              } else {
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

app.get('/new', async(req, res) => {
  const uploadPath=path.join(__dirname, 'uploads');

  try {
    const folders = await fs.promises.readdir(uploadPath);
  

    const imagePromises = folders.map(async (folder) => {
      const folderPath = path.join(uploadPath, folder);
      const files = await fs.promises.readdir(folderPath);

      if (files.length > 0) {
        const firstImage = files[0];
        const imagePath = path.join('uploads', folder, firstImage);
        // 아이템 아이디 쿼리
        const query = `SELECT IID, IName, ICost, RegisterDate FROM item WHERE ItemImage LIKE "%${firstImage}%" AND MONTH(RegisterDate) = MONTH(CURRENT_DATE)`;


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
                  itemCost: result[0].ICost,
                  registerDate: result[0].RegisterDate,
                  soldCount: result[0].SoldCount,
                });
                console.log(result[0].ICost);
              } else {
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

app.get('/items', (req, res) =>{
  const query = `SELECT * FROM item`;
  db.query(query, (err, result) =>{
    if(err){
      res.status(500).json({status: error});
    }else{
      if(result.length > 0){
        console.log("?");
        const resultData = [];
        result.forEach(item => {
          const iid = item.IID;
          const iName = item.IName;
          const iCost = item.ICost;
          const itemPath = item.ItemImage;
          let firstPart = "";
          if(itemPath==null){
            
          }else{
             firstPart = itemPath.split(',')[0];
          }
          
          const category = item.Category;
          const soldCount = item.SoldCount;
          const registerDate = item.RegisterDate;
          resultData.push({iid,iName,iCost,firstPart,category,soldCount,registerDate,});
          console.log(registerDate);
        });
        res.json({data:resultData});
      }
    }
  });
});

app.get('/orders',(req, res) =>{
  const query = `SELECT cart.CartNumber, cart.UID, user.UID, cart.IID, cart.ItemCount, item.IName, user.phone_num, user.Email, (cart.ItemCount * item.ICost) AS total, user.Address
  FROM cart
  JOIN item ON item.IID = cart.IID
  JOIN user ON user.UID = cart.UID
  WHERE OrderStatus=1;`;

  db.query(query, (err, result)=>{
    if(err){
      res.send("FAIlED to FETCH");
    }else{
      if(result.length > 0){
        const resultData = [];
        result.forEach(item => {
          const cart = item.CartNumber;
          const user = item.UID;
          const itemID = item.IID;
          const count = item.ItemCount;
          const itemName = item.IName;
          const contact = item.phone_num;
          const email = item.Email;
          const totalCost = item.total;
          const addr = item.Address;
          resultData.push({cart, user, itemID, count, itemName, contact, email, totalCost, addr});
        });
        res.json({reply: resultData});
      }
    }
  });
});
app.post('/deleteOrder', (req, res)=>{
  const query = `DELETE FROM cart WHERE CartNumber = ${req.body.order}`;
  db.query(query, (err,results)=>{
    if(err){
      return res.json({result: "Fail"});
    }else{
      return res.json({result: "Success"});
    }
  });
});

app.post('/updateItem', upload.array('imageFile'), (req, res) => {
  const id = req.body.itemName;
  console.log(id);
  const images = req.files;
  const imagePaths = images.map(image => image.path);
  const imagePath = imagePaths.join(',');
  const query = `UPDATE item SET iName = ?, iCost = ?, Category = ?,soldCount = ?, ItemImage= ? WHERE IID = ?`;
  db.query(query, [req.body.itemName, req.body.itemCost, req.body.itemCategory, req.body.itemSoldCount,imagePath,req.body.itemID],(err, resultData) => {
    if(err) {return res.status(err).json({stat: 'fail'})}
    else{
      return res.json({stat: 'success'});
    };
  });
});

app.post('/insertItem', (req, res) => {
  const id = req.body.itemID;
  let c = 0;
  const checkQuery = `SELECT COUNT(*) AS C FROM item WHERE IID = ?`;
  db.query(checkQuery, [id], (err, resultData) => {
    if(err) {
      return res.status(err);
    }else{
      c = resultData[0].C;
      console.log(resultData);
    }
  });

  if(c==0){
    const query = `INSERT INTO item (IID) VALUES (?)`;
    db.query(query, [id], (err, result) => {
      if(err){
        return res.status(err);
      }else{
        console.log(query);
        return res.json({s: 'Success'});
      }
    })
  }
});

app.post('/deleteItem', (req, res) => {
  console.log(req.body.ID);
  const toBeDeleted = req.body.name;
  const path = `C:/ww/WEB_PRJ/uploads/${toBeDeleted}`; // 경로에 맞게 설정!!

  
  const query = `DELETE FROM item WHERE IID = '${req.body.ID}'`;
  db.query(query, (err) => {
    if(err){
      console.log(err);
      return res.status(err);
    }else{
      console.log(req.body.ID + 'deleted!');
      // 폴더 삭제
      fs.rmdir(path, { recursive: true }, (err) => {
        if (err) {
            console.error('Error deleting folder:', err);
            return res.status(500).json({ message: 'Failed to delete folder.' });
        } else {
            console.log(path + ' deleted successfully!');
            return res.json({ message: 'Item deleted successfully!' });
        }
    });
    }
  });

});


const absolutePath = path.resolve('~/WEB_PRJ');

app.use(express.static(absolutePath));


// 서버 시작
var server = app.listen(app.get('port'), function () {
  console.log('Server listening on port: ' + server.address().port); 
});

