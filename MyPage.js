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
            usernameElement.textContent = data.uname;
        } else {
            usernameElement.textContent = "must be logged in";
        }
    })
    .catch(error => console.error("CURRENT: ", error));

    
});