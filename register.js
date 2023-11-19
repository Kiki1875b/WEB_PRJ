document.addEventListener('DOMContentLoaded', function () {
    const userID = document.getElementById('username_field');
    const password_a = document.getElementById('password_field');
    const password_b = document.getElementById('vpassword_field');
    const phone_number = document.getElementById('phoneNum_field');
    const addressField = document.getElementById('address_field');
    const specific_addressField = document.getElementById('specific_address_field');
    const combinedAddressField = document.getElementById('combined_address_field');
    const email = document.getElementById('email_field');
    const sex = document.getElementById('sex_field');
    
    const registerButton = document.getElementById('register_submits');

    function openAddressPopup() {
        new daum.Postcode({
            oncomplete: function (data) {
                // 주소 입력 필드에 선택된 주소 적용
                addressField.value = data.address;
            }
        }).open();
    }

    registerButton.addEventListener('click', function (event) {
        
        event.preventDefault();
        const username = userID.value;
        const password = password_a.value;
        const phoneNum = phone_number.value;
        const address = addressField.value + " " + specific_addressField.value;
        const temail = email.value;
        const tsex = sex.value;
        
        console.log(address);

        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `username=${username}&password=${password}&phoneNum=${phoneNum}&address=${address}&email=${temail}&sex=${tsex}`,
        })
        .then(response => response.text())
        .then(data =>{
            console.log(data);
        })
        .catch(error => console.log(error));


    
    });

    addressField.addEventListener('click', openAddressPopup);
});