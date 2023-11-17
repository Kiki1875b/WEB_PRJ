document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login_form');
    
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      
      const username = document.getElementById('username_field').value;
      const password = document.getElementById('password_field').value;
  
      // 서버로 POST 요청 보내기
      fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${username}&password=${password}`,
      })
        .then(response => response.text())
        .then(data => {
          console.log(data); // 서버 응답 출력 (로그인 성공 또는 실패 메시지)
        })
        .catch(error => console.error('Error:', error));
    });
  });
  