import { database } from './firebase-config.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

const API_BASE_URL = 'http://localhost:3000';

// Hàm lấy danh sách License Key từ Firebase và hiển thị
async function fetchLicenseKeys() {
    try {
        const response = await fetch(`${API_BASE_URL}/list-licenses`);
        if (!response.ok) {
            throw new Error('Failed to fetch license keys');
        }
        const licenses = await response.json();
        renderLicenseKeys(licenses);
    } catch (error) {
        console.error('Error fetching license keys:', error);
        document.getElementById('message').textContent = 'Không thể tải danh sách License Key.';
    }
}

// Hàm hiển thị danh sách License Key lên bảng
function renderLicenseKeys(licenses) {
    // Chuyển đổi dữ liệu từ Object sang Array
    const licensesArray = Object.entries(licenses).map(([licenseKey, licenseData]) => ({
        licenseKey,
        ...licenseData,
    }));

    const tableBody = document.getElementById('licenseTableBody');
    tableBody.innerHTML = ''; // Xóa nội dung cũ

    licensesArray.forEach(license => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${license.licenseKey}</td>
            <td>${license.deviceId || 'Chưa sử dụng'}</td>
            <td>${license.active ? 'Hoạt động' : 'Bị thu hồi'}</td>
            <td>
                <button onclick="revokeLicense('${license.licenseKey}')">Thu hồi</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}



// Hàm gửi yêu cầu thu hồi License Key
async function revokeLicense(licenseKey) {
    try {
        const response = await fetch(`${API_BASE_URL}/revoke-license`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ licenseKey })
        });

        if (response.ok) {
            document.getElementById('message').textContent = `License Key "${licenseKey}" đã được thu hồi.`;
            fetchLicenseKeys(); // Tải lại danh sách sau khi thu hồi
        } else {
            const data = await response.json();
            document.getElementById('message').textContent = `Thu hồi thất bại: ${data.message}`;
        }
    } catch (error) {
        console.error('Error revoking license:', error);
        document.getElementById('message').textContent = 'Lỗi khi thu hồi License Key.';
    }
}

// Lấy danh sách License Key khi trang được tải
document.addEventListener('DOMContentLoaded', fetchLicenseKeys);
window.revokeLicense = revokeLicense; // Đảm bảo hàm có thể gọi được từ HTML
