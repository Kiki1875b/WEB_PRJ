document.addEventListener('DOMContentLoaded', () => {
    fetch('images')
    .then(response => response.json())
    .then(images => {
        const imageContainers = document.getElementById('imageContainer');
        console.log(images.length);
        images.forEach(image => {
            const imgElement = document.createElement('img');
            imgElement.src = image.path;
            imgElement.alt = image.alt;
            console.log(image.folderPath);
            const detailsButton = document.createElement('button');
            detailsButton.textContent = '상세정보';
            detailsButton.addEventListener('click', function () {
                
                showDetailedInformation(image.folderPath, image.iID);
            });

            const imageDiv = document.createElement('div');
            imageDiv.appendChild(imgElement);
            imageDiv.appendChild(detailsButton);
            imageContainers.appendChild(imageDiv);
        });
    })
    .catch(error => console.error("Error fetching images t:", error))

    function showDetailedInformation(folderPath, itemID) {
        const currentUrl = window.location.href;

        // 새로운 페이지 URL을 생성합니다. 이미 존재하는 파라미터가 있다면 '&'를 사용하고, 그렇지 않으면 '?'를 사용합니다.
        const newUrl = 'specific_page.html' + (currentUrl.includes('?') ? '&' : '?') + `folderPath=${encodeURIComponent(folderPath)}&IID=${encodeURIComponent(itemID)}`;
    
        // 새로운 페이지를 엽니다.
        const popup = window.open(newUrl, '_blank');
        setTimeout(() =>{
        fetch(`/images/${encodeURIComponent(folderPath)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ERROR! STATUS: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if(!popup || popup.closed) return;
            popup.location.href = newUrl;
            popup.document.write('<html><head><title>Detailed Information</title></head><body>');
            popup.document.write('<h1> Detailed Information</h1>');
            popup.document.write('<div class="popup" style="text-align: left;">'); // Set text-align to left
            
            

            const container = popup.document.createElement('div');
            container.style.maxWidth = '400px'
            data.folderImages.forEach(folderImage => {
                const imgElement = popup.document.createElement('img');
                imgElement.src = folderImage.path;
                imgElement.alt = folderImage.alt;
                imgElement.width = 300;
                imgElement.height = 300;

                container.appendChild(imgElement);
                
            });
            const addToCartButton = popup.document.createElement('button');
            addToCartButton.textContent = 'Add to Cart';

            addToCartButton.addEventListener('click', function() {
                fetch('check', {
                    method: 'POST',
                })
                .then(response => {
                    if (response.ok) {
                        return response.json(); // Parse the response as JSON
                    } else {
                        throw new Error(`HTTP ERROR! STATUS: ${response.status}`);
                    }
                })
                .then(data => {
                    // Now, 'data' contains the parsed JSON response
                    if (data.status === true) {
                        
                        console.log("username: ", data.username);
                        addToCart(data.uname, itemID);
                    } else {
                        popup.alert("must be logged in");
                    }
                })
                .catch(error => console.error("CURRENT: ", error));

            });
            popup.document.body.appendChild(addToCartButton);
            popup.document.body.appendChild(container);
            popup.document.write('</div></body></html>');
        })
        .catch(error => console.error("Error fetching folder imgs: ", error));
    },1000);
        
    }

    function addToCart(username, itemID){
        const data = {
            username: username,
            itemID: itemID
        };

        console.log(username, data.itemID);
    
        fetch('/addToCartEndpoint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            if (response.ok) {
                return response.json(); // Parse the response as JSON
            } else {
                throw new Error(`HTTP ERROR! STATUS: ${response.status}`);
            }
        })
        .then(result => {
            // 서버에서 반환된 결과를 처리합니다.
            console.log(result);
            // 여기에 서버의 응답에 따른 로직을 추가할 수 있습니다.
        })
        .catch(error => console.error("Error:", error));
    }
    
});


