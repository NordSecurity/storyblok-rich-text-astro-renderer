# Storyblok Rich Text Renderer for Astro

Renders Storyblok rich text content to Astro elements.

[![GitHub](https://img.shields.io/github/license/NordSecurity/storyblok-rich-text-astro-renderer?style=flat-square)](https://github.com/NordSecurity/storyblok-rich-text-astro-renderer/blob/main/LICENSE)
[![NPM](https://img.shields.io/npm/v/storyblok-rich-text-astro-renderer/latest.svg?style=flat-square)](https://npmjs.com/package/storyblok-rich-text-astro-renderer)

## Demo

If you are in a hurry, check out live demo:

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/NordSecurity/storyblok-rich-text-astro-renderer/tree/main/demo)

## Motivation

Official Storyblok + Astro integration (`@storyblok/astro`) provides the most basic possibility to render rich-text in Astro. The integration package re-exports the generic rich text utility from `@storyblok/js` package, which is framework-agnostic and universal.

This renderer utility outputs HTML markup, which can be used in Astro via the [set:html](https://docs.astro.build/en/reference/directives-reference/#sethtml) directive:

```js
---
import { renderRichText } from '@storyblok/astro';

const { blok } = Astro.props

const renderedRichText = renderRichText(blok.text)
---

<div set:html={renderedRichText}></div>
```

Nevertheless, it is possible to customise `renderRichText` to some extent by passing the options as the second parameter:

```js
import { RichTextSchema, renderRichText } from "@storyblok/astro";
import cloneDeep from "clone-deep";

const mySchema = cloneDeep(RichTextSchema);

const { blok } = Astro.props;

const renderedRichText = renderRichText(blok.text, {
  schema: mySchema,
  resolver: (component, blok) => {
    switch (component) {
      case "my-custom-component":
        return `<div class="my-component-class">${blok.text}</div>`;
        break;
      default:
        return `Component ${component} not found`;
    }
  },
});
```

Although this works fine and may cover the most basic needs, it may quickly turn out to be limiting and problematic because of the following reasons:

1. `renderRichText` utility cannot map rich text elements to actual Astro components, to be able to render embedded Storyblok components inside the rich text field in CMS.
1. Links that you might want to pass through your app's router, are not possible to be reused as they require the actual function to be mapped with data.
1. It is hard to maintain the string values, especially when complex needs appear, f.e. setting classes and other HTML properties dynamically. It may be possible to minimize the complexity by using some HTML parsers, like [ultrahtml](https://github.com/natemoo-re/ultrahtml), but it does not eliminate the problem entirely.

Instead of dealing with HTML markup, `storyblok-rich-text-astro-renderer` outputs `RichTextRenderer.astro` helper
component (and `resolveRichTextToNodes` resolver utility for the needy ones), which provides options to map any Storyblok rich text
element to any custom component, f.e. Astro, SolidJS, Svelte, Vue, etc.

The package converts Storyblok CMS rich text data structure into the nested Astro component nodes structure, with the shape of:
```ts
export type ComponentNode = {
    component?: unknown;                 // <-- component function - Astro, SolidJS, Svelte, Vue etc
    props?: Record<string, unknown>;     // <-- properties object
    content?: string | ComponentNode[];  // <-- content, which can either be string or other component node
};
```

## Installation

```
npm install storyblok-rich-text-astro-renderer
```

## Usage

To get the most basic functionality, add `RichText.astro` Storyblok component to the project:

```js
---
import RichTextRenderer, { type RichTextType } from "storyblok-rich-text-astro-renderer/RichTextRenderer.astro";
import { storyblokEditable } from "@storyblok/astro";

export interface Props {
  blok: {
    text: RichTextType;
  };
}

const { blok } = Astro.props;
const { text } = blok;
---

<RichTextRenderer content={text} {...storyblokEditable(blok)} />
```

## Advanced usage

Sensible default resolvers for marks and nodes are provided out-of-the-box. You only have to provide custom ones if you want to
override the default behavior.

Use `resolver` to enable and control the rendering of embedded components, and `schema` to control how you want the nodes and marks be rendered:

```js
<RichTextRenderer
  content={text}
  schema={{
    nodes: {
      heading: ({ attrs: { level } }) => ({
        component: Text,
        props: { variant: `h${level}` },
      }),
      paragraph: () => ({
        component: Text,
        props: {
          class: "this-is-paragraph",
        },
      }),
    },
    marks: {
      link: ({ attrs }) => {
        const { custom, ...restAttrs } = attrs;

        return {
          component: Link,
          props: {
            link: { ...custom, ...restAttrs },
            class: "i-am-link",
          },
        };
      },
    }
  }}
  resolver={(blok) => {
    return {
      component: StoryblokComponent,
      props: { blok },
    };
  }}
  {...storyblokEditable(blok)}
/>
```

## Schema

The schema has `nodes` and `marks` to be configurable:

```js
schema={{
  nodes: {
    heading: ({ attrs }) => ({ ... }),
    paragraph: () => ({ ... }),
    text: () => ({ ... }),
    hard_break: () => ({ ... }),
    bullet_list: () => ({ ... }),
    ordered_list: ({ attrs }) => ({ ... }),
    list_item: () => ({ ... }),
    horizontal_rule: () => ({ ... }),
    blockquote: () => ({ ... }),
    image: ({ attrs }) => ({ ... }),
    code_block: ({ attrs }) => ({ ... }),
  },
  marks: {
    link: ({ attrs }) => { ... },
    bold: () => ({ ... }),
    underline: () => ({ ... }),
    italic: () => ({ ... }),
    styled: ({ attrs }) => { ... },
    strike: () => ({ ... }),
    superscript: () => ({ ... }),
    subscript: () => ({ ... }),
    code: () => ({ ... }), // NOT SUPPORTED YET!
    anchor: ({ attrs }) => ({ ... }), // NOT SUPPORTED YET!
    emoji: ({ attrs }) => ({ ... }), // NOT SUPPORTED YET!
    textStyle: ({ attrs }) => ({ ... }), // NOT SUPPORTED YET!
    highlight: ({ attrs }) => ({ ... }), // NOT SUPPORTED YET!
  };
}}
```

NOTE: if any of the latest Storyblok CMS nodes and marks are not supported, please raise an issue or [contribute](./CONTRIBUTING.md).

## Inspiration

- [storyblok-rich-text-react-renderer](https://github.com/claus/storyblok-rich-text-react-renderer)
- [storyblok/astro](https://github.com/storyblok/storyblok-astro/)

## Contributing

Please see our [contributing guidelines](./CONTRIBUTING.md) and our [code of conduct](https://github.com/NordSecurity/.github/blob/main/CODE_OF_CONDUCT.md).
This project uses [semantic-release](https://semantic-release.gitbook.io/semantic-release/) for generating new versions by using commit messages. We use the Angular Convention to name the commits.
