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
import RichTextRenderer from "storyblok-rich-text-astro-renderer/RichTextRenderer.astro";
import type { RichTextType } from "storyblok-rich-text-astro-renderer"
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
override the default behavior:

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
  textResolver={(text) => {
    const currentYear = new Date().getFullYear().toString();
    return {
      content: text.replaceAll("{currentYear}", currentYear),
    };
  }}
  {...storyblokEditable(blok)}
/>
```

- `schema` -  controls how you want the nodes and marks be rendered
- `resolver` - enables and controls the rendering of embedded components
- `textResolver` -  controls the rendering of the plain text. Useful if you need some text preprocessing (translation, sanitization, etc.)

### Content via prop

By default, content in `nodes` is handled automatically and passed via slots keeping configuration as follows:

```js
heading: ({ attrs: { level } }) => ({
  component: Text,
  props: { variant: `h${level}` },
}),
```
This implies that implementation of `Text` is as simple as:
```js
---
const { variant } = Astro.props;
const Component = variant || "p";
---

<Component>
  <slot />
</Component>
```
However in some cases, the users do implementation via props only, thus without slots:
```js
---
const { variant, text } = Astro.props;
const Component = variant || "p";
---

<Component>
  {text}
</Component>
```
This way the content must be handled explictly in the resolver function and passed via prop:
```js
heading: ({ attrs: { level }, content }) => ({
  component: Text,
  props: {
    variant: `h${level}`,
    text: content?.[0].text,
  },
}),
```

## Schema

The schema has `nodes` and `marks` to be configurable:

```js
schema={{
  nodes: {
    heading: (node) => ({ ... }),
    paragraph: () => ({ ... }),
    text: () => ({ ... }),
    hard_break: () => ({ ... }),
    bullet_list: () => ({ ... }),
    ordered_list: (node) => ({ ... }),
    list_item: () => ({ ... }),
    horizontal_rule: () => ({ ... }),
    blockquote: () => ({ ... }),
    image: (node) => ({ ... }),
    code_block: (node) => ({ ... }),
    emoji: (node) => ({ ... }),
  },
  marks: {
    link: (mark) => { ... },
    bold: () => ({ ... }),
    underline: () => ({ ... }),
    italic: () => ({ ... }),
    styled: (mark) => { ... },
    strike: () => ({ ... }),
    superscript: () => ({ ... }),
    subscript: () => ({ ... }),
    code: () => ({ ... }),
    anchor: (mark) => ({ ... }),
    textStyle: (mark) => ({ ... }),
    highlight: (mark) => ({ ... }),
  };
}}
```

NOTE: if any of the latest Storyblok CMS nodes and marks are not supported, please raise an issue or [contribute](./CONTRIBUTING.md).

## Inspiration

- [storyblok-rich-text-react-renderer](https://github.com/claus/storyblok-rich-text-react-renderer)
- [storyblok/astro](https://github.com/storyblok/storyblok-astro/)

## Contributing

Please see our [contributing guidelines](./CONTRIBUTING.md) and our [code of conduct](https://github.com/NordSecurity/.github/blob/main/CODE_OF_CONDUCT.md).