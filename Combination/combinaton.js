document.addEventListener('DOMContentLoaded', () => {
    // Handle risk assessment form submission
    document.getElementById('risk-assessment-form').addEventListener('submit', (event) => {
        event.preventDefault();
        handleRiskAssessment();
    });

    // Handle initial balance form submission
    document.getElementById('initial-balance-form').addEventListener('submit', (event) => {
        event.preventDefault();
        setInitialBalance();
    });

    // Handle transaction form submission
    document.getElementById('transaction-form').addEventListener('submit', (event) => {
        event.preventDefault();
        recordTransaction();
    });

    // Handle cancel button click
    document.getElementById('cancel-button').addEventListener('click', () => {
        cancelTransaction();
    });

    // Handle export to Excel
    document.getElementById('export-button').addEventListener('click', () => {
        exportToExcel();
    });

    // Initialize charts
    initializeCharts();
});

let balance = 0;
let pendingTransaction = null;

// Function to handle risk assessment form
function handleRiskAssessment() {
    const form = document.getElementById('risk-assessment-form');
    const formData = new FormData(form);
    const answers = {};
    
    formData.forEach((value, key) => {
        answers[key] = value;
    });

    // Process answers to determine risk level
    let riskLevel = calculateRiskLevel(answers);

    // Display investment advice based on risk level
    const advice = getInvestmentAdvice(riskLevel);
    document.getElementById('investment-advice').innerText = advice;

    // Update risk chart
    updateRiskChart(riskLevel);
}

// Function to calculate risk level
function calculateRiskLevel(answers) {
    // Example logic for risk level calculation
    let riskScore = 0;
    for (let key in answers) {
        switch (answers[key]) {
            case 'high': riskScore += 4; break;
            case 'medium': riskScore += 3; break;
            case 'low': riskScore += 2; break;
            case 'none': riskScore += 1; break;
        }
    }
    return riskScore > 30 ? 'High Risk' : riskScore > 20 ? 'Medium Risk' : 'Low Risk';
}

// Function to get investment advice based on risk level
function getInvestmentAdvice(riskLevel) {
    switch (riskLevel) {
        case 'High Risk': return 'Consider diversifying your investments and consulting a financial advisor.';
        case 'Medium Risk': return 'Monitor your investments regularly and be prepared for market fluctuations.';
        case 'Low Risk': return 'You may focus on stable investments with lower returns.';
        default: return 'Please complete the risk assessment.';
    }
}

// Function to initialize charts
function initializeCharts() {
    // Example data for charts
    const riskChartCtx = document.getElementById('risk-chart').getContext('2d');
    const expensesChartCtx = document.getElementById('expenses-chart').getContext('2d');

    window.riskChart = new Chart(riskChartCtx, {
        type: 'pie',
        data: {
            labels: ['High Risk', 'Medium Risk', 'Low Risk'],
            datasets: [{
                data: [0, 0, 0], // Initial data, will be updated
                backgroundColor: ['#ff6384', '#36a2eb', '#4bc0c0']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.label + ': ' + tooltipItem.raw + '%';
                        }
                    }
                }
            }
        }
    });

    window.expensesChart = new Chart(expensesChartCtx, {
        type: 'bar',
        data: {
            labels: ['อาหาร', 'ที่อยู่อาศัย', 'การเดินทาง'],
            datasets: [{
                label: 'รายการใช้จ่าย',
                data: [0, 0, 0], // Initial data, will be updated
                backgroundColor: '#36a2eb'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.label + ': ' + tooltipItem.raw + ' บาท';
                        }
                    }
                }
            }
        }
    });
}

// Function to update risk chart based on risk level
function updateRiskChart(riskLevel) {
    const data = {
        'High Risk': [60, 20, 20],
        'Medium Risk': [30, 40, 30],
        'Low Risk': [10, 30, 60]
    };

    window.riskChart.data.datasets[0].data = data[riskLevel] || [0, 0, 0];
    window.riskChart.update();
}

// Function to set initial balance
function setInitialBalance() {
    const initialBalance = parseFloat(document.getElementById('initial-balance').value);
    balance = isNaN(initialBalance) ? 0 : initialBalance;
    document.getElementById('balance').innerText = `ยอดคงเหลือ: ${balance} บาท`;
}

// Function to record transaction
function recordTransaction() {
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    
    if (isNaN(amount) || amount <= 0) return; // Ensure the amount is a valid positive number

    // Check if the new balance will be less than or equal to 20% of initial balance
    if (balance - amount <= 0.2 * parseFloat(document.getElementById('initial-balance').value)) {
        const userResponse = confirm('คุณกำลังจะใช้เงินมากกว่า 80% ของยอดเงินตั้งต้น คุณต้องการดำเนินการต่อหรือไม่?');
        if (!userResponse) {
            return; // Cancel the transaction if user chooses "Cancel"
        }
    }

    balance -= amount; // Subtract amount from balance
    document.getElementById('balance').innerText = `ยอดคงเหลือ: ${balance} บาท`;

    // Add transaction to the list
    const transactionList = document.getElementById('transaction-list');
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item');
    listItem.textContent = `${description}: ${amount} บาท (${category})`;
    transactionList.appendChild(listItem);

    // Update expenses chart
    updateExpensesChart(category, amount);
}

// Function to cancel transaction
function cancelTransaction() {
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('category').value = 'food';
    alert('การทำรายการถูกยกเลิก');
}

// Function to update expenses chart
function updateExpensesChart(category, amount) {
    const labels = ['อาหาร', 'ที่อยู่อาศัย', 'การเดินทาง'];
    const dataset = window.expensesChart.data.datasets[0].data;

    switch (category) {
        case 'food': dataset[0] += amount; break;
        case 'housing': dataset[1] += amount; break;
        case 'transportation': dataset[2] += amount; break;
    }

    window.expensesChart.update();
}

// Function to export data to Excel
function exportToExcel() {
    const transactions = [];
    document.querySelectorAll('#transaction-list .list-group-item').forEach((item) => {
        const [description, amountCategory] = item.textContent.split(': ');
        const [amount, category] = amountCategory.split(' ');
        transactions.push({ description, amount, category });
    });

    const ws = XLSX.utils.json_to_sheet(transactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

    XLSX.writeFile(wb, 'transactions.xlsx');
}
