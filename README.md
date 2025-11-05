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
2. Configure your campaign settings:
   - Enter the preview URL
   - Select campaign type
   - Configure additional settings based on campaign type
3. Add variables as needed
4. Edit your template files:
   - Add JavaScript code to `template.js`
   - Add HTML content to `template.html`
   - Add CSS styles to `style.css`
5. Use the live preview to see your changes in real-time
6. Click "Run Preview" to open a full preview in a new browser window

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
├── settings.json      # Campaign configuration (created by extension)
├── template.js        # JavaScript code
├── template.html      # HTML content
├── style.css         # CSS styles
└── variables.json    # Variable definitions (created by extension)
```

## Known Issues

- Preview might not work with websites that have strict Content Security Policy (CSP)
- Some dynamic content might not be visible in the embedded preview window
- DY variables now available only for javascript
- Not all cmapaign types are available

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