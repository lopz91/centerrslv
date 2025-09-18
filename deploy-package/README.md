# Las Vegas Landscape Center - Deployment Package

This package contains a static HTML version of the Las Vegas Landscape Center website that can be uploaded to any web hosting service.

## Files Included

- `index.html` - Main website file
- `styles.css` - Custom CSS styles
- `script.js` - JavaScript functionality
- `README.md` - This file

## Deployment Instructions

### Option 1: File Manager Upload
1. Log into your web hosting control panel
2. Navigate to the File Manager or Public HTML folder
3. Upload all files from this package
4. Ensure `index.html` is in the root directory
5. Your website will be accessible at your domain

### Option 2: FTP Upload
1. Use an FTP client (FileZilla, WinSCP, etc.)
2. Connect to your hosting server
3. Upload all files to the public_html or www directory
4. Set proper file permissions (644 for files, 755 for directories)

### Option 3: cPanel File Manager
1. Log into cPanel
2. Open File Manager
3. Navigate to public_html
4. Upload and extract all files
5. Delete any existing index files if replacing

## Features

- **Responsive Design**: Works on all devices
- **Bilingual Support**: English/Spanish language switching
- **Professional Layout**: Clean, modern design
- **Contact Form**: Functional contact form
- **SEO Optimized**: Proper meta tags and structure
- **Fast Loading**: Optimized CSS and JavaScript

## Customization

### Colors
Edit the CSS variables in `styles.css` to change the color scheme:
\`\`\`css
:root {
  --primary: #d97706; /* Change primary color */
  --background: #ffffff; /* Change background */
  /* ... other colors */
}
\`\`\`

### Content
Edit `index.html` to update:
- Company information
- Product listings
- Contact details
- Images and descriptions

### Languages
Modify the `content` object in `script.js` to add more languages or update translations.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Internet Explorer 11+

## Technical Requirements

- Web server with HTML/CSS/JS support
- No database required
- No server-side processing needed
- Works with any hosting provider

## Support

For technical support or customization requests, contact your web developer or hosting provider.

## Version

Version 1.0 - Static HTML deployment package
Generated: 2024
