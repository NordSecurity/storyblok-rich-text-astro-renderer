import { describe, expect, it } from "vitest";

import {
  resolveMark,
  resolveNode,
  resolveRichTextToNodes,
} from "./resolveRichTextToNodes";
import { Mark, RichTextType, Schema, SchemaNode } from "../types";

describe("resolveNode", () => {
  const Text = () => null;
  const StoryblokComponent = () => null;

  it("hard_break", () => {
    const node: SchemaNode = { type: "hard_break" };

    // default
    expect(resolveNode(node)).toStrictEqual({
      component: "br",
    });

    // with schema override
    expect(
      resolveNode(node, {
        schema: {
          nodes: {
            hard_break: () => ({
              component: "div",
              props: { class: "break" },
            }),
          },
        },
      })
    ).toStrictEqual({
      component: "div",
      props: {
        class: "break",
      },
    });
  });

  it("horizontal_rule", () => {
    const node: SchemaNode = { type: "horizontal_rule" };

    // default
    expect(resolveNode(node)).toStrictEqual({
      component: "hr",
    });

    // with schema override
    expect(
      resolveNode(node, {
        schema: {
          nodes: {
            horizontal_rule: () => ({
              component: "div",
              props: { class: "horizontal-rule" },
            }),
          },
        },
      })
    ).toStrictEqual({
      component: "div",
      props: {
        class: "horizontal-rule",
      },
    });
  });

  it("text", () => {
    const node: SchemaNode = {
      text: "I am text",
      type: "text",
    };

    // default
    expect(resolveNode(node)).toStrictEqual({ content: "I am text" });

    // with marks
    expect(
      resolveNode({
        text: "I am text",
        type: "text",
        marks: [{ type: "bold" }],
      })
    ).toStrictEqual({
      content: [
        {
          component: "b",
          content: [{ content: "I am text" }],
        },
      ],
    });

    // with schema override
    expect(
      resolveNode(node, {
        schema: {
          nodes: {
            text: () => ({
              component: "span",
              props: { class: "this-is-text" },
            }),
          },
        },
      })
    ).toStrictEqual({
      component: "span",
      props: {
        class: "this-is-text",
      },
      content: "I am text",
    });
  });

  it("text with textResolver", () => {
    const node: SchemaNode = {
      text: "Hello {name}",
      type: "text",
    };

    const textResolver = (text: string) => {
      return {
        content: text.replace("{name}", "World"),
      };
    };

    // default
    expect(
      resolveNode(node, {
        textResolver,
      })
    ).toStrictEqual({
      content: "Hello World",
    });

    // with marks
    expect(
      resolveNode(
        {
          ...node,
          marks: [{ type: "bold" }],
        },
        {
          textResolver,
        }
      )
    ).toStrictEqual({
      content: [
        {
          component: "b",
          content: [
            {
              content: "Hello World",
            },
          ],
        },
      ],
    });

    // with schema override
    expect(
      resolveNode(node, {
        schema: {
          nodes: {
            text: () => ({
              component: "p",
              props: { class: "class-1" },
            }),
          },
        },
        textResolver: (text) => ({
          content: text.replace("{name}", "World"),
          component: "span",
          props: { class: "class-2" },
        }),
      })
    ).toStrictEqual({
      component: "p",
      props: {
        class: "class-1",
      },
      content: [
        {
          component: "span",
          props: { class: "class-2" },
          content: "Hello World",
        },
      ],
    });
  });

  it("paragraph", () => {
    const node: SchemaNode = {
      type: "paragraph",
      content: [
        {
          text: "Simple text",
          type: "text",
        },
        { type: "hard_break" },
        {
          text: "Another text",
          type: "text",
        },
      ],
    };

    // default
    expect(resolveNode(node)).toStrictEqual({
      component: "p",
      content: [
        {
          content: "Simple text",
        },
        {
          component: "br",
        },
        {
          content: "Another text",
        },
      ],
    });

    // with schema override
    expect(
      resolveNode(node, {
        schema: {
          nodes: {
            paragraph: () => ({
              component: Text,
              props: { class: "this-is-paragraph" },
            }),
          },
        },
      })
    ).toStrictEqual({
      component: Text,
      props: {
        class: "this-is-paragraph",
      },
      content: [
        {
          content: "Simple text",
        },
        {
          component: "br",
        },
        {
          content: "Another text",
        },
      ],
    });

    // empty line
    expect(resolveNode({ type: "paragraph" })).toStrictEqual({
      component: "br",
    });
  });

  it("heading", () => {
    const node: SchemaNode = {
      type: "heading",
      attrs: {
        level: 1,
      },
      content: [
        {
          text: "Hello from rich text",
          type: "text",
        },
      ],
    };

    const emptyNode: SchemaNode = {
      type: "heading",
      attrs: {
        level: 2,
      },
    };

    // default
    expect(resolveNode(node)).toStrictEqual({
      component: "h1",
      content: [
        {
          content: "Hello from rich text",
        },
      ],
    });

    // with schema override
    expect(
      resolveNode(node, {
        schema: {
          nodes: {
            heading: ({ attrs: { level } }) => ({
              component: Text,
              props: { variant: `level-${level}`, tag: `h${level}` },
            }),
          },
        },
      })
    ).toStrictEqual({
      component: Text,
      props: {
        tag: "h1",
        variant: "level-1",
      },
      content: [{ content: "Hello from rich text" }],
    });

    // with schema override - content via prop
    expect(
      resolveNode(node, {
        schema: {
          nodes: {
            heading: ({ attrs: { level }, content }) => ({
              component: Text,
              props: {
                as: `h${level}`,
                text: content?.[0].text, // content was resolved explicitly to pass via prop
              },
            }),
          },
        },
      })
    ).toStrictEqual({
      component: Text,
      props: {
        as: "h1",
        text: "Hello from rich text",
      },
      content: [{ content: "Hello from rich text" }],
    });

    // empty content
    expect(resolveNode(emptyNode)).toStrictEqual({
      component: "br",
    });
  });

  it("blok", () => {
    expect(
      resolveNode(
        {
          type: "blok",
          attrs: {
            id: "63f693c0-4a1b-46d7-af9b-b67eadb1cf2b",
            body: [
              {
                size: "medium",
                color: "blue",
                title: "Hello",
                component: "button",
              },
            ],
          },
        },
        {
          resolver: (blok) => {
            return {
              component: StoryblokComponent,
              props: { blok },
            };
          },
        }
      )
    ).toStrictEqual({
      content: [
        {
          component: StoryblokComponent,
          props: {
            blok: {
              size: "medium",
              color: "blue",
              title: "Hello",
              component: "button",
            },
          },
        },
      ],
    });

    // empty blok
    expect(
      resolveNode(
        {
          type: "blok",
          attrs: {
            id: "00bda8a3-927b-493a-af40-2fd90f4c1f8f",
            body: [],
          },
        },
        {
          resolver: (blok) => {
            return {
              component: StoryblokComponent,
              props: { blok },
            };
          },
        }
      )
    ).toStrictEqual({
      content: [],
    });
  });

  it("blockquote", () => {
    const node: SchemaNode = {
      type: "blockquote",
      content: [
        {
          type: "paragraph",
          content: [
            {
              text: "This is a quote",
              type: "text",
            },
          ],
        },
      ],
    };

    // default
    expect(resolveNode(node)).toStrictEqual({
      component: "blockquote",
      content: [
        {
          component: "p",
          content: [{ content: "This is a quote" }],
        },
      ],
    });

    // with schema override
    expect(
      resolveNode(node, {
        schema: {
          nodes: {
            blockquote: () => ({
              component: "blockquote",
              props: { cite: "https://examples.com/" },
            }),
          },
        },
      })
    ).toStrictEqual({
      component: "blockquote",
      props: {
        cite: "https://examples.com/",
      },
      content: [
        {
          component: "p",
          content: [{ content: "This is a quote" }],
        },
      ],
    });
  });

  it("list_item", () => {
    const node: SchemaNode = {
      type: "list_item",
      content: [
        {
          type: "paragraph",
          content: [
            {
              text: "one",
              type: "text",
            },
          ],
        },
      ],
    };

    const nodeWithEmptyParagraph: SchemaNode = {
      type: "list_item",
      content: [
        {
          type: "paragraph",
        },
      ],
    };

    const nodeWithParagraphContainingHardBreaksBeforeText: SchemaNode = {
      type: "list_item",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "hard_break" },
            { type: "hard_break" },
            { text: "some text", type: "text" },
          ],
        },
      ],
    };

    // default
    expect(resolveNode(node)).toStrictEqual({
      component: "li",
      content: [
        {
          content: [
            {
              content: "one",
            },
          ],
        },
      ],
    });

    // with schema override
    expect(
      resolveNode(node, {
        schema: {
          nodes: {
            list_item: () => ({
              props: { class: "list-item" },
            }),
          },
        },
      })
    ).toStrictEqual({
      component: "li",
      props: {
        class: "list-item",
      },
      content: [
        {
          content: [{ content: "one" }],
        },
      ],
    });

    // empty content
    expect(resolveNode(nodeWithEmptyParagraph)).toStrictEqual({
      component: "li",
      content: [
        {
          content: "",
        },
      ],
    });

    // hard breaks before text
    expect(
      resolveNode(nodeWithParagraphContainingHardBreaksBeforeText)
    ).toStrictEqual({
      component: "li",
      content: [
        {
          content: [
            { component: "br" },
            { component: "br" },
            { content: "some text" },
          ],
        },
      ],
    });
  });

  it("ordered_list", () => {
    const node: SchemaNode = {
      type: "ordered_list",
      attrs: {
        order: 1,
      },
      content: [
        {
          type: "list_item",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  text: "one",
                  type: "text",
                },
              ],
            },
          ],
        },
        {
          type: "list_item",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  text: "two",
                  type: "text",
                },
              ],
            },
          ],
        },
      ],
    };

    // default
    expect(resolveNode(node)).toStrictEqual({
      component: "ol",
      content: [
        {
          component: "li",
          content: [
            {
              content: [{ content: "one" }],
            },
          ],
        },
        {
          component: "li",
          content: [
            {
              content: [{ content: "two" }],
            },
          ],
        },
      ],
    });

    // with schema override
    expect(
      resolveNode(node, {
        schema: {
          nodes: {
            ordered_list: () => ({
              component: "ol",
              props: { class: "this-is-ordered-list" },
            }),
          },
        },
      })
    ).toStrictEqual({
      component: "ol",
      props: {
        class: "this-is-ordered-list",
      },
      content: [
        {
          component: "li",
          content: [
            {
              content: [{ content: "one" }],
            },
          ],
        },
        {
          component: "li",
          content: [
            {
              content: [{ content: "two" }],
            },
          ],
        },
      ],
    });
  });

  it("bullet_list", () => {
    const node: SchemaNode = {
      type: "bullet_list",
      content: [
        {
          type: "list_item",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  text: "one",
                  type: "text",
                },
              ],
            },
          ],
        },
        {
          type: "list_item",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  text: "two",
                  type: "text",
                },
              ],
            },
          ],
        },
      ],
    };

    // default
    expect(resolveNode(node)).toStrictEqual({
      component: "ul",
      content: [
        {
          component: "li",
          content: [
            {
              content: [{ content: "one" }],
            },
          ],
        },
        {
          component: "li",
          content: [
            {
              content: [{ content: "two" }],
            },
          ],
        },
      ],
    });

    // with schema override
    expect(
      resolveNode(node, {
        schema: {
          nodes: {
            bullet_list: () => ({
              component: "ul",
              props: { class: "this-is-unordered-list" },
            }),
          },
        },
      })
    ).toStrictEqual({
      component: "ul",
      props: {
        class: "this-is-unordered-list",
      },
      content: [
        {
          component: "li",
          content: [
            {
              content: [{ content: "one" }],
            },
          ],
        },
        {
          component: "li",
          content: [
            {
              content: [{ content: "two" }],
            },
          ],
        },
      ],
    });
  });

  it("image", () => {
    const node: SchemaNode = {
      type: "image",
      attrs: {
        id: 218383,
        alt: "My alt text",
        src: "https://dummyimage.com/300x200/eee/aaa",
        title: "The title",
        source: "The source",
        copyright: "The copyright text",
        meta_data: {},
      },
    };

    // default
    expect(resolveNode(node)).toStrictEqual({
      component: "img",
      props: {
        src: "https://dummyimage.com/300x200/eee/aaa",
        alt: "My alt text",
      },
    });

    // with schema override
    expect(
      resolveNode(node, {
        schema: {
          nodes: {
            image: ({ attrs }) => {
              const { src, alt } = attrs;

              return {
                component: "img",
                props: { src, alt, class: "this-is-image" },
              };
            },
          },
        },
      })
    ).toStrictEqual({
      component: "img",
      props: {
        src: "https://dummyimage.com/300x200/eee/aaa",
        alt: "My alt text",
        class: "this-is-image",
      },
    });
  });

  it("code_block", () => {
    const node: SchemaNode = {
      type: "code_block",
      attrs: {
        class: "language-javascript",
      },
      content: [
        {
          text: "const IsStoryblokFun = () => {\n  return true;\n}",
          type: "text",
        },
      ],
    };

    // default
    expect(resolveNode(node)).toStrictEqual({
      component: "pre",
      props: {
        class: "language-javascript",
      },
      content: [
        {
          content: "const IsStoryblokFun = () => {\n  return true;\n}",
        },
      ],
    });

    // with schema override
    expect(
      resolveNode(node, {
        schema: {
          nodes: {
            code_block: ({ attrs }) => {
              const { class: className } = attrs;

              return {
                component: "pre",
                props: { syntax: className?.split("-")[1] },
              };
            },
          },
        },
      })
    ).toStrictEqual({
      component: "pre",
      props: {
        syntax: "javascript",
      },
      content: [
        {
          content: "const IsStoryblokFun = () => {\n  return true;\n}",
        },
      ],
    });
  });

  it("emoji", () => {
    const node: SchemaNode = {
      type: "emoji",
      attrs: {
        name: "rocket",
        emoji: "🚀",
        fallbackImage:
          "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f680.png",
      },
    };

    // default
    expect(resolveNode(node)).toStrictEqual({
      content: "🚀",
    });

    // with schema override
    expect(
      resolveNode(node, {
        schema: {
          nodes: {
            emoji: ({ attrs: { name, fallbackImage } }) => ({
              component: "g-emoji",
              props: {
                class: "this-is-emoji",
                alias: name,
                "fallback-src": fallbackImage,
              },
            }),
          },
        },
      })
    ).toStrictEqual({
      component: "g-emoji",
      props: {
        class: "this-is-emoji",
        alias: "rocket",
        "fallback-src":
          "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f680.png",
      },
      content: "🚀",
    });
  });
});

describe("resolveMark", () => {
  const MultiLink = () => null;

  const sharedSchema: Schema = {
    marks: {
      link: ({ attrs }) => {
        const { href, ...restAttrs } = attrs;

        return {
          component: MultiLink,
          props: {
            link: {
              ...restAttrs,
              url: href,
            },
          },
        };
      },
      bold: () => ({
        component: "span",
        props: {
          class: "bold",
        },
      }),
      underline: () => ({
        component: "span",
        props: {
          class: "underline",
        },
      }),
      italic: () => ({
        component: "span",
        props: {
          class: "italic",
        },
      }),
      styled: ({ attrs }) => {
        const resolveTextColorToClass = (color) =>
          ({
            blue: "this-is-blue",
            red: "this-is-red",
            pink: "this-is-pink",
          })[color];

        return {
          props: {
            class: resolveTextColorToClass(attrs.class),
          },
        };
      },
      strike: () => ({
        component: "del",
        props: {
          class: "strike",
        },
      }),
      superscript: () => ({
        component: "sup",
        props: {
          class: "superscript",
        },
      }),
      subscript: () => ({
        component: "sub",
        props: {
          class: "subscript",
        },
      }),
      code: () => ({
        component: "span",
        props: {
          class: "code",
        },
      }),
      anchor: ({ attrs: { id } }) => ({
        component: "span",
        props: {
          class: "anchor",
          id,
        },
      }),
      textStyle: ({ attrs: { color } }) => ({
        component: "span",
        props: {
          class: "text-style",
          style: { color },
        },
      }),
      highlight: ({ attrs: { color } }) => ({
        component: "span",
        props: {
          class: "highlight",
          style: { backgroundColor: color },
        },
      }),
    },
  };

  const content = [{ content: "content" }];

  it("link", () => {
    const markUrl: Mark = {
      type: "link",
      attrs: {
        linktype: "url",
        href: "https://example.com",
        target: "_self",
      },
    };

    const markEmail: Mark = {
      type: "link",
      attrs: {
        linktype: "email",
        href: "mail@mail.com",
        target: "_blank",
      },
    };

    const markAnchor: Mark = {
      type: "link",
      attrs: {
        linktype: "url",
        href: "https://example.com",
        target: "_self",
        anchor: "hey",
      },
    };

    // default
    expect(resolveMark(content, markUrl)).toStrictEqual({
      component: "a",
      content,
      props: {
        href: "https://example.com",
      },
    });

    expect(resolveMark(content, markEmail)).toStrictEqual({
      component: "a",
      content,
      props: {
        href: "mailto:mail@mail.com",
        target: "_blank",
      },
    });

    expect(resolveMark(content, markAnchor)).toStrictEqual({
      component: "a",
      content,
      props: {
        href: "https://example.com#hey",
      },
    });

    // with schema override
    expect(resolveMark(content, markUrl, sharedSchema)).toStrictEqual({
      component: MultiLink,
      content,
      props: {
        link: {
          linktype: "url",
          target: "_self",
          url: "https://example.com",
        },
      },
    });
  });

  it("bold", () => {
    const mark: Mark = { type: "bold" };

    // default
    expect(resolveMark(content, mark)).toStrictEqual({
      component: "b",
      content,
    });

    // with schema override
    expect(resolveMark(content, mark, sharedSchema)).toStrictEqual({
      component: "span",
      content,
      props: {
        class: "bold",
      },
    });
  });

  it("underline", () => {
    const mark: Mark = { type: "underline" };

    // default
    expect(resolveMark(content, mark)).toStrictEqual({
      component: "u",
      content,
    });

    // with schema override
    expect(resolveMark(content, mark, sharedSchema)).toStrictEqual({
      component: "span",
      content,
      props: {
        class: "underline",
      },
    });
  });

  it("italic", () => {
    const mark: Mark = { type: "italic" };

    // default
    expect(resolveMark(content, mark)).toStrictEqual({
      component: "i",
      content,
    });

    // with schema override
    expect(resolveMark(content, mark, sharedSchema)).toStrictEqual({
      component: "span",
      content,
      props: {
        class: "italic",
      },
    });
  });

  it("styled", () => {
    const mark: Mark = {
      type: "styled",
      attrs: {
        class: "red",
      },
    };

    // default
    expect(resolveMark(content, mark)).toStrictEqual({
      component: "span",
      content,
      props: {
        class: "red",
      },
    });

    // with schema override
    expect(resolveMark(content, mark, sharedSchema)).toStrictEqual({
      component: "span",
      content,
      props: {
        class: "this-is-red",
      },
    });
  });

  it("strike", () => {
    const mark: Mark = { type: "strike" };

    // default
    expect(resolveMark(content, mark)).toStrictEqual({
      component: "s",
      content,
    });

    // with schema override
    expect(resolveMark(content, mark, sharedSchema)).toStrictEqual({
      component: "del",
      content,
      props: {
        class: "strike",
      },
    });
  });

  it("superscript", () => {
    const mark: Mark = { type: "superscript" };

    // default
    expect(resolveMark(content, mark)).toStrictEqual({
      component: "sup",
      content,
    });

    // with schema override
    expect(resolveMark(content, mark, sharedSchema)).toStrictEqual({
      component: "sup",
      content,
      props: {
        class: "superscript",
      },
    });
  });

  it("subscript", () => {
    const mark: Mark = { type: "subscript" };

    // default
    expect(resolveMark(content, mark)).toStrictEqual({
      component: "sub",
      content,
    });

    // with schema override
    expect(resolveMark(content, mark, sharedSchema)).toStrictEqual({
      component: "sub",
      content,
      props: {
        class: "subscript",
      },
    });
  });

  it("code", () => {
    const mark: Mark = { type: "code" };

    // default
    expect(resolveMark(content, mark)).toStrictEqual({
      component: "code",
      content,
    });

    // with schema override
    expect(resolveMark(content, mark, sharedSchema)).toStrictEqual({
      component: "span",
      content,
      props: {
        class: "code",
      },
    });
  });

  it("anchor", () => {
    const mark: Mark = {
      type: "anchor",
      attrs: {
        id: "this-is-anchor",
      },
    };

    // default
    expect(resolveMark(content, mark)).toStrictEqual({
      component: "span",
      content,
      props: {
        id: "this-is-anchor",
      },
    });

    // with schema override
    expect(resolveMark(content, mark, sharedSchema)).toStrictEqual({
      component: "span",
      content,
      props: {
        class: "anchor",
        id: "this-is-anchor",
      },
    });
  });

  it("textStyle", () => {
    const mark: Mark = {
      type: "textStyle",
      attrs: {
        color: "#9CFFA4",
      },
    };

    // default
    expect(resolveMark(content, mark)).toStrictEqual({
      component: "span",
      content,
      props: {
        style: { color: "#9CFFA4" },
      },
    });

    // with schema override
    expect(resolveMark(content, mark, sharedSchema)).toStrictEqual({
      component: "span",
      content,
      props: {
        class: "text-style",
        style: { color: "#9CFFA4" },
      },
    });
  });

  it("highlight", () => {
    const mark: Mark = {
      type: "highlight",
      attrs: {
        color: "#9CFFA4",
      },
    };

    // default
    expect(resolveMark(content, mark)).toStrictEqual({
      component: "span",
      content,
      props: {
        style: { backgroundColor: "#9CFFA4" },
      },
    });

    // with schema override
    expect(resolveMark(content, mark, sharedSchema)).toStrictEqual({
      component: "span",
      content,
      props: {
        class: "highlight",
        style: { backgroundColor: "#9CFFA4" },
      },
    });
  });
});

describe("resolveRichTextToNodes", () => {
  const Text = () => null;
  const MultiLink = () => null;
  const StoryblokComponent = () => null;

  const resolver = (blok) => {
    return {
      component: StoryblokComponent,
      props: { blok },
    };
  };

  const schema: Schema = {
    nodes: {
      heading: ({ attrs: { level } }) => ({
        component: Text,
        props: { variant: `heading-${level}`, tag: `h${level}` },
      }),
      paragraph: () => ({
        component: Text,
        props: {
          class: "some-color-class",
        },
      }),
    },
    marks: {
      link: ({ attrs }) => {
        const { href, custom, ...restAttrs } = attrs;

        return {
          component: MultiLink,
          props: {
            link: {
              ...restAttrs,
              ...custom,
              url: href,
            },
          },
        };
      },
    },
  };

  it("resolves complex Storyblok richtext structure correctly", () => {
    const richTextFromStoryblok: RichTextType = {
      type: "doc",
      content: [
        {
          type: "blok",
          attrs: {
            id: "63f693c0-4a1b-46d7-af9b-b67eadb1cf2b",
            body: [
              {
                _uid: "i-b29a4416-7e0e-49ed-a9ee-23e2299f8df4",
                icon: "",
                link: {
                  id: "6c401799-b2ad-4854-aa3e-f58ac59bf763",
                  url: "",
                  linktype: "story",
                  fieldtype: "multilink",
                  cached_url: "home",
                },
                size: "medium",
                color: "blue",
                title: "Hello",
                gaSlug: "",
                disabled: false,
                outlined: false,
                component: "button",
                isFullWidth: false,
              },
            ],
          },
        },
        {
          type: "heading",
          attrs: {
            level: 1,
          },
          content: [
            {
              text: "Hello from rich text",
              type: "text",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              text: "This is paragraph. I will bold ",
              type: "text",
            },
            {
              text: "this",
              type: "text",
              marks: [
                {
                  type: "bold",
                },
              ],
            },
            {
              text: ", underline ",
              type: "text",
            },
            {
              text: "this",
              type: "text",
              marks: [
                {
                  type: "underline",
                },
              ],
            },
            {
              text: ", and make ",
              type: "text",
            },
            {
              text: "this",
              type: "text",
              marks: [
                {
                  type: "italic",
                },
              ],
            },
            {
              text: " italic. ",
              type: "text",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              text: "One m",
              type: "text",
            },
            {
              text: "ore paragraph. ",
              type: "text",
              marks: [
                {
                  type: "bold",
                },
              ],
            },
            {
              text: "This is a link",
              type: "text",
              marks: [
                {
                  type: "link",
                  attrs: {
                    href: "/",
                    uuid: "6c401799-b2ad-4854-aa3e-f58ac59bf763",
                    anchor: null,
                    custom: {},
                    target: "_blank",
                    linktype: "story",
                  },
                },
                {
                  type: "bold",
                },
              ],
            },
            {
              text: ".",
              type: "text",
              marks: [
                {
                  type: "bold",
                },
              ],
            },
          ],
        },
        {
          type: "heading",
          attrs: {
            level: 2,
          },
          content: [
            {
              text: "Heading",
              type: "text",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              text: "Yet one more paragraph. ",
              type: "text",
            },
            {
              text: "Email",
              type: "text",
              marks: [
                {
                  type: "link",
                  attrs: {
                    href: "aaa@aaa.aaa",
                    uuid: null,
                    anchor: null,
                    custom: {},
                    target: "_self",
                    linktype: "email",
                  },
                },
              ],
            },
            {
              type: "hard_break",
            },
            {
              text: "asset link",
              type: "text",
              marks: [
                {
                  type: "link",
                  attrs: {
                    href: "https://a-us.storyblok.com/f/1001711/x/af23ad3670/screenshot-2022-10-20-at-12-08-39.png",
                    uuid: null,
                    anchor: null,
                    custom: {},
                    target: "_self",
                    linktype: "asset",
                  },
                },
              ],
            },
            {
              type: "hard_break",
            },
            {
              text: "internal link with anchor",
              type: "text",
              marks: [
                {
                  type: "link",
                  attrs: {
                    href: "/page",
                    uuid: "143e938c-45ab-40cf-b60f-19c1678610d8",
                    anchor: "demo",
                    custom: {},
                    target: "_self",
                    linktype: "story",
                  },
                },
              ],
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              text: "external link",
              type: "text",
              marks: [
                {
                  type: "link",
                  attrs: {
                    href: "https://example.com/",
                    uuid: null,
                    anchor: null,
                    custom: {},
                    target: "_self",
                    linktype: "url",
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    expect(
      resolveRichTextToNodes(richTextFromStoryblok, { schema, resolver })
    ).toStrictEqual([
      {
        content: [
          {
            component: StoryblokComponent,
            props: {
              blok: {
                _uid: "i-b29a4416-7e0e-49ed-a9ee-23e2299f8df4",
                icon: "",
                link: {
                  id: "6c401799-b2ad-4854-aa3e-f58ac59bf763",
                  url: "",
                  linktype: "story",
                  fieldtype: "multilink",
                  cached_url: "home",
                },
                size: "medium",
                color: "blue",
                title: "Hello",
                gaSlug: "",
                disabled: false,
                outlined: false,
                component: "button",
                isFullWidth: false,
              },
            },
          },
        ],
      },
      {
        component: Text,
        props: {
          variant: "heading-1",
          tag: "h1",
        },
        content: [
          {
            content: "Hello from rich text",
          },
        ],
      },
      {
        component: Text,
        props: {
          class: "some-color-class",
        },
        content: [
          {
            content: "This is paragraph. I will bold ",
          },
          {
            content: [
              {
                component: "b",
                content: [
                  {
                    content: "this",
                  },
                ],
              },
            ],
          },
          {
            content: ", underline ",
          },
          {
            content: [
              {
                component: "u",
                content: [
                  {
                    content: "this",
                  },
                ],
              },
            ],
          },
          {
            content: ", and make ",
          },
          {
            content: [
              {
                component: "i",
                content: [
                  {
                    content: "this",
                  },
                ],
              },
            ],
          },
          {
            content: " italic. ",
          },
        ],
      },
      {
        component: Text,
        props: {
          class: "some-color-class",
        },
        content: [
          {
            content: "One m",
          },
          {
            content: [
              {
                component: "b",
                content: [
                  {
                    content: "ore paragraph. ",
                  },
                ],
              },
            ],
          },
          {
            content: [
              {
                component: MultiLink,
                props: {
                  link: {
                    uuid: "6c401799-b2ad-4854-aa3e-f58ac59bf763",
                    anchor: null,
                    target: "_blank",
                    linktype: "story",
                    url: "/",
                  },
                },
                content: [
                  {
                    component: "b",
                    content: [
                      {
                        content: "This is a link",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            content: [
              {
                component: "b",
                content: [
                  {
                    content: ".",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        component: Text,
        props: {
          variant: "heading-2",
          tag: "h2",
        },
        content: [
          {
            content: "Heading",
          },
        ],
      },
      {
        component: Text,
        props: {
          class: "some-color-class",
        },
        content: [
          {
            content: "Yet one more paragraph. ",
          },
          {
            content: [
              {
                component: MultiLink,
                props: {
                  link: {
                    uuid: null,
                    anchor: null,
                    target: "_self",
                    linktype: "email",
                    url: "aaa@aaa.aaa",
                  },
                },
                content: [
                  {
                    content: "Email",
                  },
                ],
              },
            ],
          },
          {
            component: "br",
          },
          {
            content: [
              {
                component: MultiLink,
                props: {
                  link: {
                    uuid: null,
                    anchor: null,
                    target: "_self",
                    linktype: "asset",
                    url: "https://a-us.storyblok.com/f/1001711/x/af23ad3670/screenshot-2022-10-20-at-12-08-39.png",
                  },
                },
                content: [
                  {
                    content: "asset link",
                  },
                ],
              },
            ],
          },
          {
            component: "br",
          },
          {
            content: [
              {
                component: MultiLink,
                props: {
                  link: {
                    uuid: "143e938c-45ab-40cf-b60f-19c1678610d8",
                    anchor: "demo",
                    target: "_self",
                    linktype: "story",
                    url: "/page",
                  },
                },
                content: [
                  {
                    content: "internal link with anchor",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        component: Text,
        props: {
          class: "some-color-class",
        },
        content: [
          {
            content: [
              {
                component: MultiLink,
                props: {
                  link: {
                    uuid: null,
                    anchor: null,
                    target: "_self",
                    linktype: "url",
                    url: "https://example.com/",
                  },
                },
                content: [
                  {
                    content: "external link",
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });
});
