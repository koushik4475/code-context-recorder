# Contributing to Code Context Recorder

First off, thank you for considering contributing to Code Context Recorder! 🎉

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples**
* **Describe the behavior you observed and what you expected**
* **Include screenshots if relevant**
* **Include your environment details** (OS, VS Code version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior and expected behavior**
* **Explain why this enhancement would be useful**

### Pull Requests

* Fill in the required template
* Follow the TypeScript styleguide
* Include appropriate test coverage
* Update documentation as needed
* End all files with a newline

## Development Setup

### Prerequisites

* Node.js 18+
* npm 9+
* VS Code (for extension development)

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/code-context-recorder.git
cd code-context-recorder

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test
```

### Project Structure

```
code-context-recorder/
├── packages/
│   ├── core/              # Core library
│   ├── vscode-extension/  # VS Code extension
│   ├── browser-extension/ # Browser extension
│   ├── cli/               # CLI tool
│   ├── git-hooks/         # Git hooks
│   └── web-viewer/        # Web UI
```

### Working on Core Package

```bash
cd packages/core
npm run dev  # Watch mode
npm test     # Run tests
```

### Working on VS Code Extension

```bash
cd packages/vscode-extension
npm run dev  # Watch mode

# Press F5 in VS Code to launch Extension Development Host
```

### Working on CLI

```bash
cd packages/cli
npm run dev

# Test CLI
npm link
ccr --help
```

## Coding Guidelines

### TypeScript Style

* Use TypeScript strict mode
* Prefer interfaces over types for object shapes
* Use meaningful variable names
* Add JSDoc comments for public APIs
* Use async/await over promises

### Example

```typescript
/**
 * Add context to a file
 * @param content - The context content
 * @param filePath - Path to the file
 * @param options - Additional options
 * @returns The context ID
 */
async addContext(
  content: string,
  filePath: string,
  options?: AddContextOptions
): Promise<string> {
  // Implementation
}
```

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters
* Reference issues and pull requests liberally after the first line

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Code style changes (formatting, etc.)
* **refactor**: Code refactoring
* **test**: Adding or updating tests
* **chore**: Maintenance tasks

Examples:
```
feat(core): add voice note support

Implement voice recording and transcription functionality
for capturing verbal context explanations.

Closes #123
```

## Testing

* Write tests for all new features
* Ensure all tests pass before submitting PR
* Maintain test coverage above 80%

```bash
# Run all tests
npm test

# Run tests for specific package
cd packages/core
npm test

# Run tests in watch mode
npm test -- --watch
```

## Documentation

* Update README.md if you change functionality
* Add JSDoc comments to all public APIs
* Update CHANGELOG.md with your changes
* Create/update examples if needed

## Release Process

1. Update version in all package.json files
2. Update CHANGELOG.md
3. Create git tag
4. Push to GitHub
5. GitHub Actions will handle publishing

## Questions?

* Open an issue with the `question` label
* Join our Discord community
* Email us at hello@code-context-recorder.dev

## Recognition

Contributors will be recognized in:
* README.md Contributors section
* Release notes
* Project website

Thank you for contributing! 🚀
