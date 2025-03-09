document.addEventListener('DOMContentLoaded', function () {
  const vscode = acquireVsCodeApi();
  
  /*** Element References ***/
  const elements = {
      outputContainer: document.getElementById('output-container'),
      clearButton: document.getElementById('clear-button'),
      searchInput: document.getElementById('search-input'),
      searchBar: document.getElementById('search-input').parentElement,
      stopButton: document.getElementById('stop-button'),
      errorModal: document.getElementById('error-modal'),
      errorModalClose: document.getElementById('error-modal-close'),
      errorModalLog: document.getElementById('error-modal-log')
  };

  /*** Initialize ***/
  elements.searchBar.style.visibility = 'hidden';
  
  /*** Event Listeners ***/
  elements.clearButton.addEventListener('click', clearOutput);
  elements.stopButton.addEventListener('click', stopExecution);
  elements.searchInput.addEventListener('input', () => highlightSearch(elements.searchInput.value));
  elements.errorModalClose.addEventListener('click', () => elements.errorModal.classList.remove('show'));
  
  document.addEventListener('keydown', handleKeyboardShortcuts);
  window.addEventListener('message', handleVSCodeMessages);

  /*** Function Definitions ***/
  function handleKeyboardShortcuts(event) {
      if (event.ctrlKey && event.altKey) {
          event.preventDefault();
          const key = event.key.toLowerCase();
          if (key === 'c') clearOutput();
          else if (key === 'f') elements.searchInput.focus();
      }
  }

  function handleVSCodeMessages(event) {
      const message = event.data;

      elements.stopButton.style.visibility = message.isRunning ? 'visible' : 'hidden';

      switch (message.command) {
          case 'scriptStarted':
              toggleStopButton(true);
              break;
          case 'scriptKilled':
              toggleStopButton(false);
              break;
          case 'updateOutput':
              updateOutput(message.content, message.isError, message.isRunning, message.appendOutput);
              break;
          case 'clearOutput':
              clearOutput();
              break;
          case 'focusSearchBar':
              elements.searchInput.focus();
              break;
      }
  }

  function stopExecution() {
      vscode.postMessage({ command: 'stopExecution' });
      toggleStopButton(false);
  }

  function clearOutput() {
      elements.outputContainer.innerHTML = '';
      elements.searchBar.style.visibility = 'hidden';
  }

  function toggleStopButton(visible) {
      elements.stopButton.style.visibility = visible ? 'visible' : 'hidden';
  }

  function updateOutput(content, isError, isRunning, appendOutput) {
      if (!appendOutput) elements.outputContainer.innerHTML = '';

      $isFirstElement = elements.outputContainer.children.length === 0;
      
      const newElement = isError ? appendErrorOutput(content) : appendNormalOutput(content);
      
      elements.searchBar.style.visibility = 'visible';
      if (elements.searchInput.value) highlightSearch(elements.searchInput.value);

      // Scroll to the start of the new appended element
      if (newElement && !$isFirstElement) {
          setTimeout(() => {
              newElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 50);
      }
  }

  function appendErrorOutput(content) {
      const parsedContent = content.split('[Tinker Runner Exception]:');
      const minimalContent = parsedContent.length === 2 ? parsedContent[0] : content;
      const fullContent = parsedContent.length === 2 ? parsedContent[1] : content;

      const wrapper = document.createElement('div');
      wrapper.classList.add('output-wrapper');

      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = minimalContent;
      code.style.color = '#ff5555';
      pre.appendChild(code);
      wrapper.appendChild(pre);

      if (parsedContent.length === 2) {
          const showLogButton = document.createElement('button');
          showLogButton.innerText = 'Show Log Details';
          showLogButton.classList.add('show-log-btn');
          showLogButton.addEventListener('click', () => {
              elements.errorModalLog.textContent = fullContent;
              elements.errorModal.classList.add('show');
          });
          wrapper.appendChild(showLogButton);
      }

      elements.outputContainer.appendChild(wrapper);
      return wrapper;
  }

  function appendNormalOutput(content) {
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = content;
      code.classList.add('language-php');
      pre.appendChild(code);
      elements.outputContainer.appendChild(pre);

      setTimeout(() => window.hljs.highlightElement(code), 0);
      return pre;
  }

  function highlightSearch(query) {
      const codeBlocks = elements.outputContainer.querySelectorAll('pre code');
      codeBlocks.forEach((code) => {
          const instance = new Mark(code);
          instance.unmark({
              done: () => query && instance.mark(query, { separateWordSearch: false, className: 'highlight' })
          });
      });
  }
});
