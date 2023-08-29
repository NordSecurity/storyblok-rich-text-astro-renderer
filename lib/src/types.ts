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
    bullet_list?: ResponseSchemaFn;
    ordered_list?: ResponseSchemaAttrsFn;
    list_item?: ResponseSchemaFn;
    horizontal_rule?: ResponseSchemaFn;
    blockquote?: ResponseSchemaFn;
    image?: ResponseSchemaAttrsFn;
    code_block?: ResponseSchemaAttrsFn;
  };
  marks?: {
    link?: ResponseSchemaAttrsFn;
    bold?: ResponseSchemaFn;
    underline?: ResponseSchemaFn;
    italic?: ResponseSchemaFn;
    styled?: ResponseSchemaAttrsFn;
    strike?: ResponseSchemaFn;
    superscript?: ResponseSchemaFn;
    subscript?: ResponseSchemaFn;
    code?: ResponseSchemaFn;
    anchor?: ResponseSchemaAttrsFn;
    // TODO: add support. The following are known, though not supported yet
    // emoji?: ResponseSchemaAttrsFn;
    // textStyle?: ResponseSchemaAttrsFn;
    // highlight?: ResponseSchemaAttrsFn;
  };
};

export type Options = {
  schema?: Schema;
  resolver?: (blok: SbBlok) => ComponentNode;
};

export type Mark =
  | {
      type:
        | "bold"
        | "italic"
        | "underline"
        | "strike"
        | "superscript"
        | "subscript"
        | "code";
    }
  | {
      type: "anchor";
      attrs: {
        id: string;
      };
    }
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

type HorizontalRule = { type: "horizontal_rule" };

type Text = {
  type: "text";
  text: string;
  marks?: Mark[];
};

type Paragraph = {
  type: "paragraph";
  content?: Array<Text | Break | ListItem | Image>;
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

type Image = {
  type: "image";
  attrs: {
    id: number;
    alt?: string;
    src: string;
    title?: string;
    source?: string;
    copyright?: string;
    meta_data?: Record<string, string>;
  };
};

type Blockquote = {
  type: "blockquote";
  content?: Array<
    | Paragraph
    | Blok
    | BulletList
    | OrderedList
    | HorizontalRule
    | Image
    | CodeBlock
  >;
};

type ListItem = {
  type: "list_item";
  content?: Array<
    Paragraph | Blok | BulletList | OrderedList | HorizontalRule | Image
  >;
};

type BulletList = {
  type: "bullet_list";
  content?: Array<ListItem>;
};

type OrderedList = {
  type: "ordered_list";
  attrs: {
    order: number;
  };
  content?: Array<ListItem>;
};

type CodeBlock = {
  type: "code_block";
  attrs: {
    class: string;
  };
  content?: Array<Text>;
};

type RichTextContent =
  | Heading
  | Paragraph
  | Blok
  | BulletList
  | OrderedList
  | Break
  | HorizontalRule
  | Blockquote
  | CodeBlock;

export type SchemaNode = RichTextContent | Text | ListItem | Image;

// TODO: expand with full marks support
export type RichTextType = {
  type: "doc";
  content: Array<RichTextContent>;
};
