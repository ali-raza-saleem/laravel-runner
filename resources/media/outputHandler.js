document.addEventListener('alpine:init', () => {
  Alpine.data('outputHandler', () => ({
      outputContainer: null,
      clearButton: null,
      searchInput: null,
      searchBar: null,
      searchBarVisible: false,
      showStopButton: false,
      vscode: null,
      errorModal: null,
      errorModalClose: null,
      errorModalLog: null,

      init() {
          // ✅ Assign Alpine.js refs
          this.outputContainer = this.$refs.outputContainer;
          this.clearButton = this.$refs.clearButton;
          this.searchInput = this.$refs.searchInput;
          this.searchBar = this.searchInput.parentElement;
          this.stopButton = this.$refs.stopButton;
          this.errorModal = this.$refs.errorModal;
          this.errorModalClose = this.$refs.errorModalClose;
          this.errorModalLog = this.$refs.errorModalLog;

          // ✅ Default states
          this.searchBarVisible = false;
          this.showStopButton = false;
          this.vscode = acquireVsCodeApi();

          this.clearButton.addEventListener('click', () => {
              this.outputContainer.innerHTML = '';
              this.searchBarVisible = false;
          });

          this.stopButton.addEventListener('click', () => {
              this.stopExecution();
          });

          // ✅ Listen for messages from VS Code extension
          window.addEventListener('message', (event) => {
              const message = event.data;

              if (message.command === 'scriptStarted') {
                  this.showStopButton = true;
              }

              if (message.command === 'updateOutput') {
                  this.showStopButton = message.isRunning;

                  this.updateOutput(
                      message.content,
                      message.isError,
                      message.isRunning,
                      message.appendOutput,
                  );
              }

              if (message.command === 'clearOutput') {
                  this.outputContainer.innerHTML = '';
                  this.searchBarVisible = false;
              }

              if (message.command === 'focusSearchBar') {
                  this.searchInput.focus();
              }
          });

          // ✅ Keyboard Shortcuts
          document.addEventListener('keydown', (event) => {
              if (event.ctrlKey && event.altKey) {
                  const key = event.key.toLowerCase();
                  event.preventDefault();

                  if (key === 'c') {
                      this.vscode.postMessage({ command: 'clearOutput' });
                  } else if (key === 'f') {
                      this.searchInput.focus();
                  }
              }
          });

          // ✅ Handle Search Input Changes
          this.searchInput.addEventListener('input', () => {
              this.highlightSearch(this.searchInput.value);
          });

          // ✅ Close Modal on Click
          this.errorModalClose.addEventListener('click', () => {
              this.errorModal.classList.remove('show');
          });
      },

      /**
       * ✅ Update Output Without Removing UI Elements
       * @param {string} content - Output content to display
       * @param {boolean} isError - Whether it's an error message
       * @param {boolean} isRunning - Whether script is currently running
       * @param {boolean} appendOutput - If false, clear previous output
       */
      updateOutput(content, isError, isRunning, appendOutput) {
          const isFirstOutput = this.outputContainer.children.length < 2;

          // ✅ Clear output if appendOutput is false
          if (!appendOutput) {
              this.outputContainer.innerHTML = '';
          }

          // ✅ If error, remove old errors to prevent duplicates
          if (isError) {
              const parsedContent = content.split('[Tinker Runner Exception]:');

              let minimalContent, fullContent;
              if (parsedContent.length === 2) {
                  minimalContent = parsedContent[0];
                  fullContent = parsedContent[1];
              } else {
                  minimalContent = content;
                  fullContent = content;
              }

              const existingErrors = this.outputContainer.querySelectorAll('.output-wrapper');
              existingErrors.forEach((errorBlock) => errorBlock.remove());

              // ✅ Create the wrapper
              const wrapper = document.createElement('div');
              wrapper.classList.add('output-wrapper');

              // ✅ Create pre/code
              const pre = document.createElement('pre');
              const code = document.createElement('code');
              code.textContent = minimalContent;
              code.style.color = '#ff5555'; // Force error color
              pre.appendChild(code);

              // ✅ "Show Log Details" button
              const showLogButton = document.createElement('button');
              showLogButton.innerText = 'Show Log Details';
              showLogButton.classList.add('show-log-btn');

              showLogButton.addEventListener('click', () => {
                  // Put full error text in modal
                  this.errorModalLog.textContent = fullContent;
                  this.errorModal.classList.add('show');
              });

              // ✅ Append everything
              wrapper.appendChild(pre);
              if (parsedContent.length === 2) {
                  wrapper.appendChild(showLogButton);
              }
              this.outputContainer.appendChild(wrapper);
          } else {
              // ✅ Original logic for non-error outputs
              const pre = document.createElement('pre');
              const code = document.createElement('code');
              code.textContent = content;
              code.classList.add('language-php'); // Syntax highlighting
              pre.appendChild(code);

              // ✅ Append to container
              this.outputContainer.appendChild(pre);

              // ✅ Syntax highlighting
              setTimeout(() => {
                  window.hljs.highlightElement(code);
              }, 0);
          }

          // ✅ Make search bar visible
          this.searchBarVisible = true;

          // ✅ Highlight search term if any
          if (this.searchInput.value) {
              this.highlightSearch(this.searchInput.value);
          }

          // ✅ Scroll only if it's not the first output
          if (appendOutput && !isFirstOutput) {
              const lastChild = this.outputContainer.lastElementChild;
              setTimeout(() => {
                  lastChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }, 50);
          }
      },

      /**
       * ✅ Highlight Search Terms Without Removing Syntax Highlighting
       * @param {string} query - Search term to highlight
       */
      highlightSearch(query) {
          const codeBlocks = this.outputContainer.querySelectorAll('pre code');
          codeBlocks.forEach((code) => {
              const instance = new Mark(code);
              instance.unmark({
                  done: function () {
                      if (query) {
                          instance.mark(query, {
                              separateWordSearch: false,
                              className: 'highlight',
                          });
                      }
                  },
              });
          });
      },

      stopExecution() {
        if (this.vscode) {
            this.vscode.postMessage({ command: 'stopExecution' });  // ✅ Send stop message to VS Code
            this.showStopButton = false;  // ✅ Hide button after stopping
        } else {
            console.error('VSCode API is not available.');
        }
      },
  }));
});
