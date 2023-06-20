# Contributing

We happily accept both issues and pull requests for bug reports, bug fixes, feature requests, feature implementations, and documentation improvements. For new features, we recommend that you create an issue first so the feature can be discussed and to prevent unnecessary work in case it's not a feature we want to support. Although, we realize that sometimes code needs to be in place to allow for a meaningful discussion, creating an issue upfront is not a requirement.

## Building and testing

Inside this project, you'll find 2 npm workspace packages:

- `lib` - the storyblok-rich-text-astro-renderer package
- `demo` - the Astro project to showcase the usage of the lib package

To develop either of them you can go to each respective package
```
cd lib
npm run dev
```
or
```
cd demo
npm run dev
```

or run any of the following commands from the root of the project:

| Command                   | Action                                                |
| :------------------------ | :---------------------------------------------------- |
| `npm install`             | Installs dependencies                                 |
| `npm run dev:lib`         | Starts file watcher to rebuild library to `./dist/`   |
| `npm run dev:demo`        | Starts local dev server at `localhost:3000`           |
| `npm run build`           | Build both `lib` and `demo` apps                      |
| `npm run demo`            | Build and serve `demo` app                            |
| `npm run qa`              | Run the code health check (test, lint and format)     |

## Submitting a pull request

1. Fork the repository and clone to your development environment
2. Create a new branch: `git checkout -b my-branch-name`
3. Implement your changes
5. Push your fork and submit a pull request
6. Celebrate your contribution and wait for your pull request to be reviewed and merged.

## Licensing

Storyblok Rich Text Astro Renderer is released under MIT License. For more details please refer to the [LICENSE](./LICENSE) file.

## Code of conduct

Nord Security and all of it's projects adhere to the [Contributor Covenant Code of Conduct](https://github.com/NordSecurity/.github/blob/main/CODE_OF_CONDUCT.md). 
When participating, you are expected to honor this code.

**Thank you!**