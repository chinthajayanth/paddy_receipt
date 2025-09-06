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

        // Find all form inputs that need to be captured
        const inputElements = printableForm.querySelectorAll('.form-input-overlay');
        const temporarySpans = [];

        // Temporarily replace input fields with text-only spans for better capture
        inputElements.forEach(input => {
            const span = document.createElement('span');
            const computedStyle = window.getComputedStyle(input);
            
            // Set the styles and position using computed values for accuracy
            span.style.position = 'absolute';
            span.style.top = input.style.top;
            span.style.left = input.style.left;
            span.style.width = input.style.width;
            span.style.height = input.style.height;

            // Copy necessary visual styles
            span.style.color = 'black';
            span.style.fontSize = computedStyle.fontSize;
            span.style.lineHeight = computedStyle.lineHeight;
            span.style.textAlign = computedStyle.textAlign;
            span.style.padding = computedStyle.padding;
            span.style.fontFamily = computedStyle.fontFamily;
            span.style.whiteSpace = 'nowrap';
            span.style.overflow = 'hidden';
            span.style.textOverflow = 'ellipsis';
            span.style.boxSizing = 'border-box';
            span.style.pointerEvents = 'none';

            // Set the content of the span
            if (input.type === 'date') {
                if (input.value) {
                    const date = new Date(input.value);
                    span.textContent = date.toLocaleDateString('en-GB');
                } else {
                    span.textContent = '';
                }
            } else {
                span.textContent = input.value;
            }

            // Append the new span and hide the original input field.
            printableForm.appendChild(span);
            input.style.visibility = 'hidden';
            temporarySpans.push(span);
        });

        // Hide the original background image of the printable form
        const originalBackgroundImage = printableForm.style.backgroundImage;
        printableForm.style.backgroundImage = 'none';

        try {
            // Capture only the text content using html2canvas
            const contentCanvas = await html2canvas(printableForm, {
                scale: 1, // Use a reasonable scale to balance quality and file size
                logging: false, 
                useCORS: true,
                backgroundColor: null, // Ensures transparency
            });

            const contentImgData = contentCanvas.toDataURL('image/png', 0.1);

            // Create the PDF document
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            // Load the original background image
            const backgroundImage = new Image();
            backgroundImage.src = 'recipet.png';
            
            await new Promise(resolve => {
                backgroundImage.onload = () => {
                    pdf.addImage(backgroundImage, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    
                    // Overlay the text content on top of the background
                    const contentImgHeight = contentCanvas.height * pdfWidth / contentCanvas.width;
                    pdf.addImage(contentImgData, 'PNG', 0, 0, pdfWidth, contentImgHeight, null, 'FAST');
                    resolve();
                };
                backgroundImage.onerror = () => {
                    console.error("Failed to load background image for PDF.");
                    resolve();
                };
            });

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
            // Clean up: restore original background image and inputs
            document.body.removeChild(loadingBox);
            printableForm.style.backgroundImage = originalBackgroundImage;
            temporarySpans.forEach(span => {
                if (span.parentNode) {
                    printableForm.removeChild(span);
                }
            });
            inputElements.forEach(input => {
                input.style.visibility = 'visible';
            });
        }
    });
});
