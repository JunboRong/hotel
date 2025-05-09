// 假数据
const mockData = {
    summary: {
        occupancyRate: 85.5,
        occupancyRateChange: 2.3,
        revenue: 256800,
        revenueChange: 5.8,
        customerSatisfaction: 4.6,
        satisfactionChange: 0.2,
        newCustomers: 128,
        newCustomersChange: -3.5
    },
    occupancyData: {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        data: [75, 82, 78, 85, 88, 85.5]
    },
    revenueData: {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        data: [180000, 195000, 210000, 225000, 240000, 256800]
    },
    roomTypeData: {
        labels: ['标准单人房', '标准双床房', '豪华大床房', '豪华双床房'],
        data: [30, 25, 20, 25]
    },
    customerSatisfaction: {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        data: [4.2, 4.3, 4.4, 4.5, 4.5, 4.6]
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    updateSummaryCards();
    initializeEventListeners();
});

// 初始化图表
function initializeCharts() {
    // 入住率趋势图
    const occupancyChart = echarts.init(document.getElementById('occupancyChart'));
    occupancyChart.setOption({
        title: {
            text: '入住率趋势',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            formatter: '{b}: {c}%'
        },
        xAxis: {
            type: 'category',
            data: mockData.occupancyData.labels
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value}%'
            }
        },
        series: [{
            data: mockData.occupancyData.data,
            type: 'line',
            smooth: true,
            lineStyle: {
                color: '#4CAF50'
            },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgba(76, 175, 80, 0.3)'
                }, {
                    offset: 1,
                    color: 'rgba(76, 175, 80, 0.1)'
                }])
            }
        }]
    });

    // 收入趋势图
    const revenueChart = echarts.init(document.getElementById('revenueChart'));
    revenueChart.setOption({
        title: {
            text: '收入趋势',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                return params[0].name + ': ¥' + params[0].value.toLocaleString();
            }
        },
        xAxis: {
            type: 'category',
            data: mockData.revenueData.labels
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: function(value) {
                    return '¥' + (value / 10000) + '万';
                }
            }
        },
        series: [{
            data: mockData.revenueData.data,
            type: 'line',
            smooth: true,
            lineStyle: {
                color: '#2196F3'
            },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgba(33, 150, 243, 0.3)'
                }, {
                    offset: 1,
                    color: 'rgba(33, 150, 243, 0.1)'
                }])
            }
        }]
    });

    // 房型分布图
    const roomTypeChart = echarts.init(document.getElementById('roomTypeChart'));
    roomTypeChart.setOption({
        title: {
            text: '房型分布',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}%'
        },
        legend: {
            orient: 'vertical',
            left: 'left'
        },
        series: [{
            type: 'pie',
            radius: '50%',
            data: mockData.roomTypeData.labels.map((label, index) => ({
                name: label,
                value: mockData.roomTypeData.data[index]
            })),
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    });

    // 客户满意度趋势图
    const satisfactionChart = echarts.init(document.getElementById('satisfactionChart'));
    satisfactionChart.setOption({
        title: {
            text: '客户满意度趋势',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            data: mockData.customerSatisfaction.labels
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: 5,
            interval: 1
        },
        series: [{
            data: mockData.customerSatisfaction.data,
            type: 'line',
            smooth: true,
            lineStyle: {
                color: '#FFC107'
            },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgba(255, 193, 7, 0.3)'
                }, {
                    offset: 1,
                    color: 'rgba(255, 193, 7, 0.1)'
                }])
            }
        }]
    });

    // 监听窗口大小变化，调整图表大小
    window.addEventListener('resize', function() {
        occupancyChart.resize();
        revenueChart.resize();
        roomTypeChart.resize();
        satisfactionChart.resize();
    });
}

// 更新摘要卡片
function updateSummaryCards() {
    const summary = mockData.summary;
    
    // 更新入住率
    document.getElementById('occupancyRate').textContent = summary.occupancyRate.toFixed(1) + '%';
    updateTrend('occupancyRateTrend', summary.occupancyRateChange);

    // 更新收入
    document.getElementById('revenue').textContent = '¥' + summary.revenue.toLocaleString();
    updateTrend('revenueTrend', summary.revenueChange);

    // 更新客户满意度
    document.getElementById('satisfaction').textContent = summary.customerSatisfaction.toFixed(1);
    updateTrend('satisfactionTrend', summary.satisfactionChange);

    // 更新新客户数
    document.getElementById('newCustomers').textContent = summary.newCustomers;
    updateTrend('newCustomersTrend', summary.newCustomersChange);
}

// 更新趋势指标
function updateTrend(elementId, change) {
    const element = document.getElementById(elementId);
    const trend = change > 0 ? 'up' : 'down';
    const arrow = change > 0 ? '↑' : '↓';
    element.className = `trend ${trend}`;
    element.textContent = `${arrow} ${Math.abs(change).toFixed(1)}%`;
}

// 初始化事件监听
function initializeEventListeners() {
    // 日期筛选
    const dateFilter = document.querySelector('.date-filter');
    dateFilter.addEventListener('change', function() {
        // TODO: 根据日期筛选更新数据
        alert('日期筛选功能待实现');
    });

    // 导出按钮
    const exportButtons = document.querySelectorAll('.export-btn');
    exportButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.dataset.type;
            // TODO: 实现导出功能
            alert(`导出${type}报表功能待实现`);
        });
    });

    // 选项卡切换
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });
}

// 切换选项卡
function switchTab(tabName) {
    // 更新按钮状态
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
        if (button.dataset.tab === tabName) {
            button.classList.add('active');
        }
    });

    // 更新内容显示
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById(`${tabName}Tab`).style.display = 'block';
} 