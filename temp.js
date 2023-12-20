

document.addEventListener('DOMContentLoaded', function () {
    const addButton = document.getElementById('add-button');
    const removeButton = document.getElementById('cancel-button');
    const popup = document.getElementById('popup');
    const registerButton = document.getElementById('register');
    

    const timeBeforeScanTest = 200; // wait for the next character for upto 200ms
    const startChar = [120]; // Prefix character for the cabled scanner (OPL6845R)
    const avgTimeByChar = 40; // it's not a barcode if a character takes longer than 40ms

    let canScan = false;
    let scanning = false;
    let barcode = "";
    let lastCharTime = 0;
    
    addButton.addEventListener('click', function(){
        canScan = true;
        document.body.style.opacity = 0.5;
        // 화면 중간에 '바코드를 스켄하세요' 라는 문구를 표시
        const message = document.createElement('div');
        message.textContent = '바코드를 스캔하세요';
        message.style.position = 'absolute';
        message.style.top = '50%';
        message.style.left = '50%';
        message.style.transform = 'translate(-50%, -50%)';
        message.style.fontSize = '60px';
        //message.style.color = '';
        document.body.appendChild(message);
    })

    document.addEventListener('keydown', function(event) {
        if (canScan == false) return;
        console.log(canScan);
        const charCode = event.keyCode;
        // console.log(String.fromCharCode(charCode));
        // barcode += String.fromCharCode(charCode);
        if (scanning) {
            if (charCode === 13) {
            scanning = false;
            canScan = false;
            if (barcode.length > 0) {
                // Complete barcode detected
                canScan = false;
                scanning = false;
                console.log(barcode, canScan); // 바코드 출력
                data={
                    itemID: barcode
                };
                fetch('/insertItem',{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        },
                      body: JSON.stringify(data),
                })
                
                barcode = "";
                window.location.reload();
                
            }
            } else if (startChar.includes(charCode)) {
            // Ignore start character
            } else {
            const currentTime = Date.now();
            if (currentTime - lastCharTime > avgTimeByChar) {
                // Invalid character
                scanning = false;

                barcode = "";
            } else {
                barcode += String.fromCharCode(charCode);
                lastCharTime = currentTime;
            }
            }
        } else if (canScan) {
            scanning = true;
            barcode = "";
            barcode += String.fromCharCode(charCode);
            lastCharTime = Date.now();
        }
        //console.log(barcode);
    });

    setTimeout(() => {
    if (scanning) {
        scanning = false;
        console.warn("Barcode scan timed out");
    }
    }, timeBeforeScanTest);


    fetch('/items')
    .then(response => response.json())
    .then(result => {
    
        const serverData = [];

        result.data.forEach(item => {
            serverData.push([
            item.iid,
            item.iName,
            item.iCost,
            item.firstPart,
            item.category,
            item.soldCount,
            item.registerDate,
            11,
            11,
            ]);
        });
        
        console.log(serverData); // [{iid: 1, name: "상품1", price: 10000, image: "image1.jpg", category: "카테고리1", soldCount: 0, registeredDate: "2023-08-02T00:00:00.000Z"}, {iid: 2, name: "상품2", price: 20000, image: "image2.jpg", category: "카테고리2", soldCount: 10, registeredDate: "2023-08-03T00:00:00.000Z"}]
        // 테이블 헤더 추가
        const header = ['IID', '상품명', '가격', '이미지', '카테고리', '판매량', '등록일', '수정', '삭제'];
        createDynamicTable(serverData, header);
    })
    .catch(err => {console.log(err);});
    // 테이블을 동적으로 생성하는 함수
    function createDynamicTable(data, header) {
        // 테이블 컨테이너 요소를 가져오기
        var tableContainer = document.getElementById('table-container');
        // 테이블 요소 생성
        var table = document.createElement('table');
      
        // 테이블 헤더 생성
        var headerRow = table.insertRow();
        for (var key in header) {
          var th = document.createElement('th');
          th.textContent = header[key];
          headerRow.appendChild(th);
        }
      
        // 데이터를 테이블에 추가
        data.forEach(function (item) {
          var row = table.insertRow();
          var rowId = 'row_' + Math.random().toString(36).substr(2, 9);
          row.id = rowId;
          for (var key in item) {
            var cell = row.insertCell();
            if (key === 'imageUrl') {
              cell.innerHTML = '<img src="' + item[key] + '" alt="item image" style="max-width: 50px; max-height: 50px;">';
            } else if (key == 0 || key == 6) {
              cell.textContent = item[key];
              if(key == 0){
                cell.id = 'ID_' + rowId;
              }
              cell.setAttribute('contenteditable', false); // 수정 불가능하도록 설정
            } else if(key==1){
                cell.textContent = item[key];
                cell.setAttribute('contenteditable', true);
                cell.id = `N_${rowId}`;
            }
            else if(key == 3){
                cell.innerHTML = `
                <form action="/upload" method="post" enctype="multipart/form-data">
                    <label for="${rowId}_imageUpload">이미지를 선택하시오: </label>
                    <input type="file" name="item_image" id="${rowId}_item_image_field" class="register_item" accept="image/*" multiple>
                </form>`;
            } else if(key == 7){

                // var cell = row.insertCell();
                var button = document.createElement('button');
                button.textContent = '수정';
                cell.appendChild(button);

                      
                button.addEventListener('click', function() {
                    // 버튼이 눌렸을 때, 해당 row의 변경된 값을 가져오기
                    var values = [];
                    for (var i = 0; i < row.cells.length; i++) {
                    values.push(row.cells[i].textContent);
                    }

                    if (!/^\d+$/.test(values[2])) {
                        alert(`${values[0]}의 가격은 숫자만 입력해 주세요`);
                        return;
                    }


                    console.log("B: ", typeof(values[2]), values[2]);
                    if(values[1] == ''){
                        alert(`${values[0]} 의 상품명을 입력해 주세요`);
                        return;
                    }else if(values[2] == ''){
                        alert(`${values[0]} 의 가격을 입력해 주세요`);
                        return;
                    }else if(values[4] == ''){
                        values[4] = '-';
                    }
                    if(values[5] == ''){
                        values[5] = 0;
                    }
                    
                    var images = document.getElementById(`${rowId}_item_image_field`).files;
                    console.log(images.length);
                    changeTable(values[0], values[1], values[2], values[4], values[5], images);
                    
                });
            }else if(key == 8){
                var button = document.createElement('button');
                button.textContent = '삭제';
                cell.appendChild(button);
                button.addEventListener('click', function(){
                    var temp = document.getElementById(`ID_${rowId}`);
                    var temp2 = document.getElementById(`N_${rowId}`);
                    fetch('deleteItem', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: `ID=${temp.textContent}&name=${temp2.textContent}`,
                      });

                    window.location.reload();
                });
            } else {
              cell.textContent = item[key];
              cell.setAttribute('contenteditable', true); // 수정 가능하도록 설정
            }
          }
          
        //   var cell = row.insertCell();
        //   var button = document.createElement('button');
        //   cell.appendChild(button);
        //   button.textContent = '수정';
      
        //   button.addEventListener('click', function() {
        //     // 버튼이 눌렸을 때, 해당 row의 변경된 값을 가져오기
        //     var values = [];
        //     for (var i = 0; i < row.cells.length; i++) {
        //       values.push(row.cells[i].textContent);
        //     }

        //     if (!/^\d+$/.test(values[2])) {
        //         alert(`${values[0]}의 가격은 숫자만 입력해 주세요`);
        //         return;
        //     }


        //     console.log("B: ", typeof(values[2]), values[2]);
        //     if(values[1] == ''){
        //         alert(`${values[0]} 의 상품명을 입력해 주세요`);
        //         return;
        //     }else if(values[2] == ''){
        //         alert(`${values[0]} 의 가격을 입력해 주세요`);
        //         return;
        //     }else if(values[4] == ''){
        //         values[4] = '-';
        //     }
        //     if(values[5] == ''){
        //         values[5] = 0;
        //     }
            



        //     var images = document.getElementById(`${rowId}_item_image_field`).files;
        //     console.log(images.length);
        //     changeTable(values[0], values[1], values[2], values[4], values[5], images);
            
        //   });
      
          //row.appendChild(button);
        });
        // 테이블 컨테이너에 테이블 추가
        tableContainer.appendChild(table);
      }

      function changeTable(itemID, itemName, itemCost, itemCategory, itemSoldCount, imageFile){
    //     console.log(imageFile);
    //     const data ={
    //         itemID: itemID,
    //         itemName: itemName,
    //         itemCost: itemCost,
    //         itemCategory: itemCategory,
    //         itemSoldCount: itemSoldCount
    //     };

    //     fetch('/updateItem', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //         },
    //       body: JSON.stringify(data),
    //     })
            const formData = new FormData();
            formData.append('itemID', itemID);
            formData.append('itemName', itemName);
            formData.append('itemCost', itemCost);
            formData.append('itemCategory', itemCategory);
            formData.append('itemSoldCount', itemSoldCount);
        
            // 이미지 파일 추가
            if (imageFile) {
                //formData.append('imageFile', imageFile);
                for (const file of imageFile) {
                    formData.append('imageFile', file);
                }
        
            }
        
            fetch('/updateItem', {
                method: 'POST',
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
            // 업데이트 성공 처리
            })
            .catch(error => {
            // 에러 처리
            });
    }

    //createDynamicTable(serverData);
});
