import {
  ComponentNode,
  Mark,
  Options,
  RichTextType,
  Schema,
  SchemaNode,
} from "../types";

// all available marks: https://github.com/storyblok/storyblok-js-client/blob/main/src/schema.ts#L84
export const resolveMark = (
  content: ComponentNode[],
  mark: Mark,
  schema?: Schema
): ComponentNode => {
  if (mark.type === "link") {
    const resolverFn = schema?.marks?.[mark.type];

    const attrs = { ...mark.attrs };
    const { linktype = "url" } = mark.attrs;

    if (linktype === "email") {
      attrs.href = `mailto:${attrs.href}`;
    }

    if (attrs.anchor) {
      attrs.href = `${attrs.href}#${attrs.anchor}`;
      delete attrs.anchor;
    }

    // remove redundant/excessive properties to avoid passing to html
    delete attrs.uuid;
    delete attrs.linktype;
    if (attrs.target === "_self") {
      delete attrs.target;
    }

    return {
      component: "a",
      props: attrs,
      content,
      ...resolverFn?.({ attrs: mark.attrs }),
    };
  }

  if (mark.type === "bold") {
    const resolverFn = schema?.marks?.[mark.type];
    return {
      component: "b",
      content,
      ...resolverFn?.(),
    };
  }

  if (mark.type === "underline") {
    const resolverFn = schema?.marks?.[mark.type];
    return {
      component: "u",
      content,
      ...resolverFn?.(),
    };
  }

  if (mark.type === "italic") {
    const resolverFn = schema?.marks?.[mark.type];
    return {
      component: "i",
      content,
      ...resolverFn?.(),
    };
  }

  if (mark.type === "styled") {
    const resolverFn = schema?.marks?.[mark.type];
    return {
      component: "span",
      content,
      ...resolverFn?.({ attrs: mark.attrs }),
    };
  }

  if (mark.type === "strike") {
    const resolverFn = schema?.marks?.[mark.type];
    return {
      component: "s",
      content,
      ...resolverFn?.(),
    };
  }

  if (mark.type === "superscript") {
    const resolverFn = schema?.marks?.[mark.type];
    return {
      component: "sup",
      content,
      ...resolverFn?.(),
    };
  }

  if (mark.type === "subscript") {
    const resolverFn = schema?.marks?.[mark.type];
    return {
      component: "sub",
      content,
      ...resolverFn?.(),
    };
  }

  if (mark.type === "code") {
    const resolverFn = schema?.marks?.[mark.type];
    return {
      component: "code",
      content,
      ...resolverFn?.(),
    };
  }

  if (mark.type === "anchor") {
    const resolverFn = schema?.marks?.[mark.type];
    const { attrs } = mark;

    return {
      component: "span",
      content,
      props: attrs,
      ...resolverFn?.({ attrs }),
    };
  }
};

// all available nodes: https://github.com/storyblok/storyblok-js-client/blob/main/src/schema.ts#L21
export const resolveNode = (
  node: SchemaNode,
  options: Options = {}
): ComponentNode => {
  const { schema } = options;
  const resolverFn = schema?.nodes?.[node.type];

  if (node.type === "heading") {
    const { content, attrs } = node;

    return {
      component: `h${attrs.level}`,
      content: content.map((node) => resolveNode(node, options)),
      ...resolverFn?.({ attrs }),
    };
  }

  if (node.type === "hard_break") {
    return {
      component: "br",
      ...resolverFn?.(),
    };
  }

  if (node.type === "horizontal_rule") {
    return {
      component: "hr",
      ...resolverFn?.(),
    };
  }

  if (node.type === "blockquote") {
    const { content } = node;

    return {
      component: "blockquote",
      content: content.map((node) => resolveNode(node, options)),
      ...resolverFn?.(),
    };
  }

  if (node.type === "image") {
    const { attrs } = node;
    const { src, alt } = attrs;

    return {
      component: "img",
      props: { src, alt },
      ...resolverFn?.({ attrs }),
    };
  }

  if (node.type === "code_block") {
    const { attrs, content } = node;

    return {
      component: "pre",
      props: { class: attrs.class },
      content: content.map((node) => resolveNode(node, options)),
      ...resolverFn?.({ attrs }),
    };
  }

  if (node.type === "ordered_list") {
    const { content, attrs } = node;

    return {
      component: "ol",
      content: content.map((node) => resolveNode(node, options)),
      ...resolverFn?.({ attrs }),
    };
  }

  if (node.type === "bullet_list") {
    const { content } = node;

    return {
      component: "ul",
      content: content.map((node) => resolveNode(node, options)),
      ...resolverFn?.(),
    };
  }

  if (node.type === "list_item") {
    const { content } = node;

    return {
      component: "li",
      content: content.map((node) => {
        // skip rendering p tag inside li
        if (node.type === "paragraph") {
          return {
            content: node.content.map((node) => resolveNode(node, options)),
          };
        }

        return resolveNode(node, options);
      }),
      ...resolverFn?.(),
    };
  }

  if (node.type === "text") {
    const { text, marks } = node;

    if (marks) {
      let marked: ComponentNode[] = [{ content: text }];
      [...marks].reverse().forEach((mark) => {
        marked = [resolveMark(marked, mark, schema)];
      });

      return {
        content: marked,
        ...resolverFn?.(),
      };
    }

    return {
      content: text,
      ...resolverFn?.(),
    };
  }

  if (node.type === "paragraph") {
    const { content } = node;

    // empty line
    if (!content) {
      return {
        component: "br",
      };
    }

    return {
      component: "p",
      content: content.map((node) => resolveNode(node, options)),
      ...resolverFn?.(),
    };
  }

  if (node.type === "blok") {
    const { resolver } = options;
    const {
      attrs: { body },
    } = node;

    if (resolver) {
      return {
        content: body.map(resolver),
      };
    }
  }
};

/**
 * Converts Storyblok rich text structure into Astro-friendly nested nodes structure.
 * @param richText
 * @param options
 * @returns
 */
export const resolveRichTextToNodes = (
  richText: RichTextType,
  options: Options
) => {
  return richText.content.map((props) => resolveNode(props, options));
};
