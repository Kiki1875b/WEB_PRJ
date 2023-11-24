document.addEventListener('DOMContentLoaded', () => {
    fetch('images')
    .then(response => response.json())
    .then(images => {
        const contentsNewProductContainer = document.querySelector('.contents-new-product-container');

        images.forEach(image => {
            const container = document.createElement('div');
            container.classList.add('contents-new-product-one-style', 'contents-new-product-container-border');

            const imgElement = document.createElement('img');
            imgElement.src = image.path;
            imgElement.alt = image.alt;

            const textContainer = document.createElement('div');
            textContainer.classList.add('text-container');
            const textLine1 = document.createElement('div');
            const textLine2 = document.createElement('div');

            textLine1.textContent = image.itemName;
            textLine2.textContent = image.itemCost + '원';

            textContainer.appendChild(textLine1);
            textContainer.appendChild(textLine2);

            container.appendChild(imgElement);
            container.appendChild(textContainer);

            container.addEventListener('click', () => {
                
                showDetailedInformation(image.folderPath, image.iID);
            });

            contentsNewProductContainer.appendChild(container);
        });
        return fetch('popular');
    })
    .then(response => response.json())
    .then(images => {
        console.log(images);
        const contentsPopularProductContainer = document.querySelector('.contents-popular-product-container');
        images.forEach(image =>{
            if (Object.keys(image).length === 0 && image.constructor === Object) {
                return;
            }
            const container = document.createElement('div');
            container.classList.add('contents-popular-products-one-style', 'contents-popular-product-container-border');
            
            const imgElement = document.createElement('img');
            imgElement.src = image.path;
            imgElement.alt = image.alt;

            

            const textContainer = document.createElement('div');
            textContainer.classList.add('text-container');
            const textLine1 = document.createElement('div');
            const textLine2 = document.createElement('div');

            textLine1.textContent = image.itemName;
            textLine2.textContent = image.itemCost + '원';

            textContainer.appendChild(textLine1);
            textContainer.appendChild(textLine2);

            container.appendChild(imgElement);
            container.appendChild(textContainer);

            container.addEventListener('click', () => {
                showDetailedInformation(image.folderPath, image.iID);
            });
            
            contentsPopularProductContainer.appendChild(container);
            console.log(container);
        });     
    })
    .catch(error => console.error("Error fetching imgs:", error));

    function showDetailedInformation(folderPath, itemID) {
        const currentUrl = window.location.href;

        
        const newUrl = 'specific_page.html' + (currentUrl.includes('?') ? '&' : '?') + `folderPath=${encodeURIComponent(folderPath)}&IID=${encodeURIComponent(itemID)}`;
    

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
            popup.document.write('<div class="popup" style="text-align: left;">'); 
            
            

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
                return response.json(); 
            } else {
                throw new Error(`HTTP ERROR! STATUS: ${response.status}`);
            }
        })
        .then(result => {
            
            console.log(result);
            
        })
        .catch(error => console.error("Error:", error));
    }
    
});


