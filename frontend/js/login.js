document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#loginForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.querySelector('#username').value;
        const password = document.querySelector('#password').value;

        console.log('Username:', username);
        console.log('Password:', password);

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('authToken', data.token);
                window.location.href = '/index.html';
            } else {
                const data = await response.json();
                alert(data.message || 'Login failed!');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred. Please try again.');
        }
    });
});
