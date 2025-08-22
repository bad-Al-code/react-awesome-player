# Contributing to React Awesome Player

First off, thank you for considering contributing! Your help is essential for keeping this project great. This document will guide you through the process.

## Code of Conduct

This project and everyone participating in it is governed by a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please ensure the bug was not already reported by searching on GitHub under [Issues](https://github.com/bad-Al-code/react-awesome-player/issues). If you're unable to find an open issue addressing the problem, open a new one. Be sure to include a **title and clear description**, as much relevant information as possible, and a **code sample** or an **executable test case** demonstrating the expected behavior that is not occurring.

### Suggesting Enhancements

We're always looking for suggestions to improve the player. If you have an idea, please open an issue with the "enhancement" label. Clearly describe the feature and why it would be valuable.

### Pull Requests

1.  Fork the repository and create your branch from `main`.
2.  If you've added code that should be tested, add tests.
3.  Ensure the test suite passes (`pnpm test`).
4.  Make sure your code lints (`pnpm lint`).
5.  Issue that pull request!

## Development Setup

To get the project running locally, follow these steps:

1.  **Fork and clone the repository.**
2.  **Install dependencies using pnpm:**
    ```bash
    pnpm install
    ```
3.  **Run the development playground:**
    ```bash
    pnpm dev
    ```
    This will start a Vite dev server where you can see and test your changes live.

## Scripts

- `pnpm dev`: Starts the local development server and playground.
- `pnpm build`: Compiles the package for production.
- `pnpm test`: Runs the entire test suite with Vitest.
- `pnpm lint`: Lints all project files for errors.
- `pnpm format`: Formats all project files with Prettier.

Thanks again for your contribution!
