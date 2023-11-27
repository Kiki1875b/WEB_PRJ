document.addEventListener('DOMContentLoaded', () => {
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
        const usernameElement = document.getElementById('username');

        if (data.status === true) {
            usernameElement.textContent = "Welcome " + data.uname;
            return fetch('mypage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({UID: data.uname}),
            });
        } else {
            usernameElement.textContent = "must be logged in";
        }
    })
    .then(response => response.json())
    .then(data =>{
        
        console.log(data);
        const phone_num = document.getElementById('phoneNumber');
        const address = document.getElementById('address'); 
        const email = document.getElementById('email');
        const registerDate = document.getElementById('registerDate');

        phone_num.textContent = data.phone_num;
        address.textContent = data.address;
        email.textContent = data.email;
        registerDate.textContent = data.registerDate;

        return fetch('cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({UID: data.username}),
        });
        
    })
    .then(response => response.json())
    .then(data =>{
        const contentsNewProductContainer = document.querySelector('.contents-temp-product-container');
        if (data.extractedPaths && data.extractedPaths.length > 0) {
            data.extractedPaths.forEach(path => {
                const container = document.createElement('div');
                container.classList.add('contents-temp-product-one-style', 'contents-new-product-container-border');

                const img = document.createElement('img');
                img.src = path;
                img.alt = 'Image';
                img.style.display = 'block';
                img.style.marginBottom = '20px';
                container.appendChild(img);
                contentsNewProductContainer.appendChild(container); 
            });
            
        } else {
            console.log('No images to display');
        }

    })
    .catch(err =>{
        console.log("ERROR2: " + err);
    });
    
    
});