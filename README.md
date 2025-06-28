# georgeGame

## How to Preview the Game on Your Computer (No Coding Needed!)

1. **Download or Clone the Repository**

   - If you received a ZIP file, unzip it to a folder on your computer.
   - If you are using GitHub, click the green "Code" button and choose "Download ZIP". Then unzip it.

2. **Open the Game in Your Browser**
   - Open the `GeorgeGame` folder.
   - Find the file named `index.html` inside the `GeorgeGame` folder.
   - **Double-click** `index.html` to open it in your web browser (like Chrome, Edge, Firefox, or Safari).
   - The game should load and you can play it!

### If You See a Blank Page or the Game Doesn't Load

Some browsers (especially Chrome) block local files from loading images and sounds for security reasons. If this happens:

#### Option 1: Try a Different Browser

- Firefox and Safari are more likely to work with double-clicking `index.html`.

#### Option 2: Use a Simple Local Server (Recommended for Chrome)

1. **If you have Python installed:**

   - Open the folder in your computer's file explorer.
   - Right-click inside the folder and choose "Open in Terminal" or "Open in Command Prompt".
   - Type this command and press Enter:
     - For Python 3:
       ```
       python3 -m http.server
       ```
     - For Windows (sometimes):
       ```
       python -m http.server
       ```
   - You will see a message like `Serving HTTP on 0.0.0.0 port 8000 ...`
   - Open your browser and go to: [http://localhost:8000/GeorgeGame/index.html](http://localhost:8000/GeorgeGame/index.html)

2. **If you don't have Python:**
   - Ask a friend to help you, or try Firefox/Safari as above.

---

**No coding or installation is required to play!**
Just open `index.html` in your browser, or use the local server method if you have trouble.
