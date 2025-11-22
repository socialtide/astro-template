# Form Setup Guide

This guide explains how to set up form handling for your Astro site. The template includes a contact form component that can be configured to submit data to various backends.

## Option 1: Google Sheets (Recommended for Simple Sites)

The easiest way to collect form submissions is using Google Sheets with Apps Script.

### Step 1: Create Your Spreadsheet

1. Create a new Google Sheet
2. Add headers in Row 1: `Timestamp`, `Name`, `Email`, `Message` (match your form fields)
3. Note your spreadsheet ID from the URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

### Step 2: Create the Apps Script

1. In your spreadsheet, go to **Extensions > Apps Script**
2. Replace the default code with:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);

  // Add timestamp and form data
  sheet.appendRow([
    new Date().toISOString(),
    data.name || "",
    data.email || "",
    data.message || "",
  ]);

  return ContentService.createTextOutput(
    JSON.stringify({ success: true }),
  ).setMimeType(ContentService.MimeType.JSON);
}
```

3. Click **Deploy > New deployment**
4. Select **Web app**
5. Set "Execute as" to **Me**
6. Set "Who has access" to **Anyone**
7. Click **Deploy** and copy the web app URL

### Step 3: Configure Your Site

Add the URL to your `.env` file:

```bash
PUBLIC_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### Step 4: Update the Contact Form

In `src/components/common/ContactForm.astro`, update the form submission:

```javascript
const form = document.getElementById("contact-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  try {
    const response = await fetch(import.meta.env.PUBLIC_GOOGLE_SHEETS_URL, {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (response.ok) {
      // Show success message
      form.reset();
    }
  } catch (error) {
    // Show error message
    console.error("Form submission failed:", error);
  }
});
```

## Option 2: Custom API Endpoint

For more control, you can submit to your own API.

### Example: Cloudflare Workers Function

Create a `functions/api/contact.ts` file:

```typescript
export async function onRequestPost({ request, env }) {
  const data = await request.json();

  // Validate data
  if (!data.email || !data.name) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Process the submission (e.g., send email, save to database)
  // await sendEmail(data);

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
```

## Option 3: Third-Party Services

### Formspree

1. Sign up at [formspree.io](https://formspree.io)
2. Create a form and get your endpoint
3. Update the form action:

```html
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
  <!-- form fields -->
</form>
```

### Netlify Forms (if using Netlify)

Add `data-netlify="true"` to your form:

```html
<form name="contact" method="POST" data-netlify="true">
  <!-- form fields -->
</form>
```

## Spam Protection with Cloudflare Turnstile

The template includes support for [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/), a privacy-friendly CAPTCHA alternative.

### Setup

1. Get your site key from the [Cloudflare Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile)
2. Add it to your `.env`:

```bash
PUBLIC_TURNSTILE_SITE_KEY=0x4AAA...
```

### Frontend Integration

The `ContactForm.astro` component automatically loads Turnstile when the site key is configured:

```html
<div
  class="cf-turnstile"
  data-sitekey="{import.meta.env.PUBLIC_TURNSTILE_SITE_KEY}"
></div>
```

### Backend Verification

Verify the token on your backend:

```typescript
async function verifyTurnstile(
  token: string,
  secretKey: string,
): Promise<boolean> {
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
      }),
    },
  );

  const data = await response.json();
  return data.success;
}
```

## Best Practices

1. **Always validate on the server** - Never trust client-side validation alone
2. **Rate limit submissions** - Prevent spam by limiting submissions per IP
3. **Send confirmation emails** - Let users know their submission was received
4. **Store submissions redundantly** - Use both database and email for important forms
5. **Test your forms** - Use different browsers and devices

## Troubleshooting

### Form not submitting

- Check browser console for errors
- Verify your endpoint URL is correct
- Ensure CORS is configured if using a custom API

### Google Sheets not receiving data

- Check the Apps Script execution logs
- Verify the deployment is set to "Anyone"
- Make sure the field names match between form and script

### Turnstile not loading

- Verify your site key is correct
- Check that the domain is allowed in Cloudflare settings
- Ensure the script is loading (check Network tab)
