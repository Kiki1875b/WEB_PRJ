document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById('searchTerm');
    const form = document.querySelector('form');
    const select = form.querySelector('select');
    const contentsPopularProductContainer = document.querySelector('.contents-popular-product-container');

    let images = [];

    const renderImages = () => {
        contentsPopularProductContainer.innerHTML = ''; // Clear previous content

        images.forEach((image) => {
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
        });
    };

    const sortImages = (sortBy) => {
        // Sort the images array based on the selected value
        
        if(sortBy=='cheap-order'){
            images.sort((a, b) => {
                const itemA = a.itemCost;
                const itemB = b.itemCost;
                console.log(typeof(a.registerDate), a.registerDate);
                
                return itemA - itemB;
            });
        }else if(sortBy=='expensive-order'){
            images.sort((a, b) => {
                const itemA = a.itemCost;
                const itemB = b.itemCost;
                
                
                return -(itemA - itemB);
            });
        }else if(sortBy=='old-order'){
            images.sort((a,b) => {
                const dateA = new Date(a.registerDate);
                const dateB = new Date(b.registerDate);

                return dateA - dateB;
            });
        }else if(sortBy=='recent-order'){
            images.sort((a,b) => {
                const dateA = new Date(a.registerDate);
                const dateB = new Date(b.registerDate);

                return -(dateA - dateB);
            })
        }
    
       
        renderImages();
    };

    // Fetch initial images
    fetch('new')
        .then(response => response.json())
        .then(data => {
            images = data; // Assign the fetched data to the global images array
            renderImages();

            select.addEventListener('change', () => {
                sortImages(select.value);
            });

            // ... Your existing code

        })
        .catch(error => console.error("Error fetching imgs:", error));

//////////////////
function showDetailedInformation(folderPath, itemID) {
    const currentUrl = window.location.href;
    const newUrl = 'specific_page.html' + (currentUrl.includes('?') ? '&' : '?') + `folderPath=${encodeURIComponent(folderPath)}&IID=${encodeURIComponent(itemID)}`;

    const popup = window.open(newUrl, '_blank');
    setTimeout(() => {
        fetch(`/images/${encodeURIComponent(folderPath)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ERROR! STATUS: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (!popup || popup.closed) return;
                popup.location.href = newUrl;
                popup.document.write('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="stylesheet" href="./styles/specific_page.css"><title>Detailed Information</title></head><body>');
                popup.document.write("<img src=\"./assets/morning-glory-1.png\" onclick=\"location.href='main.html'\" alt=\"morning-glory-logo\" class=\"morning-glory-style\" id=\"logo\">");
                popup.document.write('<div class="mainbar-style">');
                popup.document.write("<button onclick=\"location.href='new-product.html'\" class=\"new-product-btn-style\">신상</button>");
                popup.document.write("<button onclick=\"location.href='popular-products.html'\" class=\"popular-products-btn-style\">인기제품</button>");
                popup.document.write("<button onclick=\"location.href='category.html'\" class=\"category-btn-style\">품목</button>");
                popup.document.write('<div class="search-style">');
                popup.document.write('<input type="text" placeholder="검색어를 입력해 주세요" name="searchTerm" id="searchTerm" class="search-text-style">');
                popup.document.write("</div>");
                popup.document.write("<button onclick=\"location.href='announcement.html'\" class=\"announcement-btn-style\">공지사항</button>");
                popup.document.write("<button onclick=\"location.href='shopping-basket.html'\" class=\"shopping-basket-btn-style\">장바구니</button>");
                popup.document.write("<button onclick=\"location.href='login.html'\" class=\"login-btn-style\">로그인</button>");
                popup.document.write('</div>');
                popup.document.write('<h1>상품추가</h1>');
                
                
                const bigContainer = popup.document.createElement('div');
                bigContainer.className = 'bigContainer';

                const container = popup.document.createElement('div');
                container.className = 'container';
                
                container.style.maxWidth = '400px';

                const currentIndex = { value: 0 };

                function showImage(index) {
                    const folderImage = data.folderImages[index];
                    const imgElement = popup.document.createElement('img');
                    imgElement.src = folderImage.path;
                    imgElement.alt = folderImage.alt;
                    imgElement.width = 300;
                    imgElement.height = 300;

                    container.innerHTML = ''; // Clear previous content
                    container.appendChild(imgElement);
                }

                
                const addToCartButton = popup.document.createElement('button');
                addToCartButton.className = 'addToCartButton';
                addToCartButton.textContent = '장바구니 추가';

                const quantityInput = popup.document.createElement('input');
                quantityInput.className = 'quantityInput';
                quantityInput.type = 'number';
                quantityInput.min = '1';
                quantityInput.value = '1'; // You can set a default value if needed


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
                        // Now, 'data' contains the parsed JSON response
                        if (data.status === true) {
                            
                            console.log("username: ", data.username);
                            addToCart(data.uname, itemID, quantity);
                        } else {
                            popup.alert("must be logged in");
                        }
                    })
                    .catch(error => console.error("CURRENT: ", error));
                });
                


                showImage(currentIndex.value);

                const prevButton = popup.document.createElement('button');
                prevButton.className = 'prevButton';
                //prevButton.textContent = 'Previous';
                prevButton.addEventListener('click', function () {
                    currentIndex.value = (currentIndex.value - 1 + data.folderImages.length) % data.folderImages.length;
                    showImage(currentIndex.value);
                });

                const nextButton = popup.document.createElement('button');
                nextButton.className = 'nextButton';
                //nextButton.textContent = 'Next';
                nextButton.addEventListener('click', function () {
                    currentIndex.value = (currentIndex.value + 1) % data.folderImages.length;
                    showImage(currentIndex.value);
                });
                
                popup.document.body.appendChild(bigContainer);
                bigContainer.appendChild(prevButton);
                bigContainer.appendChild(container);
                bigContainer.appendChild(nextButton)


                // popup.document.body.appendChild(container);
                // popup.document.body.appendChild(prevButton);
                // popup.document.body.appendChild(nextButton);
                popup.document.body.appendChild(quantityInput);
                popup.document.body.appendChild(addToCartButton);
                popup.document.write('<div class="bottombar-style">2023 WEB SW Studio and Talent Donation</div>');
                popup.document.write('</body></html>');
            })
            .catch(error => console.error("Error fetching folder imgs: ", error));
    }, 1000);
}


function addToCart(username, itemID, quantity){
        const data = {
            username: username,
            itemID: itemID,
            quantity: quantity
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

    function performSearch(){
        const searchTerm = searchInput.value.trim();

        if(searchTerm !== ''){
            fetch(`/search?searchTerm=${encodeURIComponent(searchTerm)}`)
            .then(response => response.json())
            .then(data => {

                
                displaySearchResults(data);
            })
            .catch(error => console.error("Error:", error));
        }
    }

    function displaySearchResults(result){

        const contentsNewProductContainer = document.querySelector('.contents-new-product-container');
        const popularContainer = document.querySelector('.contents-popular-products-style');
        const title = document.getElementById('mainTitle');
        title.textContent = "검색 결과";
        contentsNewProductContainer.innerHTML = '';
        popularContainer.innerHTML = '';
        console.log(result.data);
        if(result){
            result.data.forEach(result => {
                const container = document.createElement('div');
                container.classList.add('contents-new-product-one-style', 'contents-new-product-container-border');

                const imgElement = document.createElement('img');
                imgElement.src = result.firstPart;
                imgElement.alt = result.iName;
                imgElement.style.cursor = 'pointer';

                const textContainer = document.createElement('div');
                textContainer.classList.add('text-container');
                const textLine1 = document.createElement('div');
                const textLine2 = document.createElement('div');
    
                textLine1.textContent = result.iName;
                textLine2.textContent = result.iCost + '원';
    
                textContainer.appendChild(textLine1);
                textContainer.appendChild(textLine2);
    
                container.appendChild(imgElement);
                container.appendChild(textContainer);

                container.addEventListener('click', () => {
                
                    showDetailedInformation(result.iName, result.iid);
                });
    
                contentsNewProductContainer.appendChild(container);
            });
        }

    }


});
