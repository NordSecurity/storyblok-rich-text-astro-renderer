import type { SbBlokData as SbBlok } from "@storyblok/js";

type Nullable<T> = T | null;

export type ComponentNode = {
  component?: unknown; // can be Astro/Solid components or StoryblokComponent
  props?: Record<string, unknown>;
  content?: string | ComponentNode[];
};

type ResponseSchemaAttrsFn = ({ attrs }) => ComponentNode;
type ResponseSchemaFn = () => ComponentNode;

export type Schema = {
  nodes?: {
    heading?: ResponseSchemaAttrsFn;
    paragraph?: ResponseSchemaFn;
    text?: ResponseSchemaFn;
    hard_break?: ResponseSchemaFn;
    horizontal_rule?: ResponseSchemaFn;
    bullet_list?: ResponseSchemaFn;
    blockquote?: ResponseSchemaFn;
    code_block?: ResponseSchemaFn;
    image?: ResponseSchemaFn;
    list_item?: ResponseSchemaFn;
    ordered_item?: ResponseSchemaFn;
  };
  marks?: {
    link?: ResponseSchemaAttrsFn;
    bold?: ResponseSchemaFn;
    strong?: ResponseSchemaFn;
    underline?: ResponseSchemaFn;
    italic?: ResponseSchemaFn;
    strike?: ResponseSchemaFn;
    styled?: ResponseSchemaAttrsFn;
  };
};

export type Options = {
  schema?: Schema;
  resolver?: (blok: SbBlok) => ComponentNode;
};

export type Mark =
  | { type: "bold" | "italic" | "underline" }
  | { type: "styled"; attrs: Record<string, unknown> }
  | {
      type: "link";
      attrs: {
        href: string;
        uuid?: Nullable<string>;
        anchor?: Nullable<string>;
        custom?: Record<string, unknown>;
        target: "_self" | "_blank";
        linktype: "url" | "story" | "email" | "asset";
      };
    };

type Break = { type: "hard_break" };

type Text = {
  type: "text";
  text: string;
  marks?: Mark[];
};

type Paragraph = {
  type: "paragraph";
  content?: Array<Text | Break>;
};

type Heading = {
  type: "heading";
  attrs: {
    level: 1 | 2 | 3 | 4 | 5 | 6;
  };
  content: Text[];
};

type Blok = {
  type: "blok";
  attrs: {
    id: string;
    body: SbBlok[];
  };
};

export type SchemaNode = Break | Text | Heading | Paragraph | Blok;

// TODO: expand with full nodes/marks support
export type RichTextType = {
  type: "doc";
  content: Array<Heading | Paragraph | Blok>;
};
