const initialBalanceForm = document.getElementById('initial-balance-form');
const transactionForm = document.getElementById('transaction-form');
const transactionList = document.getElementById('transaction-list');
const balanceElement = document.getElementById('balance');
const exportButton = document.getElementById('export-button');
const expensesChartElement = document.getElementById('expenses-chart');

let transactions = [];
let balance = 0;

// สร้างกราฟ
const ctx = expensesChartElement.getContext('2d');
const expensesChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: [],
        datasets: [{
            label: 'การใช้จ่าย',
            data: [],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
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
                        return `${tooltipItem.label}: ${tooltipItem.raw} บาท`;
                    }
                }
            }
        }
    }
});

// ฟังก์ชันการตั้งค่ายอดเงินตั้งต้น
initialBalanceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const initialBalance = parseFloat(document.getElementById('initial-balance').value);
    if (isNaN(initialBalance) || initialBalance < 0) {
        alert('กรุณากรอกยอดเงินตั้งต้นที่ถูกต้อง');
        return;
    }
    balance += initialBalance; // เพิ่มยอดเงินตั้งต้นใหม่เข้าไปในยอดคงเหลือ
    balanceElement.textContent = `ยอดคงเหลือ: ${balance} บาท`;
    initialBalanceForm.reset();
});

// ฟังก์ชันการบันทึกข้อมูล
transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;

    if (isNaN(amount) || amount <= 0) {
        alert('กรุณากรอกจำนวนเงินที่ถูกต้อง');
        return;
    }

    const transaction = { description, amount, category };
    transactions.push(transaction);
    
    // หักยอดคงเหลือ
    balance -= amount;
    if (balance < 0) {
        alert('ยอดเงินไม่เพียงพอสำหรับการใช้จ่ายนี้');
        balance += amount; // คืนยอดกลับ
        transactions.pop(); // ลบรายการใช้จ่ายที่เพิ่งบันทึก
        updateTransactions();
        updateBalance();
        return;
    }

    // แจ้งเตือนเมื่อรายจ่ายเกิน 80% ของยอดเงินตั้งต้น
    const totalExpenses = calculateTotalExpenses();
    const initialBalance = totalExpenses + balance; // คำนวณยอดเงินตั้งต้นที่แท้จริง
    if ((totalExpenses / initialBalance) > 0.8) {
        if (!confirm('การใช้จ่ายของคุณเกิน 80% ของยอดเงินที่ตั้งไว้ คุณต้องการดำเนินการต่อหรือไม่?')) {
            // คืนยอดเงินถ้าผู้ใช้เลือก Cancel
            balance += amount;
            transactions.pop(); // ลบรายการใช้จ่ายที่เพิ่งบันทึก
            updateTransactions();
            updateBalance();
            return;
        }
    }

    updateTransactions();
    updateBalance();
    updateChart();
    transactionForm.reset();
});

// ฟังก์ชันคำนวณการใช้จ่ายทั้งหมด
function calculateTotalExpenses() {
    return transactions.reduce((total, transaction) => total + transaction.amount, 0);
}

// ฟังก์ชันการอัปเดตรายการใช้จ่าย
function updateTransactions() {
    transactionList.innerHTML = '';
    transactions.forEach((transaction) => {
        const li = document.createElement('li');
        li.innerHTML = `${transaction.description} - ${transaction.amount} บาท <span>${transaction.category}</span>`;
        transactionList.appendChild(li);
    });
}

// ฟังก์ชันการอัปเดตยอดคงเหลือ
function updateBalance() {
    balanceElement.textContent = `ยอดคงเหลือ: ${balance} บาท`;
}

// ฟังก์ชันการอัปเดตกราฟ
function updateChart() {
    const categories = [...new Set(transactions.map(t => t.category))];
    const amounts = categories.map(category => {
        return transactions
            .filter(t => t.category === category)
            .reduce((sum, t) => sum + t.amount, 0);
    });

    expensesChart.data.labels = categories;
    expensesChart.data.datasets[0].data = amounts;
    expensesChart.update();
}

// ฟังก์ชันการดาวน์โหลดข้อมูลเป็นไฟล์ Excel
exportButton.addEventListener('click', () => {
    const wb = XLSX.utils.book_new();
    const wsData = [['รายละเอียด', 'จำนวนเงิน', 'หมวดหมู่']];
    
    transactions.forEach(transaction => {
        wsData.push([transaction.description, transaction.amount, transaction.category]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    function s2ab(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }
    saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'transactions.xlsx');
});
