// 费用数据
let expensesData = {
    roomCharges: [],
    diningCharges: [],
    serviceCharges: []
};

// 费用类型枚举
const ExpenseType = {
    ROOM: '房费',
    DINING: '餐饮',
    SERVICE: '服务'
};

// 初始化页面
document.addEventListener('DOMContentLoaded', async function() {
    // 检查登录状态
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'logIn.html';
        return;
    }

    try {
        // 加载JSON数据
        const response = await fetch('data/expenses.json');
        const data = await response.json();
        
        // 更新费用数据
        expensesData = data.mockExpenses;
        
        // 更新显示
        updateExpensesTable();
        updateSummary();
        
        // 初始化支付方式
        initializePaymentMethods(data.paymentMethods);
    } catch (error) {
        console.error('加载数据失败:', error);
        alert('加载数据失败，请刷新页面重试');
    }
});

// 初始化支付方式
function initializePaymentMethods(paymentMethods) {
    const container = document.querySelector('.payment-methods');
    if (!container) return;

    // 清空现有的支付方式
    container.innerHTML = '<h3>选择支付方式</h3>';

    // 添加支付方式
    Object.entries(paymentMethods).forEach(([key, method]) => {
        if (method.enabled) {
            const paymentOption = document.createElement('div');
            paymentOption.className = 'payment-option';
            paymentOption.onclick = () => selectPayment(key);
            paymentOption.innerHTML = `
                <img src="image/${method.icon}" alt="${method.name}">
                <span>${method.name}</span>
            `;
            container.appendChild(paymentOption);
        }
    });
}

// 更新费用表格
function updateExpensesTable() {
    const tableBody = document.getElementById('expensesTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    // 合并所有费用数据
    const allCharges = [
        ...expensesData.roomCharges,
        ...expensesData.diningCharges,
        ...expensesData.serviceCharges
    ];

    // 按日期排序
    allCharges.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 创建表格行
    allCharges.forEach(charge => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(charge.date)}</td>
            <td>${charge.item}</td>
            <td>${charge.type}</td>
            <td>${charge.quantity}</td>
            <td>¥${charge.price.toFixed(2)}</td>
            <td>¥${charge.amount.toFixed(2)}</td>
        `;
        tableBody.appendChild(row);
    });
}

// 更新费用汇总
function updateSummary() {
    // 计算各类费用总额
    const roomTotal = calculateTotal(expensesData.roomCharges);
    const diningTotal = calculateTotal(expensesData.diningCharges);
    const serviceTotal = calculateTotal(expensesData.serviceCharges);
    const grandTotal = roomTotal + diningTotal + serviceTotal;

    // 更新显示
    document.getElementById('roomTotal').textContent = `¥${roomTotal.toFixed(2)}`;
    document.getElementById('diningTotal').textContent = `¥${diningTotal.toFixed(2)}`;
    document.getElementById('serviceTotal').textContent = `¥${serviceTotal.toFixed(2)}`;
    document.getElementById('grandTotal').textContent = `¥${grandTotal.toFixed(2)}`;
}

// 计算总额
function calculateTotal(charges) {
    return charges.reduce((total, charge) => total + charge.amount, 0);
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// 选择支付方式
function selectPayment(method) {
    // 移除其他支付方式的选中状态
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });

    // 添加当前支付方式的选中状态
    const selectedOption = document.querySelector(`.payment-option[onclick*="${method}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
        document.querySelector('.pay-button').disabled = false;
    }
}

// 处理支付
function handlePayment() {
    const selectedPayment = document.querySelector('.payment-option.selected');
    if (!selectedPayment) {
        alert('请选择支付方式');
        return;
    }

    const paymentMethod = selectedPayment.querySelector('span').textContent;
    const totalAmount = document.getElementById('grandTotal').textContent;

    // 这里可以添加实际的支付处理逻辑
    alert(`确认使用${paymentMethod}支付${totalAmount}？`);
    
    // 支付成功后的处理
    // clearExpenses();
    // window.location.href = 'payment-success.html';
}

// 清除费用数据
function clearExpenses() {
    expensesData = {
        roomCharges: [],
        diningCharges: [],
        serviceCharges: []
    };
    updateExpensesTable();
    updateSummary();
}

// 添加新的费用项目
function addExpense(type, item, quantity, price) {
    const expense = {
        date: new Date().toISOString().split('T')[0],
        item: item,
        type: type,
        quantity: quantity,
        price: price,
        amount: quantity * price
    };

    switch (type) {
        case ExpenseType.ROOM:
            expensesData.roomCharges.push(expense);
            break;
        case ExpenseType.DINING:
            expensesData.diningCharges.push(expense);
            break;
        case ExpenseType.SERVICE:
            expensesData.serviceCharges.push(expense);
            break;
    }

    updateExpensesTable();
    updateSummary();
}

// 导出费用报表
function exportExpenseReport() {
    window.print();
} 