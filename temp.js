document.addEventListener('DOMContentLoaded', function () {
    // 서버에서 가져온 가상의 데이터 (실제로는 서버에서 데이터를 받아오는 로직이 필요합니다)
    var serverData = [
        { barcode: '123456', itemName: 'Item 1', itemCost: '$10', itemCount: 5, itemCategory: 'Category A', itemColor: 'Red', imageUrl: 'image1.jpg' },
        { barcode: '789012', itemName: 'Item 2', itemCost: '$20', itemCount: 3, itemCategory: 'Category B', itemColor: 'Blue', imageUrl: 'image2.jpg' },
        // ... 더 많은 데이터
    ];

    // 테이블을 동적으로 생성하는 함수
    function createDynamicTable(data) {
        // 테이블 컨테이너 요소를 가져오기
        var tableContainer = document.getElementById('table-container');

        // 테이블 요소 생성
        var table = document.createElement('table');

        // 테이블 헤더 생성
        var headerRow = table.insertRow();
        for (var key in data[0]) {
            var th = document.createElement('th');
            th.textContent = key;
            headerRow.appendChild(th);
        }

        data.forEach(function (item) {
            var row = table.insertRow();
            for (var key in item) {
                var cell = row.insertCell();
                cell.textContent = item[key];

                if (key === 'imageUrl') {
                    cell.innerHTML = '<img src="' + item[key] + '" alt="item image" style="max-width: 50px; max-height: 50px;">';
                }
            }
        });

        tableContainer.appendChild(table);
    }

    createDynamicTable(serverData);
});
