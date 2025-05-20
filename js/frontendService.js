document.addEventListener('DOMContentLoaded', function () {
    // 检查登录
    if (!auth.isLoggedIn()) {
        alert('请先登录');
        window.location.href = '../frontend/logIn.html';
        return;
    }

    // 加载服务跟踪
    loadServiceTracking();

    // 表单提交事件
    document.getElementById('serviceRequestForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const user = auth.getCurrentUser();
        const roomNumber = document.getElementById('roomNumber').value.trim();
        const serviceType = document.getElementById('serviceType').value;
        const description = document.getElementById('description').value.trim();
        const expectedTime = document.getElementById('expectedTime').value;

        if (!roomNumber || !serviceType || !description || !expectedTime) {
            alert('请完整填写所有信息');
            return;
        }

        // 保存到localStorage
        const requests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
        requests.push({
            userId: user.id,
            userName: user.name,
            roomNumber,
            serviceType,
            description,
            expectedTime,
            submitTime: new Date().toISOString(),
            status: '待处理'
        });
        localStorage.setItem('serviceRequests', JSON.stringify(requests));

        alert('服务申请已提交！');
        this.reset();
        loadServiceTracking();
    });
});

// 加载并显示当前用户的服务跟踪
function loadServiceTracking() {
    const user = auth.getCurrentUser();
    const list = document.getElementById('trackingList');
    list.innerHTML = '';
    const requests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
    const myRequests = requests.filter(r => r.userId === user.id);
    if (myRequests.length === 0) {
        list.innerHTML = '<p>暂无服务记录。</p>';
        return;
    }
    myRequests.reverse().forEach(req => {
        const div = document.createElement('div');
        div.className = 'tracking-item';
        div.innerHTML = `
            <div><strong>房间号：</strong>${req.roomNumber}</div>
            <div><strong>类型：</strong>${req.serviceType}</div>
            <div><strong>需求：</strong>${req.description}</div>
            <div><strong>期望时间：</strong>${formatDateTime(req.expectedTime)}</div>
            <div><strong>提交时间：</strong>${formatDateTime(req.submitTime)}</div>
            <div><strong>状态：</strong><span class="status">${req.status}</span></div>
            <hr>
        `;
        list.appendChild(div);
    });
}

// 格式化时间
function formatDateTime(str) {
    if (!str) return '';
    const d = new Date(str);
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0') + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
}
