document.addEventListener('DOMContentLoaded', function () {

    const productButton = document.getElementById('product-button');

    productButton.addEventListener('click', () => {
        window.location.href ="temp.html";
    });

    fetch('orders')
    .then(response => response.json())
    .then(data => {
        const serverData = [];
        const header = ['주문번호', '아이디', '상품 바코드', '주문 수량', '상품 이름', '연락처', '이메일', '총가격', '주소', '취소'];
        data.reply.forEach(item =>{
            serverData.push([
                item.cart,
                item.user,
                item.itemID,
                item.count,
                item.itemName,
                item.contact,
                item.email,
                item.totalCost,
                item.addr,
                1,

            ]);
        });
        //console.log(serverData);
        createTable(serverData, header);

    });

    function createTable(data, header){
        var tableContainer = document.getElementById('table-container');
        var table = document.createElement('table');
        var headerRow = table.insertRow();
        for (var key in header){
            var th = document.createElement('th');
            th.textContent = header[key];
            headerRow.appendChild(th);
        }
        data.forEach(function (item){
            var row = table.insertRow();
            for (var key in item){
                
                console.log(key);
                if(key == 9){
                    var cell = row.insertCell();
                    var button = document.createElement('button');
                    button.textContent = '취소';
                    cell.appendChild(button);
                    button.addEventListener('click', function() {
                        fetch('deleteOrder',{
                            method:'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded',},
                            body: `order=${item[0]}`,
                        })
                        .then(response => response.json())
                        .then(data =>{
                            if(data.result === 'Success'){
                                alert('successfully deleted order');
                                window.location.reload();
                            }else{
                                alert('Failed');
                            }
                        });
                        
                    });
                }else{
                    var cell = row.insertCell();
                    cell.textContent = item[key];
                }
            }
        });
        tableContainer.appendChild(table);
    }
});