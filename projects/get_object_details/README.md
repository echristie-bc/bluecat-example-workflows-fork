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

# Workflow "Get object name" with localized new UI

This is a workflow that demonstrates the recommended approach for providing a
UI in multiple languages. Currently, it supports `en` for English and `zz` for
a pseudo-translation.
Additionally, it uses current features of Gateway Platform, e.g., having the UI
built with Pelagos and Limani, using BAM REST API v2.

Gateway workflows are written in Python, whose interpreted nature allows for
the folder with their Python source code to de directly distributable (included
in a Gateway workspace).
Because the new UI uses technologies that require a build step, the sources of
the workflow are grouped in two separate places:

1. Code for the back-end implementation that extends the web application,
   located in `workspace/workflows/get_object_details`;
2. Code for the front-end implementation, as well as general resources, placed
   in `sources/get_object_details` (the folder that contains this README file).

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
   `/get_object_details/` or click on link `Get object details` in the
   navigation menu.

The texts will be shown in the default language - English.
The language can be changed by navigating to `Configurations` -> `General
configuration` -> `Customization` and setting `zz` for field `Language`.
Navigate back to the workflow page and the text will be shown in pseudo-English.

## How to apply localization to an existing UIv3 WF

The following needs to be done in order to apply localization to an existing workflow:

### Add `l10n` related packages in package.json

-   @bluecateng/l10n-core -> Core l10n functions.
-   @bluecateng/l10n-cli -> Command line utilities for l10n
-   @bluecateng/l10n-icu2obj -> Converter from source to internal message format.
-   @bluecateng/l10n-loader -> Webpack loader for po files
-   @bluecateng/l10n.macro -> l10n macros
-   @bluecateng/l10n-jest -> Jest preprocessor for po files.
-   babel-plugin-macros

### Add below object to package.json file:

```
"bc-l10n": {
    "hashLength": 4,
    "module": "src/l10n",
    "catalogPath": "src/l10n/{locale}",
    "locales": [
        "en",
        "zz"
    ]
},
```

#### HashLength

To save space in production the code only contains a hash of the original string. This field specifies the length to which the hashes will be truncated. It should be the minimum length which avoids clashes, clashes are validated at build time.

-   Required: yes
-   Example: 3

#### sourcePath

The path to the sources.

-   Required: no
-   Default: `"src"`

#### module

The path to the module which loads the strings (see @bluecateng/l10n-core).

-   Required: yes
-   Example: "src/l10n"

#### catalogPath

The path where the message catalog files will be created. It must contain the token "{locale}" which will be replaced with the corresponding locale. It must not contain an extension, the extension will be appended on generation.

-   Required: yes
-   Example: `"src/l10n/{locale}"`

#### locales

List of [BCP-47](https://www.rfc-editor.org/rfc/bcp/bcp47.txt) locale codes.

-   Required: no
-   Default: ["en"]
-   Example: ["en", "fr"]

### Add this object to webpack configuration

```
module: {
  rules: [
    {
      test: /\.po$/,
      loader: '@bluecateng/l10n-loader',
    },
  ],
}
```

### Add in Babel configuration to enable macros plugin

```
plugins: [
  "macros"
]
```

### Use l10n macros to replace text in UI

Create a dir `l10n` under `src/` and, then `index.js` under `src/l10n` dir and add the below to load the default language translations. This can be any other dir, but has to be specified in `module` configuration in `package.json`

```js
import l10nLoad from '@bluecateng/l10n-core';

import en from './en.po';

export default l10nLoad(en);
```

Example of `t` macro usage for applying translation:

```js
import { t } from '@bluecateng/l10n.macro';

console.log(t`Hello world`);

const salute = (name) => t`Hello ${name}`;
```

### Add translation files

-   Make sure package `@bluecateng/l10n-cli` is installed.
-   Run command `npx @bluecateng/l10n-cli` from `l10n_ui` directory. This will create separate translation files for the `locales` mentioned in `package.json` file.
-   If we need to add new language to the workflow in the future, then add the locale in `package.json`, append it to the loaders in `setLanguage` function, mentioned in next section, and then run command `npx @bluecateng/l10n-cli`, which will create the translation file. Add the translated values to it. Lastly recompile the workflow.
-   The translation file (e.g. `en.po`) will have 2 fields of concern, `msgid` and `msgstr`.
    The `msgid` is the text that appear in the code and `msgstr` is the text that appear on the screen at runtime i.e. the translated text. If the `msgstr` is empty, then the text inside `msgid` will be added to `msgstr`. If the `msgid` doesn't exist for any label that uses `t` macro, then on UI the concatenated hash string will be displayed instead of the label.

### Apply the language change to the workflow

This can be achieved by multiple ways. First create a function `setLanguage` to update the language of the workflow.

```js
import l10n from '../l10n';

const loaders = {
    en: () => import('../l10n/en.po'),
    zz: () => import('../l10n/zz.po'),
};

const setLanguage = (language) => {
    const loader = loaders[language];
    return loader
        ? loader().then(({ default: data }) => l10n.load(data))
        : Promise.reject(new Error(`Unknown language ${language}`));
};

export default setLanguage;
```

1. Pass the function reference for applying language change to `SimplePage` component from Limani

```html
<SimplePage onLanguageChange="{setLanguage}">
    <content />
</SimplePage>
```

2. If the developer doesn't want to use `SimplePage` then they can use `PageToolkit` from Limani, which doesn't add any page shell, and just provides with useful contexts from Limani.

```html
<PageToolkit onLanguageChange="{setLanguage}">
    <content />
</PageToolkit>
```

3. The setLanguage function can be called by the user itself, if they don't want Limani to take care of it. But, they will have to call this function as soon as possible in the code, i.e. before rendering the page.
