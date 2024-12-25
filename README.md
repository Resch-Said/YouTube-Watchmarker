# YouTube Watchmarker

This Chrome extension marks watched YouTube videos and shorts by graying out the thumbnails, adding a "Watched" label, and displaying the date when the video was watched.

## Installation

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Build the project using `npm run build`.
4. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `youtube-watch-marker` directory

## Features

- Marks watched videos and shorts
- Adds a "Watched" label to thumbnails
- Displays the date when the video was watched

## Development

- `src/background`: Background script to manage watch history
- `src/content`: Content scripts to mark watched videos
- `src/storage`: Utility functions to manage storage
- `public`: Extension manifest and icons

## License

MIT
