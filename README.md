# Fragments

This repository contains the source code for the Fragments back-end API, built using Node.js and Express. Follow the steps below to set up and run the project on your local machine.

## Prerequisites

Make sure you have the following software installed on your development machine:

- Node.js (LTS version)
- Visual Studio Code (VSCode)
  - Extensions:
    - ESLint
    - Prettier - Code Formatter
    - Code Spell Checker
    - Git CLI

### API Server Setup

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/TirthPatel-tp/fragments.git
    cd fragments
    ```

2.  **Initialize npm**

    ```bash
    npm init -y
    ```

3.  **_Modify package.json:_**

    -Update the package.json file with the provided configuration.

4.  **_Install Dependencies:_**

    ```bash
    npm install
    ```

5.  **_Setup ESLint:_**

    ```bash
    npm install --save-dev eslint
    npx eslint --init
    ```

6.  **_Structured Logging and Pino Setup:_**

-Install Pino dependencies.
-Create src/logger.js with provided configuration.

7. **_Run ESLint:_**

   ```bash
   npm run lint
   ```

8. **_Start the Server:_**

   ```bash
   npm start
   ```

9. **_Development Mode (Auto-reload):_**

   ```bash
   npm run dev
   ```

10. **_Debug Mode:_**

    ```bash
    npm run debug
    ```
