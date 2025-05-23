// 获取分析数据
async function fetchAnalysisData() {
    try {
        const response = await fetch('../data/analysis.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('获取分析数据失败:', error);
        return null;
    }
}

// 格式化数字
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 格式化日期
function formatDate(date) {
    return new Date(date).toLocaleDateString('zh-CN');
}

// 更新摘要卡片
function updateSummaryCards(data) {
    const summary = data.summary;
    
    // 更新入住率
    document.getElementById('occupancyRate').textContent = `${summary.occupancyRate.value}%`;
    document.getElementById('occupancyRateTrend').textContent = 
        `${summary.occupancyRate.trend > 0 ? '↑' : '↓'} ${Math.abs(summary.occupancyRate.trend)}%`;
    
    // 更新收入
    document.getElementById('revenue').textContent = `¥${formatNumber(summary.revenue.value)}`;
    document.getElementById('revenueTrend').textContent = 
        `${summary.revenue.trend > 0 ? '↑' : '↓'} ${Math.abs(summary.revenue.trend)}%`;
    
    // 更新满意度
    document.getElementById('satisfaction').textContent = summary.satisfaction.value.toFixed(1);
    document.getElementById('satisfactionTrend').textContent = 
        `${summary.satisfaction.trend > 0 ? '↑' : '↓'} ${Math.abs(summary.satisfaction.trend)}`;
    
    // 更新新增客户
    document.getElementById('newCustomers').textContent = summary.newCustomers.value;
    document.getElementById('newCustomersTrend').textContent = 
        `${summary.newCustomers.trend > 0 ? '↑' : '↓'} ${Math.abs(summary.newCustomers.trend)}%`;
}

// 更新数据表格
function updateDataTable(data) {
    const tbody = document.getElementById('dataTableBody');
    tbody.innerHTML = '';

    data.dailyData.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(item.date)}</td>
            <td>${item.occupancyRate}%</td>
            <td>¥${formatNumber(item.revenue)}</td>
            <td>${item.newCustomers}</td>
            <td>${item.satisfaction.toFixed(1)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// 初始化图表
function initCharts(data) {
    // 入住率图表
    const occupancyChart = echarts.init(document.getElementById('occupancyChart'));
    occupancyChart.setOption({
        title: { text: '入住率趋势' },
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: data.dailyData.map(item => formatDate(item.date))
        },
        yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
        series: [{
            data: data.dailyData.map(item => item.occupancyRate),
            type: 'line',
            smooth: true
        }]
    });

    // 收入图表
    const revenueChart = echarts.init(document.getElementById('revenueChart'));
    revenueChart.setOption({
        title: { text: '收入趋势' },
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: data.dailyData.map(item => formatDate(item.date))
        },
        yAxis: { type: 'value', axisLabel: { formatter: '¥{value}' } },
        series: [{
            data: data.dailyData.map(item => item.revenue),
            type: 'line',
            smooth: true
        }]
    });

    // 房型分析图表
    const roomTypeChart = echarts.init(document.getElementById('roomTypeChart'));
    roomTypeChart.setOption({
        title: { text: '房型分析' },
        tooltip: { trigger: 'axis' },
        legend: { data: ['入住率', '收入'] },
        xAxis: { type: 'category', data: data.roomTypeData.types },
        yAxis: [
            { type: 'value', name: '入住率', axisLabel: { formatter: '{value}%' } },
            { type: 'value', name: '收入', axisLabel: { formatter: '¥{value}' } }
        ],
        series: [
            {
                name: '入住率',
                type: 'bar',
                data: data.roomTypeData.occupancy
            },
            {
                name: '收入',
                type: 'bar',
                yAxisIndex: 1,
                data: data.roomTypeData.revenue
            }
        ]
    });

    // 满意度图表
    const satisfactionChart = echarts.init(document.getElementById('satisfactionChart'));
    satisfactionChart.setOption({
        title: { text: '客户满意度分析' },
        tooltip: { trigger: 'axis' },
        radar: {
            indicator: data.satisfactionData.categories.map(category => ({
                name: category,
                max: 5
            }))
        },
        series: [{
            type: 'radar',
            data: [{
                value: data.satisfactionData.scores,
                name: '满意度'
            }]
        }]
    });

    // 监听窗口大小变化，调整图表大小
    window.addEventListener('resize', () => {
        occupancyChart.resize();
        revenueChart.resize();
        roomTypeChart.resize();
        satisfactionChart.resize();
    });
}

// 根据日期范围过滤数据
function filterDataByDateRange(data, startDate, endDate) {
    if (!startDate || !endDate) return data;

    const filteredData = {
        ...data,
        dailyData: data.dailyData.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= startDate && itemDate <= endDate;
        })
    };

    // 重新计算摘要数据
    const dailyData = filteredData.dailyData;
    if (dailyData.length > 0) {
        filteredData.summary = {
            occupancyRate: {
                value: dailyData[dailyData.length - 1].occupancyRate,
                trend: dailyData[dailyData.length - 1].occupancyRate - dailyData[0].occupancyRate
            },
            revenue: {
                value: dailyData[dailyData.length - 1].revenue,
                trend: ((dailyData[dailyData.length - 1].revenue - dailyData[0].revenue) / dailyData[0].revenue * 100)
            },
            satisfaction: {
                value: dailyData[dailyData.length - 1].satisfaction,
                trend: dailyData[dailyData.length - 1].satisfaction - dailyData[0].satisfaction
            },
            newCustomers: {
                value: dailyData[dailyData.length - 1].newCustomers,
                trend: ((dailyData[dailyData.length - 1].newCustomers - dailyData[0].newCustomers) / dailyData[0].newCustomers * 100)
            }
        };
    }

    return filteredData;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // 设置默认日期范围（最近30天）
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
        document.getElementById('endDate').value = endDate.toISOString().split('T')[0];

        // 获取并显示数据
        const data = await fetchAnalysisData();
        if (data) {
            updateSummaryCards(data);
            updateDataTable(data);
            initCharts(data);
        }

        // 添加查询按钮事件监听
        document.getElementById('queryBtn').addEventListener('click', async () => {
            const startDate = new Date(document.getElementById('startDate').value);
            const endDate = new Date(document.getElementById('endDate').value);
            
            if (startDate > endDate) {
                alert('开始日期不能大于结束日期');
                return;
            }

            const data = await fetchAnalysisData();
            if (data) {
                const filteredData = filterDataByDateRange(data, startDate, endDate);
                updateSummaryCards(filteredData);
                updateDataTable(filteredData);
                initCharts(filteredData);
            }
        });
    } catch (error) {
        console.error('初始化失败:', error);
    }
}); 