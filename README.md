# Node Secrets Manager

This repository demonstrates a robust and type-safe approach to managing secrets and configurations in a Node.js application. It features an environment-aware system that dynamically resolves secrets from different sources, such as local environment variables for development and [Infisical](https://infisical.com/) for production.

## Key Features

-   **Environment-Based Configuration**: Easily manage distinct configurations for `LOCAL`, `DEV`, and `PROD` environments using simple JSON files.
-   **Dynamic Secret Resolution**: A provider pattern fetches secrets from different sources based on the current environment.
-   **Production-Ready with Infisical**: Seamlessly integrates with Infisical for secure secret management in production.
-   **Schema Validation**: Uses [Zod](https://zod.dev/) to validate configurations at startup, ensuring they are type-safe and preventing runtime errors.
-   **Immutable Configuration**: Once loaded, the configuration object is frozen to prevent accidental modifications during runtime.
-   **Structured Logging**: Utilizes [Pino](https://getpino.io/) for high-performance, structured JSON logging.

## How It Works

The configuration loading process is initiated at application startup and is designed to be robust and fail-fast.

1.  **Environment Detection**: The `NODE_ENV` environment variable (`LOCAL`, `DEV`, or `PROD`) determines which configuration to load.
2.  **Configuration File Loading**: The corresponding `secrets.json` file is loaded from the `configuration/{NODE_ENV}/` directory.
3.  **Secret Provider Selection**:
    -   For `PROD`, an `InfisicalProvider` is created, which requires `INFISICAL_CLIENT_ID`, `INFISICAL_CLIENT_SECRET`, and `INFISICAL_PROJECT_ID` environment variables.
    -   For all other environments (`LOCAL`, `DEV`), a `LocalProvider`, with a combination of `Infisical CLI` is used, which resolves secrets that is injected to the environment variables before startup.
4.  **Secret Resolution**: The application iterates through the loaded JSON configuration:
    -   Plain values are used as-is.
    -   Values with a `secretRef` (e.g., `{"secretRef": "infisical://DB_URL"}`) are resolved by the selected provider. The provider fetches the secret from its source (Infisical or `process.env`).
5.  **Validation**: The fully resolved configuration object is validated against a Zod schema (`src/config/secrets/schema.ts`). If validation fails, the application exits to prevent running with an invalid configuration.
6.  **Global Access**: The validated, type-safe, and immutable configuration object is made available throughout the application via the `getConfig()` function.

## Project Structure

```
.
├── configuration/
│   ├── DEV/
│   │   └── secrets.json      # Config for 'dev' environment
│   ├── LOCAL/
│   │   └── secrets.json      # Config for 'local' environment
│   └── PROD/
│       └── secrets.json      # Config for 'production' environment
└── src/
    ├── config/
    │   └── secrets/
    │       ├── schema.ts     # Zod schema for config validation
    │       ├── secrets.ts    # Core logic for loading and resolving configs
    │       └── provider/
    │           ├── index.ts  # Factory to create the correct provider
    │           ├── local.ts  # Provider for local/dev environments
    │           └── prod.ts   # Provider for Infisical (production)
    ├── lib/
    │   └── logger.ts         # Pino logger configuration
    ├── index.ts              # Application entry point
    └── server.ts             # Express server setup
```

## Getting Started

### Prerequisites

-   Node.js (v18 or later)
-   npm, pnpm, or yarn
-   [Infisical CLI](https://infisical.com/docs/cli/overview) (for running the `dev` script)

### Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/daechan0615/node-secrets-manager.git
cd node-secrets-manager
npm install
```

### Configuration

The application requires the `NODE_ENV` environment variable to be set.

#### Development (`dev`)

The `dev` script uses `infisical run` to inject secrets from your Infisical project's `dev` environment.

1.  Log in to Infisical:
    ```bash
    infisical login
    ```
2.  Select your project.
3.  Run the application:
    ```bash
    npm run dev
    ```
    This command sets `NODE_ENV=dev` and injects the secrets specified in `configuration/DEV/secrets.json` from Infisical.

#### Local (`LOCAL`)

For a purely local setup without the Infisical CLI:

1.  Set the environment variable:
    ```bash
    export NODE_ENV=LOCAL
    ```
2.  Create a `.env` file with the required secrets (e.g., `DB_URL`):
    ```
    DB_URL="your-local-database-url"
    ```
3.  Run the application using a tool that loads `.env` files, or manually export the variables. For example, using `tsx`:
    ```bash
    npm install -g tsx
    tsx src/index.ts
    ```

#### Production (`PROD`)

In production, you must provide Infisical credentials as environment variables:

-   `NODE_ENV=PROD`
-   `INFISICAL_CLIENT_ID`
-   `INFISICAL_CLIENT_SECRET`
-   `INFISICAL_PROJECT_ID`

These will be used to fetch secrets referenced in `configuration/PROD/secrets.json` directly from the Infisical API.

### Available Scripts

-   `npm run dev`: Starts the application in development mode with hot-reloading using `tsx`. Injects secrets from Infisical's `dev` environment.
-   `npm run typecheck`: Runs the TypeScript compiler to check for type errors.
-   `npm run build`: Compiles the TypeScript code into JavaScript in the `dist/` directory.
-   `npm run start`: Executes the compiled code from the `dist/` directory. Use this for production.
