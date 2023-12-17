document.addEventListener("DOMContentLoaded", ()=>{
    const searchInput = document.getElementById('searchTerm');

    searchInput.addEventListener('keyup', function (event) {
        if (event.key === 'Enter') {
        performSearch();
        }
    });

    fetch('popular')
    .then(response => response.json())
    .then(images => {
        console.log(images.length);
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
            imgElement.style.cursor = 'pointer';

                

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
                console.log(image.folderPath);
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

            const quantityInput = popup.document.createElement('input');
            quantityInput.type = 'number';
            quantityInput.min = '1';
            quantityInput.value = '1'; 


            addToCartButton.addEventListener('click', function() {
                const quantity = parseInt(quantityInput.value, 10); 

                if (isNaN(quantity) || quantity <= 0) {
                    popup.alert('Please enter a valid quantity.');
                    return;
                }
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
                    if (data.status === true) {
                        
                        console.log("username: ", data.username);
                        addToCart(data.uname, itemID, quantity);
                    } else {
                        popup.alert("must be logged in");
                    }
                })
                .catch(error => console.error("CURRENT: ", error));

            });
            popup.document.body.appendChild(quantityInput);
            popup.document.body.appendChild(addToCartButton);
            popup.document.body.appendChild(container);
            popup.document.write('</div></body></html>');
        })
        .catch(error => console.error("Error fetching folder imgs: ", error));
    },1000);
        
    }





});