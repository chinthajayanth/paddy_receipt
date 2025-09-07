/**
 * PDF Generator Script
 * ---------------------
 * This script listens for a "Download" button click and generates a PDF
 * from user input values placed over a background image template.
 * 
 * Dependencies:
 *   - jsPDF (https://cdnjs.com/libraries/jspdf)
 * 
 * Features:
 *   ✔️ Shows loading indicator while generating PDF
 *   ✔️ Places background image in A4 PDF
 *   ✔️ Draws text at precise millimeter coordinates
 *   ✔️ Handles errors gracefully
 */

document.addEventListener('DOMContentLoaded', () => {
    // Button that triggers PDF generation
    const downloadBtn = document.getElementById('downloadBtn');
    // Form that contains user inputs
    const printableForm = document.getElementById('printableForm');

    downloadBtn.addEventListener('click', async () => {
        // Create a loading box to show user feedback
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
            // Initialize jsPDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait, millimeters, A4 size

            // Dimensions of A4 paper in mm (≈ 210 x 297 mm)
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Load the background image
            const backgroundImage = new Image();
            backgroundImage.src = 'recipet-min.png'; // Path to your background template

            // Wait until the image is loaded
            await new Promise(resolve => {
                backgroundImage.onload = () => {
                    // Add background image stretched to fit page
                    pdf.addImage(backgroundImage, 'PNG', 0, 0, pdfWidth, pdfHeight);

                    // Configure text style
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(12);
                    pdf.setTextColor(0, 0, 0); // Black

                    // Collect all form values
                    const inputValues = {};
                    const inputElements = printableForm.querySelectorAll('.form-input-overlay');
                    inputElements.forEach(input => {
                        inputValues[input.id] = input.value;
                    });

                    /**
                     * Mapping of form field IDs to PDF coordinates (x, y) in millimeters.
                     * Coordinates must be carefully calibrated for your background image.
                     */
                    const coordinates = {
                        'Number': { x: 18.9, y: 57 },
                        'rajashriInput': { x: 21, y: 62.5 },
                        'dateInput': { x: 173.25, y: 57 },
                        'paymentNumber': { x: 95, y: 83 },
                        'ownerName': { x: 95, y: 95.5 },
                        'village': { x: 95, y: 107.7 },
                        'ownerFatherName': { x: 95, y: 120.2 },
                        'ownerAddress': { x: 95, y: 132 },
                        'totalLand': { x: 95, y: 144.3 },
                        'totalWeight': { x: 95, y: 156.8 },
                        'cropType': { x: 95, y: 169.0 },
                        'landNumber': { x: 95, y: 181.5 },
                        'ownerNameAgain': { x: 95, y: 193.6 },
                        'brokerName': { x: 95, y: 206.8 },
                        'totalRent': { x: 95, y: 218.5 },
                        'advance': { x: 95, y: 230.75 },
                        'remainingRent': { x: 95, y: 243.6 }
                    };

                    // Write each input field at its designated coordinate
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

            // Save the PDF to the user’s computer
            pdf.save('keerai.pdf');

        } catch (error) {
            console.error('Error generating PDF:', error);

            // Show error message box
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

            // Remove after 3 seconds
            setTimeout(() => {
                document.body.removeChild(messageBox);
            }, 3000);

        } finally {
            // Remove the loading box regardless of success or failure
            document.body.removeChild(loadingBox);
        }
    });
});
