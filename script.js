document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('downloadBtn');
    const printableForm = document.getElementById('printableForm');

    downloadBtn.addEventListener('click', async () => {
        const loadingBox = document.createElement('div');
        loadingBox.textContent = 'Generating your PDF...';
        loadingBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #ffffff;
            color: #333333;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            text-align: center;
            border: 1px solid #cccccc;
        `;
        document.body.appendChild(loadingBox);

        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');

            // Dimensions of A4 in mm
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Load the original background image
            const backgroundImage = new Image();
            backgroundImage.src = 'recipet-min.png';
            
            await new Promise(resolve => {
                backgroundImage.onload = () => {
                    // Add the original image to the PDF, letting jsPDF handle the scaling for best quality.
                    pdf.addImage(backgroundImage, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    
                    // Set font styles for the text
                    pdf.setFont('helvetica', 'bold'); // Use a standard font
                    pdf.setFontSize(12); // A readable font size
                    pdf.setTextColor(0, 0, 0); // Black text

                    // Get values and positions from the form
                    const inputValues = {};
                    const inputElements = printableForm.querySelectorAll('.form-input-overlay');
                    inputElements.forEach(input => {
                        inputValues[input.id] = input.value;
                    });
                    
                    // Manually map each input field's ID to its exact millimeter coordinate on the A4 page
                    // These values are calculated from the percentages in your CSS
                    const coordinates = {
                        'Number': { x: 18.9, y: 57 },
                        'rajashriInput': { x: 21, y: 62.5 },
                        'dateInput': { x: 173.25, y: 57 },
                        'paymentNumber': { x: 95, y: 83 },
                        'ownerName': { x: 95, y: 95.5 },
                        'village': { x: 95, y: 107.7 },
                        'ownerFatherName': { x: 95, y: 120.2 },
                        'ownerAddress': { x: 95, y: 132 },
                        'totalLand': { x: 95, y: 142.3 },
                        'totalWeight': { x: 95, y: 153.3 },
                        'cropType': { x: 95, y: 169.0 },
                        'landNumber': { x: 95, y: 181.5 },
                        'ownerNameAgain': { x: 95, y: 193.6 },
                        'brokerName': { x: 95, y: 206.8 },
                        'totalRent': { x: 95, y: 218.5 },
                        'advance': { x: 95, y: 230.75 },
                        'remainingRent': { x: 95, y: 243.6 }
                    };

                    // Draw each piece of text onto the PDF
                    for (const id in coordinates) {
                        const { x, y } = coordinates[id];
                        const textContent = inputValues[id] || '';
                        if (textContent) {
                            pdf.text(textContent, x, y);
                        }
                    }

                    resolve();
                };
                backgroundImage.onerror = () => {
                    console.error("Failed to load background image for PDF.");
                    resolve();
                };
            });

            // Save the PDF file
            pdf.save('keerai.pdf');

        } catch (error) {
            console.error('Error generating PDF:', error);
            const messageBox = document.createElement('div');
            messageBox.textContent = 'Failed to generate PDF. Please try again.';
            messageBox.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: #f8d7da;
                color: #721c24;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
                z-index: 1000;
                text-align: center;
                border: 1px solid #f5c6cb;
            `;
            document.body.appendChild(messageBox);
            setTimeout(() => {
                document.body.removeChild(messageBox);
            }, 3000);
        } finally {
            document.body.removeChild(loadingBox);
        }
    });
});
