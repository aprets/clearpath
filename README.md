# 🌩️ ClearPath (Surrey CompSci 2022 FYP)
### 🚀 Deployments
The latest builds of the system are deployed at:

Production build (main branch) - https://clearpathcloud.web.app/

Testing credentials are:

Username: `user`

Password: `password`

# 👩‍💻 Getting Started with development

Have an up to date version of Node.js 14+ installed, ideally with `yarn` installed as well

Clone the repository

Optionally open VSCode in this directory

Don't forget to install dependencies with `yarn` or `yarn install`

You can now run the next dev server with `yarn dev`.

## Commands
There are some useful commands (found inside `package.json`) that you can run to help you with development.

### `yarn dev`
Starts a development server. There is hot-reloading (changes apply without refresh) so you can easily view and test the app during dev. 

### `yarn build`
Creates a production-ready, optimized build of the website (uses prod data in CMS). Once the app is built, you can use `yarn start` (see below) to use it.

### `yarn start`
Starts the production server (uses prod data from the CMS **fetched during build**). Please make sure to run `yarn build` first to build the latest version of the app before starting the prod server.

### `yarn lint`
Runs the linter (ESLint) on all of the website code. This will check for any warnings or critical lint suggestions.

# 🏗️ Structure
[Standard Next.js layout](https://nextjs.org/docs/getting-started)

`/pages` for all website

`/pages/api` for api routes specifically

`/lib` for any helpers or libraries

`/lib/workflows.tsx` contains the main workflows the application runs

`/components` for any JSX / React components