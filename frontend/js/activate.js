// Xử lý sự kiện khi người dùng nhấn nút Activate
document.getElementById('activateButton').addEventListener('click', async () => {
    const licenseKey = document.getElementById('licenseInput').value;
    const deviceId = `device-${Math.random().toString(36).substr(2, 9)}`; // Tạo giả Device ID (có thể thay bằng UUID thực tế)

    if (!licenseKey) {
        alert('Vui lòng nhập License Key!');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/activate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ licenseKey, deviceId })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('authToken', data.token); // Lưu token vào localStorage
            alert('Kích hoạt thành công!');
            window.location.href = '/index.html'; // Chuyển hướng đến trang chính
        } else {
            const error = await response.json();
            alert(error.message || 'Kích hoạt thất bại');
        }
    } catch (error) {
        // console.error('Error activating license:', error);
        alert('Đã xảy ra lỗi. Vui lòng thử lại.');
    }
});
