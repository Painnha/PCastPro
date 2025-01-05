import { database } from './firebase-config.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Kết nối WebSocket
const initializeWebSocket = (token) => {
    const ws = new WebSocket(`ws://localhost:3000/ws?token=${token}`);

    ws.onopen = () => {
        console.log('WebSocket connection established.');
        ws.send('Hello from client!');
    };

    ws.onmessage = (event) => {
        console.log('Message from server:', event.data);
    };

    ws.onclose = () => {
        console.log('WebSocket connection closed.');
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
};

// Kiểm tra License Key
const checkLicenseKey = async () => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        alert('Vui lòng kích hoạt License Key');
        window.location.href = '/activate.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/check-license', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            alert('License Key không hợp lệ. Vui lòng kích hoạt lại.');
            localStorage.removeItem('authToken');
            window.location.href = '/activate.html';
        }
    } catch (error) {
        console.error('Error checking license:', error);
        alert('Không thể kiểm tra License Key. Vui lòng thử lại.');
        window.location.href = '/activate.html';
    }
};

// Gọi hàm kiểm tra License Key
(async () => {
    await checkLicenseKey();
})();

// Kích hoạt License Key nếu chưa có
const activateLicenseKey = async () => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        const licenseKey = prompt('Nhập License Key của bạn:');
        if (!licenseKey) {
            alert('License Key không được để trống!');
            window.location.href = '/activate.html';
            return;
        }
        const deviceId = 'unique-device-id'; // Có thể thay bằng UUID hoặc MAC Address thực tế

        try {
            const response = await fetch('http://localhost:3000/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ licenseKey, deviceId })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('authToken', data.token);
                alert('Kích hoạt thành công!');
                return true;
            } else {
                const data = await response.json();
                alert(data.message || 'Kích hoạt thất bại');
                window.location.href = '/activate.html';
                return false;
            }
        } catch (error) {
            console.error('Error activating license:', error);
            alert('Đã có lỗi xảy ra. Vui lòng thử lại.');
            window.location.href = '/activate.html';
            return false;
        }
    }
    return true;
};

// Xử lý nút Đăng xuất
const initializeLogout = () => {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('authToken'); // Xóa token khỏi LocalStorage
            const logoutMessage = document.getElementById('logoutMessage');
            if (logoutMessage) {
                logoutMessage.textContent = 'Bạn đã đăng xuất.';
            }
            setTimeout(() => {
                window.location.href = '/activate.html'; // Chuyển hướng sau 1 giây
            }, 1000);
        });
    }
};

// Kiểm tra trạng thái xác thực định kỳ
const checkAuthPeriodically = () => {
    setInterval(async () => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            window.location.href = '/activate.html';
            return;
        }

        try {
            const response = await fetch('/check-auth', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                localStorage.removeItem('authToken');
                window.location.href = '/activate.html';
            }
        } catch (error) {
            console.error('Error checking authentication:', error);
            window.location.href = '/activate.html';
        }
    }, 60000); // Kiểm tra mỗi 60 giây
};

// Khởi tạo các chức năng
(async () => {
    const isActivated = await activateLicenseKey(); // Kích hoạt License Key nếu chưa có
    if (!isActivated) return;

    const isValidLicense = await checkLicenseKey(); // Kiểm tra License Key hợp lệ
    if (!isValidLicense) return;

    const token = localStorage.getItem('authToken');
    if (token) {
        initializeWebSocket(token); // Kết nối WebSocket sau khi kiểm tra License Key
    }
    initializeLogout(); // Thiết lập nút Đăng xuất
    checkAuthPeriodically(); // Kiểm tra trạng thái định kỳ
})();
