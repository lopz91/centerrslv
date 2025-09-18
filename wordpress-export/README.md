# Las Vegas Landscape Center - WordPress Import Guide

This package contains everything you need to import your landscape center website into WordPress.

## Files Included

1. **landscape-center-export.xml** - WordPress export file (WXR format)
2. **landscape-center-styles.css** - Complete CSS styling
3. **README.md** - This installation guide

## Installation Instructions

### Step 1: Import Content
1. Log into your WordPress admin dashboard
2. Go to **Tools > Import**
3. Install the "WordPress Importer" if not already installed
4. Click "Run Importer" under WordPress
5. Upload the `landscape-center-export.xml` file
6. Assign authors or create new ones as needed
7. Check "Download and import file attachments" if you want to import images
8. Click "Submit"

### Step 2: Apply Styling
1. Go to **Appearance > Theme Editor** (or use FTP/cPanel)
2. Open your theme's `style.css` file
3. Copy the contents of `landscape-center-styles.css` and paste at the end of your theme's CSS
4. Save the file

### Step 3: Set Up Pages
1. Go to **Settings > Reading**
2. Set "Your homepage displays" to "A static page"
3. Choose "Home" as your homepage
4. Choose "Products" or create a blog page for posts page
5. Save changes

### Step 4: Configure Menus
1. Go to **Appearance > Menus**
2. Create a new menu called "Main Navigation"
3. Add the imported pages: Home, About, Products, Contact
4. Assign the menu to your theme's primary menu location

### Step 5: Install Required Plugins (Optional)
For enhanced functionality, consider installing:
- **Contact Form 7** - For the contact form
- **WooCommerce** - If you want e-commerce functionality
- **Yoast SEO** - For better SEO optimization
- **WPML** - For bilingual support (English/Spanish)

## Content Structure

The import includes:

### Pages
- **Home** - Complete homepage with hero section, quick links, contractor signup, and social media
- **About** - Company information and services
- **Products** - Product categories and contractor benefits
- **Contact** - Contact information, hours, and contact form

### Categories
- Irrigation
- Hardscape  
- Lighting
- Tools

### Features Included
- Professional contractor pricing information
- Same-day delivery messaging
- Bilingual content structure (ready for translation plugins)
- Mobile-responsive design
- Contact forms and newsletter signup
- Social media integration
- Professional color scheme (warm amber and nature tones)

## Customization Notes

### Colors
The design uses a warm, nature-inspired color palette:
- Primary: #d97706 (warm amber)
- Background: #ffffff (white)
- Cards: #fefce8 (warm cream)
- Text: #374151 (dark gray)

### Fonts
- Headings: Playfair Display (serif)
- Body: System fonts (Segoe UI, Roboto, etc.)

### Database Integration
The original site was built with Supabase integration for:
- Product catalog
- User accounts
- Shopping cart
- Order management

To replicate this functionality in WordPress, consider:
- WooCommerce for e-commerce
- Custom post types for products
- User registration plugins
- Membership plugins for contractor accounts

## Support

This export contains the complete content structure and styling from your Next.js landscape center website. The design is fully responsive and includes all the professional features needed for a landscape supply business.

For additional customization or WordPress development support, consult with a WordPress developer familiar with landscape/construction industry websites.
