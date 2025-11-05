# DY Code Preview

A Visual Studio Code extension for previewing and managing Dynamic Yield campaign code directly in your editor.

## Features

- **Live Preview**: Preview your campaign code in real-time with an embedded preview window
- **Multiple Campaign Types Support**:
  - Custom Code
  - Dynamic Content
  - Overlay Notifications
- **Variable Management**: Define and manage Dynamic Yield variables with a user-friendly interface
- **Campaign Settings**: Configure campaign-specific settings including:
  - Preview URL
  - Campaign Type
  - Dynamic Content Settings (selector and method)
- **File Templates**: Automatic generation of necessary campaign files:
  - template.js (JavaScript code)
  - template.html (HTML content)
  - style.css (CSS styles)
  - settings.json (Campaign configuration)
  - variables.json (Variable definitions)

## Requirements

- Visual Studio Code ^1.103.0
- Node.js
- Puppeteer (automatically installed as dependency)

## Installation

1. Install through VS Code Extensions marketplace
2. Search for "dy-code-preview"
3. Click Install

## Getting Started

1. Open the DY Code Preview panel from the Activity Bar
2. Create a new campaign using the "Create Campaign" command
3. Configure your campaign settings:
   - Enter the preview URL
   - Select campaign type
   - Configure additional settings based on campaign type
4. Add variables as needed
5. Edit your template files:
   - Add JavaScript code to `template.js`
   - Add HTML content to `template.html`
   - Add CSS styles to `style.css`
6. Use the live preview to see your changes in real-time
7. Click "Run Preview" to open a full preview in a new browser window

## Commands

- `DY Code Preview: Run` - Run the preview in a new browser window
- `DY Code Preview: Create Campaign` - Create a new campaign folder with template files

## Campaign Types

### Custom Code
Basic campaign type for injecting custom JavaScript code into the page.

### Dynamic Content
For replacing or inserting content in specific page elements:
- Select target element using CSS selector
- Choose insertion method:
  - Insert before
  - Replace
  - Insert after

### Overlay
For creating overlay notifications and popups with custom content.

## File Structure

A typical campaign folder contains:
```
campaign-folder/
├── settings.json      # Campaign configuration
├── template.js        # JavaScript code
├── template.html      # HTML content
├── style.css         # CSS styles
└── variables.json    # Variable definitions
```

## Extension Settings

This extension contributes the following settings:

* `dy-code-preview.run`: Execute preview
* `dy-code-preview.createCampaign`: Create new campaign

## Known Issues

- Preview might not work with websites that have strict Content Security Policy (CSP)
- Some dynamic content might not be visible in the embedded preview window

## Release Notes

### 0.0.1

Initial release of dy-code-preview with:
- Basic campaign creation
- Live preview functionality
- Variable management
- Multiple campaign type support

## Contributing

Feel free to submit issues and enhancement requests.

---

**Enjoy!**