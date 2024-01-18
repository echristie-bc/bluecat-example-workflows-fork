<!--
Copyright 2023 BlueCat Networks Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
-->

# Workflow "configuration_details" using new UI

This is a workflow that demonstrates current features of Gateway Platform, e.g.,
having the UI built with Pelagos and Limani, using BAM REST API v2.

Gateway workflows are written in Python, whose interpreted nature allows for
the folder with their Python source code to de directly distributable (included
in a Gateway workspace).
Because the new UI uses technologies that require a build step, the sources of
the workflow are grouped in two separate places:

1. Code for the back-end implementation that extends the web application,
   located in `workspace/workflows/configuration_details`;
2. Code for the front-end implementation, as well as general resources, placed
   in `projects/configuration_details` (the folder that contains this README file).

Several `make` targets are provided for performing actions specific to this
workflow. They are available through the adjacent `Makefile`.

-   `ui-req`: Satisfy the prerequisites for building the UI. Currently, install
    the necessary Node.js packages. It requires that Node.js is
    available on the system.
-   `ui-build`: Build the UI for the workflow and place the output in the
    relevant place in the prepared workspace.
-   `clean`: Remove any generated files.
-   `purge`: Remove any files that have been involved in building the workflow.

Additionally, the root folder for example workflows has a `Makefile` that
exposes targets, useful for working with all included workflows.

## Prerequisites

1. BlueCat Address Manager version 9.5.0 or later.
2. Gateway Platform version 23.2.0 or later. It must be configured with
   `bam_api_version` set to `2`.

## How to test this workflow

The sources for the workflow can be built and the final result ran in a Gateway
instance.

1. Satisfy the prerequisites for building the UI
2. Build the UI
3. (optional) Build a custom image
4. Satisfy the prerequisites for running a Docker container
5. Configure a workspace
6. Run Gateway with the built workflow
   a. using a custom image
   b. using a base Gateway image
7. Open the started Gateway in a browser, login, and then navigate to
   `/configuration_details/` or click on link `configuration_details` in the navigation
   menu.

## Steps taken to create this workflow

-   Create a blank webpack project.

-   Install necessary packages

    -   webpack → Module bundler for JS
    -   webpack-cli → For running webpack CLI commands
    -   webpack-dev-server → Runs the live project and includes hot-reload
    -   html-webpack-plugin → Injects the script tag in the HTML template we have.
    -   babel → Helps us use the future Javascript in browsers, Javascript compiler
    -   pelagos → UI components
    -   Limani → components specific for gateway

-   webpack.config.js file for building the code, could provide our webpack config file as a skeleton

-   Make sure proper LESS imports are made to have colors and fonts applied properly

    ```
      @import '~@bluecateng/pelagos/less/core';
      @import '~@bluecateng/pelagos/less/inputs';
      @import '~@bluecateng/pelagos/less/scrollbar';
      @import '~@bluecateng/pelagos/less/spinner';
      @import '~@bluecateng/pelagos/less/themes';
    ```

    These might not be required if they use StandardBasePage, whihc already comes with importing these in the component

-   Decide on if you want to use `React` or `preact`. If you use preact and still refer to react in code then you have to
    add an
    alias for the names to be recognised in the code. This can be done in the webpack Config file like this.

    ```
        resolve: {
          modules: [path.resolve(__dirname, 'src'), 'node_modules'],
              alias: { //This Line here is the alias
                 react: 'preact/compat',
                'react-dom': 'preact/compat',
          },
        },
    ```

-   Limani comes with option to import fonts, but StandardBasePage already has this handled.

    -   If a customer is making a new workflow and is not using StandardBasePage in that case they should import fonts
        from limani to have those fonts in their page

    ```
      @import '@bluecat/limani/less/font';
    ```

-   Limani comes with a utility function that can be used to reset the pelagos form, when there is a change in the
    `initialFormData`
    -   This can be used in cases where user presses the save button and the values in the form has to be updated with the
        latest values by not refreshing the entire page.
