document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('downloadBtn');
    const printableForm = document.getElementById('printableForm');

    downloadBtn.addEventListener('click', () => {
        const inputElements = printableForm.querySelectorAll('.form-input-overlay');
        const temporarySpans = [];

        // Step 1: Replace inputs with temporary spans containing their values
        inputElements.forEach(input => {
            const span = document.createElement('span');
            // Copy relevant styles to the span for correct positioning and appearance
            span.style.cssText = input.style.cssText; // Copy inline styles (top, left, width, height)
            span.className = input.className; // Copy class for inherited styles (font-size, color etc.)
            span.style.pointerEvents = 'none'; // Make sure it's not interactive
            span.style.zIndex = '999'; // Ensure it's above the image

            // Ensure background is transparent for capture, and text color is black
            span.style.backgroundColor = 'transparent';
            span.style.border = 'none';
            span.style.boxShadow = 'none';
            span.style.outline = 'none';
            span.style.color = 'black'; // Explicitly set text color to ensure visibility

            // Set text content, handle date input display format
            if (input.type === 'date') {
                // For date input, display in a readable format if a date is selected
                if (input.value) {
                    const date = new Date(input.value);
                    span.textContent = date.toLocaleDateString('en-GB'); // Example: 20/08/2025
                } else {
                    span.textContent = ''; // Empty if no date selected
                }
            } else {
                span.textContent = input.value;
            }
            
            // Append span, hide input, and store span for later removal
            printableForm.appendChild(span);
            input.style.visibility = 'hidden'; // Hide the original input
            temporarySpans.push(span);
        });

        // Step 2: Capture the form content with html2canvas
        html2canvas(printableForm, {
            scale: 2, // Increased scale for higher resolution A4 output
            logging: false, // Disable logging for cleaner console
            useCORS: true, // Enable if your image is hosted elsewhere (not strictly needed for local uploads)
            scrollX: -window.scrollX, // Account for scroll position
            scrollY: -window.scrollY, // Account for scroll position
            windowWidth: document.documentElement.offsetWidth, // Capture full width
            windowHeight: document.documentElement.offsetHeight // Capture full height
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/jpeg', 1.0); // Convert to JPEG with quality 1.0 (max)
            const link = document.createElement('a');
            link.download = 'filled_form_A4.jpeg'; // File name for download, indicating A4
            link.href = imgData;
            document.body.appendChild(link); // Append to body (necessary for Firefox)
            link.click(); // Trigger the download
            document.body.removeChild(link); // Clean up the temporary link

            // Step 3: Clean up - remove temporary spans and show original inputs
            temporarySpans.forEach(span => {
                printableForm.removeChild(span);
            });
            inputElements.forEach(input => {
                input.style.visibility = 'visible'; // Show the original input
            });

        }).catch(error => {
            console.error('Error generating image:', error);
            // Provide user feedback without using alert()
            const messageBox = document.createElement('div');
            messageBox.textContent = 'Failed to generate image. Please try again.';
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
            }, 3000); // Remove message after 3 seconds
        });
    });
});
