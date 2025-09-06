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

        // Store original styles to restore them later
        const originalInputStyles = [];
        const inputElements = printableForm.querySelectorAll('.form-input-overlay');

        // Temporarily modify the inputs for a clean capture
        inputElements.forEach(input => {
            // Store original styles
            originalInputStyles.push({ 
                input: input, 
                backgroundColor: input.style.backgroundColor,
                border: input.style.border
            });
            // Change styles for capture
            input.style.backgroundColor = 'transparent';
            input.style.border = 'none';
            input.style.color = 'black'; // Ensure text is visible
        });

        try {
            // A more robust approach: capture the entire form (background + content)
            // in a single, high-quality canvas image. This prevents alignment issues.
            const canvas = await html2canvas(printableForm, {
                scale: 4, // Higher scale for a clearer image
                logging: false, 
                useCORS: true,
                allowTaint: true // Allows capturing images from different origins
            });

            // Convert the canvas image to a data URL
            const imageData = canvas.toDataURL('image/jpeg', 1.0);

            // Create the PDF document
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');

            // Get the width and height of the A4 page in the PDF
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Add the image to the PDF.
            // The image will be scaled to fit the A4 dimensions.
            pdf.addImage(imageData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

            // Save the PDF file
            pdf.save('filled_form_A4.pdf');

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
            // Clean up: restore original input styles
            document.body.removeChild(loadingBox);
            originalInputStyles.forEach(item => {
                item.input.style.backgroundColor = item.backgroundColor;
                item.input.style.border = item.border;
                item.input.style.color = ''; // Remove the enforced black color
            });
        }
    });
});
