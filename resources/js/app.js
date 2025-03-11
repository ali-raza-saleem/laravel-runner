document.addEventListener("alpine:init", () => {
  Alpine.data("root", () => ({
    init() {
      this.vscode = acquireVsCodeApi();
      document.addEventListener("keydown", (event) =>
        this.handleKeyboardShortcuts(event),
      );
      window.addEventListener("message", (event) =>
        this.handleVSCodeMessages(event),
      );

      this.showSearchBar = false;

      this.$watch("outputs", () => {
        this.$nextTick(() => {
          this.handleNewOutputAddedEvent();
        });
      });

      this.$watch("searchText", () => {
        this.debouncedSearch();
      });

      this.debouncedSearch = this.debounce(
        () => this.highlightSearchedText(),
        this.debouncedSearchDelayInMilliSeconds,
      );
    },

    vscode: null,
    codeIsRunning: false,
    stopCodeExecutionButtonVisibility: false,
    showSearchBar: false,
    outputs: [],
    outputElements: [],
    showDetailLogs: false,
    searchText: "",
    debouncedSearch: null,
    debouncedSearchDelayInMilliSeconds: 200,

    syncOutputElements() {
      this.outputElements = Array.from(
        this.$refs.outputContainer.querySelectorAll(".output-element"),
      );
    },

    handleVSCodeMessages(event) {
      const message = event.data;

      this.stopCodeExecutionButtonVisibility = message.isRunning;

      if (message.command === "scriptStarted") {
        this.stopCodeExecutionButtonVisibility = true;
      }
      if (message.command === "scriptKilled") {
        this.stopCodeExecutionButtonVisibility = false;
      }
      if (message.command === "updateOutput") {
        this.addNewOutput(
          message.content,
          message.isError,
          message.appendOutput,
        );
      }
      if (message.command === "clearOutput") {
        this.clearOutput();
      }
      if (message.command === "focusSearchBar") {
        this.$refs.searchInput.focus();
      }
    },

    handleKeyboardShortcuts(event) {
      if (event.ctrlKey && event.altKey) {
        event.preventDefault();
        const key = event.key.toLowerCase();
        if (key === "c") {
          this.clearOutput();
        }
        if (key === "f") {
          this.$refs.searchInput.focus();
        }
      }
    },

    addNewOutput(content, isError, appendOutput) {
      if (!appendOutput) {
        this.clearOutput();
      }

      const output = {
        content: content,
        isError: isError,
        appendOutput: appendOutput,
      };

      this.showSearchBar = true;

      // IMPORTANT: We wait for outputs to clear in next DOM update
      this.$nextTick(() => {
        this.outputs.push(output);
      });
    },

    handleNewOutputAddedEvent() {
      this.searchText = "";

      this.syncOutputElements();

      const lastElement = this.outputElements[this.outputElements.length - 1];
      const lastOutput = this.outputs[this.outputs.length - 1];
      lastOutput["element"] = lastElement;

      this.highlightOutput(lastOutput);

      // We don't want to scroll to the first element
      const isFirstElement = this.outputElements.length === 1;
      if (isFirstElement) {
        return;
      }

      this.scrollToOutput(lastOutput);
    },

    clearOutput() {
      this.outputs = [];
      this.outputElements = [];
      this.showSearchBar = false;
      this.searchText = "";
    },

    copyOutput(output) {
      const logText = output.content;

      if (!logText) {
        console.warn("No text to copy");
        return;
      }

      navigator.clipboard
        .writeText(logText)
        .then(() => {
          output.outputCopied = true;

          // Revert after 1.5 seconds
          setTimeout(() => {
            output.outputCopied = false;
          }, 1500);
        })
        .catch((err) => {
          console.error("Clipboard API failed:", err);
        });
    },

    scrollToOutput(output) {
      setTimeout(() => {
        output.element.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    },

    highlightOutput(output) {
      const highlightLanguage = output.isError ? "accessLog" : "php";

      window.hljs.highlightElement(output.element.querySelector("code"), {
        language: highlightLanguage,
      });
    },

    stopCodeExecution() {
      this.vscode.postMessage({ command: "stopExecution" });
      this.stopCodeExecutionButtonVisibility = false;
    },

    highlightSearchedText() {
      const outputContainer = this.$refs.outputContainer;
      if (!outputContainer) return; // Avoid errors if the container is not available

      const instance = new Mark(outputContainer);

      // Unmark previous highlights before applying new ones
      instance.unmark({
        done: () => {
          instance.mark(this.searchText, {
            separateWordSearch: false,
            className: "highlight",
            done: () => {
              // Find all highlighted elements in one go
              const highlightedElements =
                outputContainer.querySelectorAll(".highlight");

              // Scroll to the first highlighted element, if found
              if (highlightedElements.length > 0) {
                setTimeout(() => {
                  highlightedElements[0].scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }, 50);
              }
            },
          });
        },
      });
    },

    debounce(func, delay) {
      let timeout;
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
      };
    },
  }));
});
