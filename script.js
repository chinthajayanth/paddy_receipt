document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('downloadBtn');
    const printableForm = document.getElementById('printableForm');

    downloadBtn.addEventListener('click', async () => {
        const inputElements = printableForm.querySelectorAll('.form-input-overlay');
        const temporarySpans = [];

        // Store original background image style
        const originalBackgroundImage = printableForm.style.backgroundImage;

        // Step 1: Temporarily hide the background image before html2canvas capture
        // This ensures html2canvas only captures the form content (inputs/spans) on a transparent background
        printableForm.style.backgroundImage = 'none';

        // Step 2: Replace inputs with temporary spans containing their values
        inputElements.forEach(input => {
            const span = document.createElement('span');
            const computedStyle = window.getComputedStyle(input);

            // Copy inline styles directly for positioning & sizing
            span.style.position = 'absolute'; // Keep absolute positioning
            span.style.top = input.style.top;
            span.style.left = input.style.left;
            span.style.width = input.style.width;
            span.style.height = input.style.height;
            span.style.zIndex = '999'; // Ensure it's on top of the background image

            // Copy text and visual styles for content rendering
            span.style.fontSize = '0.78rem'; // Consistent font size
            span.style.color = 'black'; // Explicitly set text color to ensure visibility
            span.style.textAlign = computedStyle.textAlign;
            span.style.lineHeight = '1.2'; // Unitless line-height for consistency
            span.style.padding = '0'; // Remove any padding that might cause clipping
            span.style.borderRadius = computedStyle.borderRadius;
            span.style.fontFamily = computedStyle.fontFamily; // Ensure font consistency
            span.style.whiteSpace = 'nowrap'; // Prevent text from wrapping within the span
            span.style.overflow = 'hidden'; // Hide overflow if text is too long
            span.style.textOverflow = 'ellipsis'; // Add ellipsis if text is too long and hidden
            span.style.boxSizing = 'border-box'; // Ensure consistent box model

            span.style.pointerEvents = 'none'; // Make sure it's not interactive

            // Set text content, handle date input display format
            if (input.type === 'date') {
                if (input.value) {
                    const date = new Date(input.value);
                    span.textContent = date.toLocaleDateString('en-GB'); // Example: 20/08/2025
                } else {
                    span.textContent = ''; // Empty if no date selected
                }
            } else {
                span.textContent = input.value;
            }
            
            printableForm.appendChild(span);
            input.style.visibility = 'hidden'; // Hide the original input
            temporarySpans.push(span);
        });

        try {
            // Capture the form content with html2canvas (now only text/spans are visible)
            const contentCanvas = await html2canvas(printableForm, {
                scale: 10, // High scale for crisp text rendering
                logging: false,
                useCORS: true,
                scrollX: -window.scrollX,
                scrollY: -window.scrollY,
                windowWidth: document.documentElement.offsetWidth,
                windowHeight: document.documentElement.offsetHeight
            });

            // Restore original background image style immediately after capture
            printableForm.style.backgroundImage = originalBackgroundImage;

            // Step 3: Create PDF and add background image directly, then overlay content
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4'); // 'p' for portrait, 'mm' for millimeters, 'a4' for A4 size

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm

            // Load the original background image separately
            const backgroundImage = new Image();
            // Use a relative path to your high-resolution PNG/JPEG
            backgroundImage.src = 'recipet.png'; // <-- Ensure this path is correct and file exists
            
            await new Promise(resolve => {
                backgroundImage.onload = () => {
                    // Add the original background image to the PDF first
                    // Scale it to fit the A4 page perfectly
                    pdf.addImage(backgroundImage, 'JPEG', 0, 0, imgWidth, pageHeight);

                    // Get the image data from the content canvas (which has only the text)
                    const contentImgData = contentCanvas.toDataURL('image/png', 1.0); // Use PNG for transparency of text over background

                    // Add the text content image on top of the background
                    // Ensure it scales correctly to overlay the background
                    // The contentCanvas dimensions will be different due to `scale: 10`
                    const contentImgHeight = contentCanvas.height * imgWidth / contentCanvas.width;
                    pdf.addImage(contentImgData, 'PNG', 0, 0, imgWidth, contentImgHeight);
                    resolve();
                };
                backgroundImage.onerror = () => {
                    console.error("Failed to load background image for PDF.");
                    // Fallback: If background image fails to load, just add the content canvas
                    const contentImgData = contentCanvas.toDataURL('image/jpeg', 1.0);
                    const contentImgHeight = contentCanvas.height * imgWidth / contentCanvas.width;
                    pdf.addImage(contentImgData, 'JPEG', 0, 0, imgWidth, contentImgHeight);
                    resolve();
                };
            });

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
