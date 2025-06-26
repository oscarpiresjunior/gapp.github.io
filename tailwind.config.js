
// This file is mostly for reference if a local Tailwind CSS setup is used.
// With the CDN script in index.html, configurations are typically done in the <script> tag.
// However, the script tag in index.html already includes theme extensions.
module.exports = {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      colors: {
        'brazil-blue': '#002776',
        'brazil-green': '#009C3B',
        'brazil-yellow': '#FFDF00',
      }
    },
  },
  plugins: [],
}
