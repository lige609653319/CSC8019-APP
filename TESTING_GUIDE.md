# Unit Testing Guide

This project uses **Vitest** for unit testing the **Web Frontend** (`web-app`).

---

## 1. Web Frontend (`web-app`)

### Frameworks
- **Vitest**: A fast Vite-native testing framework.
- **React Testing Library**: For testing React components without relying on their implementation details.
- **jsdom**: A pure-JavaScript implementation of many web standards, notably the WHATWG DOM.

### How to Run Tests
Navigate to the `web-app` directory and run:
```bash
cd web-app
npm test
```
To run tests with a UI (optional):
```bash
npm run test:ui
```

### Folder Structure
Tests are located in `web-app/src/__tests__/`:
- `logic.test.js`: Example of testing pure JavaScript logic/functions.
- `dom.test.jsx`: Example of testing React components by rendering them and checking for expected DOM elements.

---

## 2. Testing Principles

### Logic Testing
Logic tests focus on **functions and data processing**. They do not require rendering components. Use them for utilities, calculation functions, and state management logic.

### DOM/Component Testing
Component tests focus on **User Experience and Interface**. They render the component into a virtual DOM environment and verify:
- What the user sees (text, images).
- How the application responds to user interactions (clicks, input).

### Mocking
When testing components that rely on external APIs or complex UI libraries, we use **mocks** to replace those dependencies with simple, predictable versions. This ensures tests are fast and reliable.
