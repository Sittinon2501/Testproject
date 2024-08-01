document.addEventListener('DOMContentLoaded', function () {
    // ฟังก์ชันสำหรับการคำนวณคะแนนและแสดงกราฟ
    document.getElementById('risk-assessment-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const answers = [];
        for (let i = 1; i <= 10; i++) {
            const value = document.getElementById(`q${i}`).value;
            if (value) {
                answers.push(parseInt(value));
            }
        }

        const total = answers.reduce((a, b) => a + b, 0);
        const average = total / answers.length;

        // แสดงกราฟ
        const ctx = document.getElementById('risk-chart').getContext('2d');
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: [
                    'ประสบการณ์การลงทุน',
                    'ความสามารถรับความเสี่ยง',
                    'ความรู้เกี่ยวกับตลาด',
                    'การจัดการการสูญเสีย',
                    'แหล่งรายได้หลายช่องทาง',
                    'แผนการลงทุน',
                    'ความทนทานต่อความผันผวน',
                    'การติดตามผลการลงทุน',
                    'ความรู้เกี่ยวกับเครื่องมือการเงิน',
                    'การคาดหวังผลตอบแทน'
                ],
                datasets: [{
                    label: 'คะแนนความเสี่ยง',
                    data: answers,
                    fill: true,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    pointBackgroundColor: 'rgba(75, 192, 192, 1)'
                }]
            },
            options: {
                scales: {
                    r: {
                        angleLines: { display: false },
                        suggestedMin: 1,
                        suggestedMax: 10
                    }
                }
            }
        });

        // คำแนะนำการลงทุน
        const advice = average > 7 ? 'คุณมีความเสี่ยงสูงและสามารถลงทุนในสินทรัพย์ที่มีความเสี่ยงสูงได้ เช่น หุ้นหรือการลงทุนในตลาดต่างประเทศ' :
                       average > 4 ? 'คุณมีความเสี่ยงปานกลาง ควรพิจารณาการลงทุนในสินทรัพย์ที่มีความเสี่ยงปานกลาง เช่น กองทุนรวม' :
                       'คุณมีความเสี่ยงต่ำ ควรลงทุนในสินทรัพย์ที่มีความเสี่ยงต่ำ เช่น เงินฝากธนาคารหรือพันธบัตรรัฐบาล';

        document.getElementById('investment-advice').textContent = `คำแนะนำการลงทุน: ${advice}`;
    });

    // ฟังก์ชันสำหรับการดาวน์โหลดข้อมูลเป็น Excel
    document.getElementById('export-button').addEventListener('click', function () {
        const ws = XLSX.utils.json_to_sheet([{
            'คำถาม': '1. คุณมีประสบการณ์ในการลงทุนมากน้อยเพียงใด?',
            'คะแนน': document.getElementById('q1').value
        }, {
            'คำถาม': '2. คุณสามารถรับความเสี่ยงในการลงทุนได้มากน้อยเพียงใด?',
            'คะแนน': document.getElementById('q2').value
        }, {
            'คำถาม': '3. คุณมีความรู้เกี่ยวกับตลาดการเงินมากน้อยเพียงใด?',
            'คะแนน': document.getElementById('q3').value
        }, {
            'คำถาม': '4. คุณมีความสามารถในการจัดการกับการสูญเสียทางการเงินได้มากน้อยเพียงใด?',
            'คะแนน': document.getElementById('q4').value
        }, {
            'คำถาม': '5. คุณมีแหล่งรายได้หลายช่องทางหรือไม่?',
            'คะแนน': document.getElementById('q5').value
        }, {
            'คำถาม': '6. คุณมีแผนการลงทุนที่ชัดเจนและเป็นระเบียบหรือไม่?',
            'คะแนน': document.getElementById('q6').value
        }, {
            'คำถาม': '7. คุณสามารถทนต่อความผันผวนของตลาดได้มากน้อยเพียงใด?',
            'คะแนน': document.getElementById('q7').value
        }, {
            'คำถาม': '8. คุณมีการติดตามผลการลงทุนและการปรับกลยุทธ์อยู่เสมอหรือไม่?',
            'คะแนน': document.getElementById('q8').value
        }, {
            'คำถาม': '9. คุณมีความรู้เกี่ยวกับเครื่องมือทางการเงินต่าง ๆ หรือไม่?',
            'คะแนน': document.getElementById('q9').value
        }, {
            'คำถาม': '10. คุณคาดหวังผลตอบแทนจากการลงทุนอย่างไร?',
            'คะแนน': document.getElementById('q10').value
        }]);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'ข้อมูลการประเมิน');
        XLSX.writeFile(wb, 'risk_assessment.xlsx');
    });
});
