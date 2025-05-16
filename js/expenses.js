// 费用管理类
class ExpenseManager {
    constructor() {
        this.expenses = {
            roomCharges: [],
            diningCharges: [],
            serviceCharges: []
        };
        this.discounts = {};
        this.paymentMethods = {};
        this.currentUser = null;
    }

    // 初始化
    async initialize() {
        try {
            // 从localStorage获取当前用户
            this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!this.currentUser) {
                throw new Error('用户未登录');
            }

            // 加载费用配置
            const response = await fetch('../data/expenses.json');
            const data = await response.json();
            
            // 初始化折扣信息
            this.discounts = data.discounts;
            
            // 初始化支付方式
            this.paymentMethods = data.paymentMethods;

            // 从localStorage加载费用数据
            this.loadExpensesFromStorage();
            
            // 更新显示
            this.updateDisplay();
        } catch (error) {
            console.error('初始化失败:', error);
            throw error;
        }
    }

    // 从localStorage加载费用数据
    loadExpensesFromStorage() {
        const storedExpenses = localStorage.getItem(`expenses_${this.currentUser.id}`);
        if (storedExpenses) {
            this.expenses = JSON.parse(storedExpenses);
        }
    }

    // 保存费用数据到localStorage
    saveExpensesToStorage() {
        localStorage.setItem(`expenses_${this.currentUser.id}`, JSON.stringify(this.expenses));
    }

    // 添加房费
    addRoomCharge(roomData) {
        const charge = {
            date: new Date().toISOString().split('T')[0],
            item: roomData.type,
            type: '房费',
            quantity: roomData.nights,
            price: roomData.price,
            amount: roomData.nights * roomData.price,
            roomNumber: roomData.roomNumber,
            status: '待支付'
        };

        this.expenses.roomCharges.push(charge);
        this.saveExpensesToStorage();
        this.updateDisplay();
    }

    // 添加餐饮费用
    addDiningCharge(diningData) {
        const charge = {
            date: new Date().toISOString().split('T')[0],
            item: diningData.name,
            type: '餐饮',
            quantity: diningData.quantity,
            price: diningData.price,
            amount: diningData.quantity * diningData.price,
            location: diningData.location,
            status: '待支付'
        };

        this.expenses.diningCharges.push(charge);
        this.saveExpensesToStorage();
        this.updateDisplay();
    }

    // 添加服务费用
    addServiceCharge(serviceData) {
        const charge = {
            date: new Date().toISOString().split('T')[0],
            item: serviceData.name,
            type: '服务',
            quantity: serviceData.quantity,
            price: serviceData.price,
            amount: serviceData.quantity * serviceData.price,
            status: '待支付'
        };

        this.expenses.serviceCharges.push(charge);
        this.saveExpensesToStorage();
        this.updateDisplay();
    }

    // 计算折扣后的金额
    calculateDiscountedAmount(amount, type) {
        let discount = 1;
        
        // 应用会员折扣
        if (this.currentUser.membershipLevel) {
            const membershipDiscount = this.discounts.vip;
            switch (type) {
                case '房费':
                    discount *= membershipDiscount.roomDiscount;
                    break;
                case '餐饮':
                    discount *= membershipDiscount.diningDiscount;
                    break;
                case '服务':
                    discount *= membershipDiscount.serviceDiscount;
                    break;
            }
        }

        // 应用季节性折扣
        const now = new Date();
        const seasonalDiscount = this.discounts.seasonal;
        if (now >= new Date(seasonalDiscount.startDate) && now <= new Date(seasonalDiscount.endDate)) {
            switch (type) {
                case '房费':
                    discount *= seasonalDiscount.roomDiscount;
                    break;
                case '餐饮':
                    discount *= seasonalDiscount.diningDiscount;
                    break;
                case '服务':
                    discount *= seasonalDiscount.serviceDiscount;
                    break;
            }
        }

        return amount * discount;
    }

    // 更新显示
    updateDisplay() {
        // 更新费用表格
        const tableBody = document.getElementById('expensesTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        
        // 合并所有费用并按日期排序
        const allExpenses = [
            ...this.expenses.roomCharges,
            ...this.expenses.diningCharges,
            ...this.expenses.serviceCharges
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        allExpenses.forEach(expense => {
            const row = document.createElement('tr');
            const discountedAmount = this.calculateDiscountedAmount(expense.amount, expense.type);
            
            row.innerHTML = `
                <td>${expense.date}</td>
                <td>${expense.item}</td>
                <td>${expense.type}</td>
                <td>${expense.quantity}</td>
                <td>¥${expense.price.toFixed(2)}</td>
                <td>¥${discountedAmount.toFixed(2)}</td>
                <td>${expense.status}</td>
            `;
            tableBody.appendChild(row);
        });

        // 更新费用汇总
        this.updateSummary();
    }

    // 更新费用汇总
    updateSummary() {
        const roomTotal = this.calculateTotal(this.expenses.roomCharges, '房费');
        const diningTotal = this.calculateTotal(this.expenses.diningCharges, '餐饮');
        const serviceTotal = this.calculateTotal(this.expenses.serviceCharges, '服务');
        const grandTotal = roomTotal + diningTotal + serviceTotal;

        document.getElementById('roomTotal').textContent = `¥${roomTotal.toFixed(2)}`;
        document.getElementById('diningTotal').textContent = `¥${diningTotal.toFixed(2)}`;
        document.getElementById('serviceTotal').textContent = `¥${serviceTotal.toFixed(2)}`;
        document.getElementById('grandTotal').textContent = `¥${grandTotal.toFixed(2)}`;
    }

    // 计算总金额（考虑折扣）
    calculateTotal(charges, type) {
        return charges.reduce((total, charge) => {
            return total + this.calculateDiscountedAmount(charge.amount, type);
        }, 0);
    }

    // 支付费用
    async payExpenses(paymentMethod) {
        try {
            // 这里应该调用实际的支付API
            // 目前仅做模拟
            const allExpenses = [
                ...this.expenses.roomCharges,
                ...this.expenses.diningCharges,
                ...this.expenses.serviceCharges
            ];

            // 更新所有费用状态为已支付
            allExpenses.forEach(expense => {
                expense.status = '已支付';
            });

            // 保存更新后的数据
            this.saveExpensesToStorage();
            this.updateDisplay();

            return true;
        } catch (error) {
            console.error('支付失败:', error);
            throw error;
        }
    }
}

// 创建费用管理器实例
const expenseManager = new ExpenseManager();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await expenseManager.initialize();
    } catch (error) {
        console.error('初始化失败:', error);
        window.location.href = 'logIn.html';
    }
});

// 费用类型枚举
const ExpenseType = {
    ROOM: '房费',
    DINING: '餐饮',
    SERVICE: '服务'
};

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
    expenseManager.expenses = {
        roomCharges: [],
        diningCharges: [],
        serviceCharges: []
    };
    expenseManager.saveExpensesToStorage();
    expenseManager.updateDisplay();
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
            expenseManager.expenses.roomCharges.push(expense);
            break;
        case ExpenseType.DINING:
            expenseManager.expenses.diningCharges.push(expense);
            break;
        case ExpenseType.SERVICE:
            expenseManager.expenses.serviceCharges.push(expense);
            break;
    }

    expenseManager.saveExpensesToStorage();
    expenseManager.updateDisplay();
}

// 导出费用报表
function exportExpenseReport() {
    window.print();
} 