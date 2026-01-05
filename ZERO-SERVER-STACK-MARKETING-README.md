# Zero-Server Stack Marketing Document

## Overview
This is a branded HTML document explaining "The Zero-Server Stack: Stop Renting Your Financial History" for LinkedIn marketing posts.

## Files
- `zero-server-stack-marketing.html` - Standalone HTML document with embedded styles
- `vanessa-paul-comment.png` - Screenshot of Vanessa Paul's comment (you need to add this file)

## Setup Instructions

### Adding the Screenshot
1. Save the Vanessa Paul comment screenshot as `vanessa-paul-comment.png`
2. Place it in the same directory as `zero-server-stack-marketing.html`
3. The image will automatically display in the document

**Note:** If the image is not found, a placeholder will be shown. Make sure the filename matches exactly: `vanessa-paul-comment.png`

## How to Use

### Option 1: Browser Print to PDF (Recommended)
1. Open `zero-server-stack-marketing.html` in any modern web browser
2. Press `Ctrl+P` (Windows/Linux) or `Cmd+P` (Mac) to open print dialog
3. Select "Save as PDF" or "Microsoft Print to PDF" as the destination
4. Click "Save" or "Print"
5. The PDF will be saved with proper formatting

### Option 2: Online HTML to PDF Converter
1. Upload `zero-server-stack-marketing.html` to an online converter like:
   - HTML to PDF (htmlpdfapi.com)
   - PDF24 (pdf24.org)
   - SmallPDF (smallpdf.com)
2. Download the converted PDF

### Option 3: Command Line (if you have tools installed)
```bash
# Using wkhtmltopdf
wkhtmltopdf zero-server-stack-marketing.html zero-server-stack-marketing.pdf

# Using Puppeteer (if you have Node.js)
node -e "const puppeteer = require('puppeteer'); (async () => { const browser = await puppeteer.launch(); const page = await browser.newPage(); await page.goto('file://' + __dirname + '/zero-server-stack-marketing.html', { waitUntil: 'networkidle0' }); await page.pdf({ path: 'zero-server-stack-marketing.pdf', format: 'A4', printBackground: true }); await browser.close(); })();"
```

## Brand Guidelines Applied
- **Primary Accent:** `#ff6b35` (orange - growth, positive)
- **Warm Accent:** `#f59e0b` (amber)
- **Brand Blue:** `#2563eb`
- **Typography:** System UI fonts for clean, professional look
- **Layout:** Print-optimized with proper page breaks

## Content Sections
1. **Header** - Brand logo and title
2. **Introduction** - Core philosophy
3. **The Zero-Server Stack** - Technical architecture
4. **Key Takeaways** - Sovereign Sync benefits
5. **Real-World Example** - Unrealised vs Realised P/L
6. **Philosophy** - Local-first principles
7. **Footer** - Brand links and copyright

## LinkedIn Post Suggestions
- Use the PDF as an attachment or link
- Extract key quotes for the post text
- Tag relevant communities (#LocalFirst #Privacy #FinTech #OpenSource)
- Include a call-to-action to download or read the full document

## Customization
The HTML file is self-contained with embedded CSS. You can easily modify:
- Colors in the `:root` CSS variables
- Content in the HTML sections
- Styling for different brand requirements

