document.addEventListener('DOMContentLoaded', () => {
    
    fetch('check', {
        method: 'POST',
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(`HTTP ERROR! STATUS: ${response.status}`);
        }
    })
    .then(data => {
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
    .then(data => {
        const contentsNewProductContainer = document.querySelector('.contents-temp-product-container');
        let totalCost = 0;
        if(data.extractedPaths.length == 0) {
            const nth = document.createElement('div');
            nth.textContent = "NO ITEM IN CART";
            contentsNewProductContainer.appendChild(nth);
        };
        
        if (data.extractedPaths && data.extractedPaths.length > 0) {
          data.extractedPaths.forEach(item => {

            console.log(item.CartNum);
            const container = document.createElement('div');
            container.classList.add('contents-temp-product-one-style', 'contents-new-product-container-border');
    
            const img = document.createElement('img');
            img.src = item.ItemImage; 
            img.alt = 'Image';
            img.style.display = 'block';
            img.style.marginBottom = '20px';
            container.appendChild(img);
            
            const cancelButton = document.createElement('button');
            cancelButton.style.position = 'absolute';
            cancelButton.style.top = '0';
            cancelButton.style.right = '0';
            cancelButton.style.margin = '5px';
            cancelButton.textContent = "Cancel";

            cancelButton.addEventListener('click', () => {
                cancelFromCart(item.CartNum)    
            });

            container.appendChild(cancelButton);

            const itemCount = document.createElement('div');
            itemCount.textContent = `Item Count: ${item.ItemCount}`;
            container.appendChild(itemCount);
            
            const totalPriceForItem = document.createElement('div');
            const itemTotal = item.ItemCount * item.ICost;
            totalPriceForItem.textContent = `Total Price: ${itemTotal}`;
            container.appendChild(totalPriceForItem);

            totalCost += itemTotal;
            
            contentsNewProductContainer.appendChild(container);
          });
        
        const overallTotal = document.createElement('div');
        overallTotal.textContent = `Overall Total: ${totalCost}`;
        contentsNewProductContainer.appendChild(overallTotal);
        } else {
          console.log('No images to display');
        }
      })
      .catch(err => {
        console.log("ERROR: " + err);
      });



      function cancelFromCart(cartNum){
        console.log(cartNum);
        fetch('removeCart',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({cartNumber: cartNum}),
        })
        .then(response => response.json())
        .then(response =>{
            if(response.status === "success"){
                window.location.reload();
            }
        });

      }
    
    
});