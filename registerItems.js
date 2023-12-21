document.addEventListener('DOMContentLoaded', function () {
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };
    const isAdmin = () => {
        const isAdminString = getCookie('isAdmin');
        return isAdminString === 'true'; // Convert the string to a boolean
    };
    if(!isAdmin()){
        document.body.style.display = 'none';
        alert('Unauthorized access!');
        window.location.href = 'main.html';

        return;
    }
    console.log(isAdmin());




    const submitButton = document.getElementById('submit_item_info');

    submitButton.addEventListener('click', function(){
        const itemName = document.getElementById('item_name_field').value;
        const itemCost = document.getElementById('item_cost_field').value;
       
        const itemCount = document.getElementById('item_count_field').value;
        const itemCategory = document.getElementById('item_category_field').value;
        const itemColor = document.getElementById('item_color_field').value;
        const deliveryInfo = document.getElementById('delivery_info_field').value;

        const itemImage = document.getElementById('item_image_field');
        const selectedImages = itemImage.files;


        const formData = new FormData();
        formData.append('item_name', itemName);
        formData.append('item_cost', itemCost);
        formData.append('item_count', itemCount);
        formData.append('item_category', itemCategory);
        formData.append('item_color', itemColor);
        formData.append('delivery_info', deliveryInfo);
        
        for (const file of selectedImages) {
            formData.append('item_image', file);
        }


        fetch('/upload', {
            method: 'POST',
            body: formData,
            
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text(); // JSON이 아닌 경우 텍스트로 읽기
        })
        .then(data => {
            console.log('Success:', data);
            // 서버에서 반환한 데이터에 대한 처리
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });
});