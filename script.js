document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('downloadBtn');
    const printableForm = document.getElementById('printableForm'); // Updated ID reference

    downloadBtn.addEventListener('click', () => {
        // Temporarily hide borders and adjust styling for a cleaner capture
        printableForm.querySelectorAll('.form-input-overlay').forEach(input => {
            input.style.border = 'none';
            input.style.backgroundColor = 'transparent'; // Ensure full transparency for capture
            input.style.boxShadow = 'none';
            input.style.outline = 'none';
        });

        html2canvas(printableForm, { // Use the updated ID
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

            // Restore original styling after capture
            printableForm.querySelectorAll('.form-input-overlay').forEach(input => {
                input.style.border = ''; /* Reset to CSS defined border */
                input.style.backgroundColor = ''; /* Reset to CSS defined background */
                input.style.boxShadow = '';
                input.style.outline = '';
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
