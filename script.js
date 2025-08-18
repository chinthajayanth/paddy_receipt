document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('downloadBtn');
    const printableForm = document.getElementById('printableForm');

    downloadBtn.addEventListener('click', async () => { // Made the function async
        const inputElements = printableForm.querySelectorAll('.form-input-overlay');
        const temporarySpans = [];

        // Step 1: Replace inputs with temporary spans containing their values
        inputElements.forEach(input => {
            const span = document.createElement('span');
            const computedStyle = window.getComputedStyle(input);

            // Copy inline styles directly for positioning & sizing
            span.style.position = 'absolute';
            span.style.top = input.style.top;
            span.style.left = input.style.left;
            span.style.width = input.style.width;
            span.style.height = input.style.height;
            span.style.zIndex = '999'; // Ensure it's on top of the background image

            // Copy text and visual styles for content rendering
            span.style.fontSize = '0.78rem';
            span.style.color = 'black'; // Explicitly set text color
            span.style.textAlign = computedStyle.textAlign;
            span.style.lineHeight = '1.2';
            span.style.padding = '0';
            span.style.borderRadius = computedStyle.borderRadius;
            span.style.fontFamily = computedStyle.fontFamily;
            span.style.whiteSpace = 'nowrap';
            span.style.overflow = 'hidden';
            span.style.textOverflow = 'ellipsis';
            span.style.boxSizing = 'border-box';

            span.style.pointerEvents = 'none'; // Make sure it's not interactive

            // Set text content, handle date input display format
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
            
            printableForm.appendChild(span);
            input.style.visibility = 'hidden'; // Hide the original input
            temporarySpans.push(span);
        });

        try {
            // Step 2: Capture the form content with html2canvas
            const canvas = await html2canvas(printableForm, {
                scale: 5, // Increased scale for even higher resolution canvas (crucial for PDF quality)
                logging: false,
                useCORS: true,
                scrollX: -window.scrollX,
                scrollY: -window.scrollY,
                windowWidth: document.documentElement.offsetWidth,
                windowHeight: document.documentElement.offsetHeight
            });

            // Step 3: Convert canvas to PDF using jsPDF
            const imgData = canvas.toDataURL('image/jpeg', 1.0); // Get JPEG image data from canvas
            
            const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4'); // 'p' for portrait, 'mm' for millimeters, 'a4' for A4 size
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = canvas.height * imgWidth / canvas.width; // Calculate image height to maintain aspect ratio
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save('filled_form_A4.pdf'); // Save as PDF

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
            // Step 4: Clean up - remove temporary spans and show original inputs
            temporarySpans.forEach(span => {
                printableForm.removeChild(span);
            });
            inputElements.forEach(input => {
                input.style.visibility = 'visible';
            });
        }
    });
});
