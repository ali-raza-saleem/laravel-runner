document.addEventListener('alpine:init', () => {
  Alpine.data('root', () => ({
    init() {
      this.vscode = acquireVsCodeApi()
      document.addEventListener('keydown', (event) =>
        this.handleKeyboardShortcuts(event),
      )
      window.addEventListener('message', (event) =>
        this.handleVSCodeMessages(event),
      )

      this.showSearchBar = false

      this.$watch('outputs', () => {
        this.$nextTick(() => {
          this.searchText = ''

          const oldOutputElementsCount = this.outputElements.length
          this.outputElements = Array.from(
            this.$refs.outputContainer.querySelectorAll('.output-element'),
          )

          if (
            !this.outputElements.length ||
            oldOutputElementsCount === this.outputElements.length
          ) {
            return
          }

          const isFirstElement = this.outputElements.length === 1
          let lastElement = this.outputElements[this.outputElements.length - 1]

          const lastOutput = this.outputs[this.outputs.length - 1]
          lastOutput['element'] = lastElement

          const highlightLanguage = lastOutput.isError ? 'accessLog' : 'php'

          window.hljs.highlightElement(
            lastElement.querySelector('.output-element-content'),
            { language: highlightLanguage },
          )

          // We don't want to scroll to the first element
          if (isFirstElement) {
            return
          }

          lastElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
      })
    },

    vscode: null,
    codeIsRunning: false,
    stopCodeExecutionButtonVisibility: false,
    showSearchBar: false,
    outputs: [],
    outputElements: {},
    showDetailLogs: false,
    searchText: '',

    collectOutputElements(el, index) {
      this.$nextTick(() => {
        this.outputElements[index] = el
      })
    },

    clearOutput() {
      this.outputs = []
      this.outputElements = []
      this.showSearchBar = false
    },

    stopCodeExecution() {
      this.vscode.postMessage({ command: 'stopExecution' })
      this.stopCodeExecutionButtonVisibility = false
    },

    handleVSCodeMessages(event) {
      const message = event.data

      this.stopCodeExecutionButtonVisibility = message.isRunning

      if (message.command === 'scriptStarted') {
        this.stopCodeExecutionButtonVisibility = true
      }
      if (message.command === 'scriptKilled') {
        this.stopCodeExecutionButtonVisibility = false
      }
      if (message.command === 'updateOutput') {
        this.updateOutput(
          message.content,
          message.isError,
          message.appendOutput,
        )
      }
      if (message.command === 'clearOutput') {
        this.clearOutput()
      }
      if (message.command === 'focusSearchBar') {
        this.$refs.searchInput.focus()
      }
    },

    handleKeyboardShortcuts(event) {
      if (event.ctrlKey && event.altKey) {
        event.preventDefault()
        const key = event.key.toLowerCase()
        if (key === 'c') {
          this.clearOutput()
        }
        if (key === 'f') {
          this.$refs.searchInput.focus()
        }
      }
    },

    updateOutput(content, isError, appendOutput) {
      if (!appendOutput) {
        this.clearOutput()
      }

      const output = {
        content: content,
        isError: isError,
        appendOutput: appendOutput,
      }

      this.showSearchBar = true

      // IMPORTANT: We wait for outputs to clear in next DOM update
      this.$nextTick(() => {
        this.outputs.push(output)
      })
    },

    highlightSearchedText() {

      const codeBlocks = this.$refs.outputContainer.querySelectorAll('pre code')
      codeBlocks.forEach((code) => {
        const instance = new Mark(code)
        instance.unmark({
          done: () => {
            instance.mark(this.searchText, {
              separateWordSearch: false,
              className: 'highlight',
            })
          },
        })
      })
    },

    highlightLog(output) {
      if (output['logHighlighted']) {
        return
      }

      this.$nextTick(() => {
        const code = output.element.querySelector('.log-text')
        window.hljs.highlightElement(code, { language: 'accessLog' })

        this.output['logHighlighted'] = true
      })
    },

    copyOutput(output) {
      const logText = output.content

      if (!logText) {
        console.warn('No text to copy')
        return
      }

      navigator.clipboard
        .writeText(logText)
        .then(() => {
          output.outputCopied = true

          // Revert after 1.5 seconds
          setTimeout(() => {
            output.outputCopied = false
          }, 1500)
        })
        .catch((err) => {
          console.error('Clipboard API failed:', err)
        })
    },
  }))
})
