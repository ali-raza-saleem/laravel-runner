document.addEventListener('DOMContentLoaded', function () {
  const outputContainer = document.getElementById('output-container')
  const clearButton = document.getElementById('clear-button')
  const searchInput = document.getElementById('search-input')
  const searchBar = searchInput.parentElement
  const stopButton = document.getElementById('stop-button')

  // (Added) References to modal elements:
  const errorModal = document.getElementById('error-modal')
  const errorModalClose = document.getElementById('error-modal-close')
  const errorModalLog = document.getElementById('error-modal-log')

  // Initially make the search bar invisible
  searchBar.style.visibility = 'hidden'

  // ✅ Keyboard Shortcuts in WebView
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.altKey) {
      const key = event.key.toLowerCase()
      event.preventDefault()

      if (key === 'c') {
        vscode.postMessage({ command: 'clearOutput' })
      } else if (key === 'f') {
        searchInput.focus()
      }
    }
  })

  const vscode = acquireVsCodeApi()

  // ✅ Handle Stop Button Click
  stopButton.addEventListener('click', () => {
    vscode.postMessage({ command: 'stopExecution' })
    stopButton.style.visibility = 'hidden'
  })

  // ✅ Handle Messages from VS Code Extension
  window.addEventListener('message', (event) => {
    const message = event.data

    if (message.command === 'scriptStarted') {
      stopButton.style.visibility = 'visible'
    }

    if (message.command === 'updateOutput') {
      stopButton.style.visibility = message.isRunning ? 'visible' : 'hidden'

      updateOutput(
        message.content,
        message.isError,
        message.isRunning,
        message.appendOutput,
      )
    }

    if (message.command === 'clearOutput') {
      outputContainer.innerHTML = ''
      searchBar.style.visibility = 'hidden'
    }

    if (message.command === 'focusSearchBar') {
      searchInput.focus()
    }
  })

  // ✅ Search Bar Shortcut
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'f') {
      event.preventDefault()
      searchInput.focus()
    }
  })

  // ✅ Handle Clear Button Click
  clearButton.addEventListener('click', () => {
    outputContainer.innerHTML = ''
    searchBar.style.visibility = 'hidden'
  })

  // ✅ Handle Search Input Changes
  searchInput.addEventListener('input', () => {
    highlightSearch(searchInput.value)
  })

  /**
   * ✅ Update Output Without Removing UI Elements
   * @param {string} content - Output content to display
   * @param {boolean} isError - Whether it's an error message
   * @param {boolean} isRunning - Whether script is currently running
   * @param {boolean} appendOutput - If false, clear previous output
   */
  function updateOutput(content, isError, isRunning, appendOutput) {
    const isFirstOutput = outputContainer.children.length == 0;

    // ✅ Clear output if appendOutput is false
    if (!appendOutput) {
        outputContainer.innerHTML = '';
    }

    if (isError) {
        const parsedContent = content.split('[Tinker Runner Exception]:');

        let minimalContent, fullContent;
        if (parsedContent.length == 2) {
            minimalContent = parsedContent[0];
            fullContent = parsedContent[1];
        } else {
            minimalContent = content;
            fullContent = content;
        }

        // 🚀 Don't remove existing errors when appending
        if (!appendOutput) {
            const existingErrors = outputContainer.querySelectorAll('.output-wrapper');
            existingErrors.forEach((errorBlock) => errorBlock.remove());
        }

        // Create the wrapper
        const wrapper = document.createElement('div');
        wrapper.classList.add('output-wrapper');

        // Create pre/code
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.textContent = minimalContent;
        code.style.color = '#ff5555'; // Extra guarantee it's red
        pre.appendChild(code);

        // "Show Log Details" button
        if (parsedContent.length == 2) {
            const showLogButton = document.createElement('button');
            showLogButton.innerText = 'Show Log Details';
            showLogButton.classList.add('show-log-btn');

            showLogButton.addEventListener('click', () => {
                errorModalLog.textContent = fullContent;
                errorModal.classList.add('show');
            });

            wrapper.appendChild(showLogButton);
        }

        wrapper.appendChild(pre);
        outputContainer.appendChild(wrapper);
    } else {
        // ✅ Append non-error messages normally
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.textContent = content;
        code.classList.add('language-php'); // Syntax highlighting for normal outputs
        pre.appendChild(code);
        outputContainer.appendChild(pre);

        // ✅ Syntax highlighting
        setTimeout(() => {
            window.hljs.highlightElement(code);
        }, 0);
    }

    // ✅ Make search bar visible
    searchBar.style.visibility = 'visible';

    // ✅ Highlight search term if any
    if (searchInput.value) {
        highlightSearch(searchInput.value);
    }

    // ✅ Scroll to last appended element
    if (appendOutput && !isFirstOutput) {
        const lastChild = outputContainer.lastElementChild;
        setTimeout(() => {
            lastChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
    }
}


  /**
   * ✅ Highlight Search Terms Without Removing Syntax Highlighting
   * @param {string} query - Search term to highlight
   */
  function highlightSearch(query) {
    const codeBlocks = outputContainer.querySelectorAll('pre code')
    codeBlocks.forEach((code) => {
      const instance = new Mark(code)
      instance.unmark({
        done: function () {
          if (query) {
            instance.mark(query, {
              separateWordSearch: false,
              className: 'highlight',
            })
          }
        },
      })
    })
  }

  // (Added) Close the modal when clicking the “×” icon
  errorModalClose.addEventListener('click', () => {
    errorModal.classList.remove('show')
  })
})
