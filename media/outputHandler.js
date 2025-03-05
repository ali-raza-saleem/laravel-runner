document.addEventListener("DOMContentLoaded", function () {
    const outputContainer = document.getElementById('output-container');
    const clearButton = document.getElementById('clear-button');
    const searchInput = document.getElementById('search-input');
    const searchBar = searchInput.parentElement; // Get the container of search input

    // Initially make the search bar invisible
    searchBar.style.visibility = 'hidden';

    // ✅ Handle Keyboard Shortcuts in WebView
    document.addEventListener("keydown", (event) => {
        if (event.ctrlKey && event.altKey) {
            const key = event.key.toLowerCase();
            event.preventDefault(); // Prevent default browser behavior

            if (key === "c") {
                vscode.postMessage({ command: "clearOutput" }); // ✅ Handle Ctrl+Alt+C
            } else if (key === "f") {
                searchInput.focus(); // ✅ Handle Ctrl+Alt+F
            }
        }
    });

    // ✅ Handle Messages from VS Code Extension
    window.addEventListener("message", (event) => {
        const message = event.data;

        if (message.command === "updateOutput") {
            updateOutput(message.content, message.isError, message.isRunning);
        } else if (message.command === "clearOutput") {
            outputContainer.innerHTML = "";
            searchBar.style.visibility = "hidden";
        } else if (message.command === "focusSearchBar") {
            searchInput.focus();
        }
    });

    // ✅ Ensure Search Bar Shortcut Works
    document.addEventListener("keydown", (event) => {
        if (event.ctrlKey && event.altKey && event.key.toLowerCase() === "f") {
            event.preventDefault();
            searchInput.focus();
        }
    });

    // ✅ Handle Clear Button Click
    clearButton.addEventListener('click', () => {
        outputContainer.innerHTML = '';
        searchBar.style.visibility = 'hidden'; // Hide search bar when output is cleared
    });

    // ✅ Handle Search Input Changes
    searchInput.addEventListener('input', () => {
        highlightSearch(searchInput.value);
    });

    /**
     * ✅ Update Output Without Removing UI Elements
     * @param {string} content - Output content to display
     * @param {boolean} isError - Whether it's an error message
     * @param {boolean} isRunning - Whether script is currently running
     */
    function updateOutput(content, isError, isRunning) {
        outputContainer.innerHTML = "";

        if (isRunning) {
            // ✅ Show "Running..." Indicator
            outputContainer.innerHTML = `
                <div id="loading">
                    <span class="loader"></span>
                </div>
            `;
        } else {
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.textContent = content;

            if (isError) {
                code.style.color = '#ff5555';
            } else {
                code.classList.add('language-php');
            }

            pre.appendChild(code);
            outputContainer.appendChild(pre);

            // ✅ Make search bar visible when there is content
            searchBar.style.visibility = 'visible';

            // ✅ Restore Syntax Highlighting
            setTimeout(() => {
                window.hljs.highlightElement(code);
            }, 0);

            // ✅ Highlight Search Term (if any)
            if (searchInput.value) {
                highlightSearch(searchInput.value);
            }

            // ✅ Smooth Scroll to Bottom
            setTimeout(() => {
                outputContainer.scrollTo({
                    top: outputContainer.scrollHeight,
                    behavior: 'smooth'
                });
            }, 50);
        }
    }

    /**
     * ✅ Highlight Search Terms Without Removing Syntax Highlighting
     * @param {string} query - Search term to highlight
     */
    function highlightSearch(query) {
        const codeBlocks = outputContainer.querySelectorAll('pre code');
        codeBlocks.forEach(code => {
            const instance = new Mark(code);
            instance.unmark({
                done: function () {
                    if (query) {
                        instance.mark(query, {
                            separateWordSearch: false,
                            className: 'highlight'
                        });
                    }
                }
            });
        });
    }
});
