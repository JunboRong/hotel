// Fetch analysis data
async function fetchAnalysisData() {
    try {
        const response = await fetch('../data/analysis.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch analysis data:', error);
        return null;
    }
}

// Format number
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US');
}

// Update summary cards
function updateSummaryCards(data) {
    const summary = data.summary;
    
    // Update occupancy rate
    document.getElementById('occupancyRate').textContent = `${summary.occupancyRate.value}%`;
    document.getElementById('occupancyRateTrend').textContent = 
        `${summary.occupancyRate.trend > 0 ? '↑' : '↓'} ${Math.abs(summary.occupancyRate.trend)}%`;
    
    // Update revenue
    document.getElementById('revenue').textContent = `¥${formatNumber(summary.revenue.value)}`;
    document.getElementById('revenueTrend').textContent = 
        `${summary.revenue.trend > 0 ? '↑' : '↓'} ${Math.abs(summary.revenue.trend)}%`;
    
    // Update satisfaction
    document.getElementById('satisfaction').textContent = summary.satisfaction.value.toFixed(1);
    document.getElementById('satisfactionTrend').textContent = 
        `${summary.satisfaction.trend > 0 ? '↑' : '↓'} ${Math.abs(summary.satisfaction.trend)}`;
    
    // Update new customers
    document.getElementById('newCustomers').textContent = summary.newCustomers.value;
    document.getElementById('newCustomersTrend').textContent = 
        `${summary.newCustomers.trend > 0 ? '↑' : '↓'} ${Math.abs(summary.newCustomers.trend)}%`;
}

// Update data table
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

// Initialize charts
function initCharts(data) {
    // Occupancy rate chart
    const occupancyChart = echarts.init(document.getElementById('occupancyChart'));
    occupancyChart.setOption({
        title: { text: 'Occupancy Rate Trend' },
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

    // Revenue chart
    const revenueChart = echarts.init(document.getElementById('revenueChart'));
    revenueChart.setOption({
        title: { text: 'Revenue Trend' },
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

    // Room type analysis chart
    const roomTypeChart = echarts.init(document.getElementById('roomTypeChart'));
    roomTypeChart.setOption({
        title: { text: 'Room Type Analysis' },
        tooltip: { trigger: 'axis' },
        legend: { data: ['Occupancy Rate', 'Revenue'] },
        xAxis: { type: 'category', data: data.roomTypeData.types },
        yAxis: [
            { type: 'value', name: 'Occupancy Rate', axisLabel: { formatter: '{value}%' } },
            { type: 'value', name: 'Revenue', axisLabel: { formatter: '¥{value}' } }
        ],
        series: [
            {
                name: 'Occupancy Rate',
                type: 'bar',
                data: data.roomTypeData.occupancy
            },
            {
                name: 'Revenue',
                type: 'bar',
                yAxisIndex: 1,
                data: data.roomTypeData.revenue
            }
        ]
    });

    // Satisfaction chart
    const satisfactionChart = echarts.init(document.getElementById('satisfactionChart'));
    satisfactionChart.setOption({
        title: { text: 'Customer Satisfaction Analysis' },
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
                name: 'Satisfaction'
            }]
        }]
    });

    // Listen for window resize to adjust chart size
    window.addEventListener('resize', () => {
        occupancyChart.resize();
        revenueChart.resize();
        roomTypeChart.resize();
        satisfactionChart.resize();
    });
}

// Filter data by date range
function filterDataByDateRange(data, startDate, endDate) {
    if (!startDate || !endDate) return data;

    const filteredData = {
        ...data,
        dailyData: data.dailyData.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= startDate && itemDate <= endDate;
        })
    };

    // Recalculate summary data
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Set default date range (last 30 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
        document.getElementById('endDate').value = endDate.toISOString().split('T')[0];

        // Fetch and display data
        const data = await fetchAnalysisData();
        if (data) {
            updateSummaryCards(data);
            updateDataTable(data);
            initCharts(data);
        }

        // Add query button event listener
        document.getElementById('queryBtn').addEventListener('click', async () => {
            const startDate = new Date(document.getElementById('startDate').value);
            const endDate = new Date(document.getElementById('endDate').value);
            
            if (startDate > endDate) {
                alert('Start date cannot be greater than end date');
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
        console.error('Initialization failed:', error);
    }
}); 