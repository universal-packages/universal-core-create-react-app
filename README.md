# Core Create Rect App

[![npm version](https://badge.fury.io/js/@universal-packages%2Fcore-create-react-app.svg)](https://www.npmjs.com/package/@universal-packages/core-create-react-app)
[![Testing](https://github.com/universal-packages/universal-core-create-react-app/actions/workflows/testing.yml/badge.svg)](https://github.com/universal-packages/universal-core-create-react-app/actions/workflows/testing.yml)
[![codecov](https://codecov.io/gh/universal-packages/universal-core-create-react-app/branch/main/graph/badge.svg?token=CXPJSN8IGL)](https://codecov.io/gh/universal-packages/universal-core-create-react-app)

[Create React App](https://create-react-app.dev/) universal-core abstraction.

## Install

```shell
npm install @universal-packages/core-create-react-app
```

## Initialization

This will create a new react app using `create-react-app` and install the core packages as well as adapting the resulting app to use the core abstraction.

```shell
ucore initialize create-react-app --name my-app
```

## Development

Instead of running `npm start` you use the `ucore run` command to start the development server of you react app, you can have multiple apps initialized in the same project and run them individually.

```shell
ucore run create-react-app --name my-app
```

### Environment Variables

Instead of setting environment variables you can configure the react app using the configuration file `create-react-app.yaml`. All keys in this configuration will be passed as environment variables to the react app. Check the [create-react-app documentation](https://create-react-app.dev/docs/advanced-configuration) for more information.

## Build and Eject

```shell
ucore exec create-react-app build
ucore exec create-react-app eject
```

## Typescript

In order for typescript to see the global types you need to reference the types somewhere in your project, normally `./src/globals.d.ts`.

```ts
/// <reference types="@universal-packages/core-create-react-app" />
```

This library is developed in TypeScript and shipped fully typed.

## Contributing

The development of this library happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving this library.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing Guide](./CONTRIBUTING.md)

### License

[MIT licensed](./LICENSE).
