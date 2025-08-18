document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('downloadBtn');
    const printableForm = document.getElementById('printableForm');

    downloadBtn.addEventListener('click', () => {
        const inputElements = printableForm.querySelectorAll('.form-input-overlay');
        const temporarySpans = [];

        // Step 1: Replace inputs with temporary spans containing their values
        inputElements.forEach(input => {
            const span = document.createElement('span');
            const computedStyle = window.getComputedStyle(input);

            // --- CRUCIAL CHANGE: Copy inline styles directly for positioning & sizing ---
            // This ensures html2canvas uses the exact percentage values defined in index.html
            span.style.position = 'absolute'; // Keep absolute positioning
            span.style.top = input.style.top;
            span.style.left = input.style.left;
            span.style.width = input.style.width;
            span.style.height = input.style.height;
            // --- END CRUCIAL CHANGE ---

            span.style.zIndex = '999'; // Ensure it's on top of the background image

            // Copy text and visual styles for content rendering
            span.style.fontSize = '0.8rem'; // Slightly adjusted for better fit, ensure it's not too large
            span.style.color = 'black'; // Explicitly set text color to ensure visibility
            span.style.textAlign = computedStyle.textAlign;
            span.style.lineHeight = 'normal'; // Explicitly set line-height to 'normal' or '1.2em' for better vertical fit
            span.style.padding = '0'; // Remove any padding that might cause clipping
            span.style.borderRadius = computedStyle.borderRadius;
            span.style.fontFamily = computedStyle.fontFamily; // Ensure font consistency
            span.style.whiteSpace = 'nowrap'; // Prevent text from wrapping within the span
            span.style.overflow = 'hidden'; // Hide overflow if text is too long (less likely with increased width)
            span.style.textOverflow = 'ellipsis'; // Add ellipsis if text is too long and hidden

            // Ensure no border/background from inputs for capture
            span.style.backgroundColor = 'transparent';
            span.style.border = 'none';
            span.style.boxShadow = 'none';
            span.style.outline = 'none';

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

        // Step 2: Capture the form content with html2canvas
        html2canvas(printableForm, {
            scale: 4, // Increased scale for even higher resolution A4 output
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
