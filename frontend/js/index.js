// Kiểm tra trạng thái đăng nhập
(async () => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        window.location.href = '/login.html'; // Chuyển hướng nếu không có token
        return;
    }

    try {
        const response = await fetch('/check-auth', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 200) {
            const data = await response.json();
            const welcomeMessage = document.getElementById('welcomeMessage');
            if (welcomeMessage) {
                welcomeMessage.textContent = `Welcome, ${data.user.username}!`;
            }
        } else if (response.status === 401) {
            window.location.href = '/login.html'; // Chuyển hướng nếu hết hạn session
        }
    } catch {
        window.location.href = '/login.html'; // Chuyển hướng nếu xảy ra lỗi
    }
})();

// Kết nối WebSocket
(() => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        window.location.href = '/login.html'; // Chuyển hướng nếu không có token
        return;
    }

    const ws = new WebSocket(`ws://localhost:3000/ws?token=${token}`);

    ws.onopen = () => {
        ws.send('Hello from client!');
    };

    ws.onmessage = (event) => {
        // Xử lý tin nhắn từ server nếu cần
    };

    ws.onclose = () => {
        // Xử lý khi kết nối WebSocket bị đóng nếu cần
    };

    ws.onerror = () => {
        // Xử lý lỗi WebSocket nếu cần
    };
})();

// Xử lý nút Đăng xuất
document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutButton');

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('authToken'); // Xóa token khỏi localStorage
            const logoutMessage = document.getElementById('logoutMessage');
            if (logoutMessage) {
                logoutMessage.textContent = 'You have logged out.';
            }
            setTimeout(() => {
                window.location.href = '/login.html'; // Chuyển hướng sau 1 giây
            }, 1000);
        });
    }
});

// Kiểm tra trạng thái xác thực định kỳ
const checkAuthPeriodically = () => {
    setInterval(async () => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            window.location.href = '/login.html'; // Chuyển hướng nếu không có token
            return;
        }

        try {
            const response = await fetch('/check-auth', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                window.location.href = '/login.html'; // Chuyển hướng nếu hết hạn session
            }
        } catch {
            window.location.href = '/login.html'; // Chuyển hướng nếu xảy ra lỗi
        }
    }, 5000); // Kiểm tra mỗi 5 giây
};

// Gọi hàm kiểm tra định kỳ
checkAuthPeriodically();
