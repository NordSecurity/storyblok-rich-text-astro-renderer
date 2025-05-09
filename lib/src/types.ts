import type { SbBlokData as SbBlok } from "@storyblok/js";

type Nullable<T> = T | null;

export type ComponentNode = {
  component?: unknown; // can be Astro/Solid components or StoryblokComponent
  props?: Record<string, unknown>;
  content?: string | ComponentNode[];
};

export type Resolver<Node = void> = (node: Node) => ComponentNode;

export type Schema = {
  nodes?: {
    heading?: Resolver<Heading>;
    paragraph?: Resolver<Paragraph>;
    text?: Resolver<Text>;
    hard_break?: Resolver<Break>;
    bullet_list?: Resolver<BulletList>;
    ordered_list?: Resolver<OrderedList>;
    list_item?: Resolver<ListItem>;
    horizontal_rule?: Resolver<HorizontalRule>;
    blockquote?: Resolver<Blockquote>;
    image?: Resolver<Image>;
    code_block?: Resolver<CodeBlock>;
    emoji?: Resolver<Emoji>;
    table?: Resolver<Table>;
  };
  marks?: {
    link?: Resolver<Link>;
    bold?: Resolver;
    underline?: Resolver;
    italic?: Resolver;
    styled?: Resolver<Styled>;
    strike?: Resolver;
    superscript?: Resolver;
    subscript?: Resolver;
    code?: Resolver;
    anchor?: Resolver<Anchor>;
    textStyle?: Resolver<TextStyle>;
    highlight?: Resolver<Highlight>;
  };
};

export type Options = {
  schema?: Schema;
  resolver?: (blok: SbBlok) => ComponentNode;
};

export type Anchor = {
  type: "anchor";
  attrs: {
    id: string;
  };
};

export type Styled = {
  type: "styled";
  attrs: {
    class: string;
  };
};

export type TextStyle = {
  type: "textStyle";
  attrs: {
    color: string;
  };
};

export type Highlight = {
  type: "highlight";
  attrs: {
    color: string;
  };
};

export type Link = {
  type: "link";
  attrs: {
    href: string;
    uuid?: Nullable<string>;
    anchor?: Nullable<string>;
    custom?: Record<string, unknown>;
    target: "_self" | "_blank";
    linktype: "url" | "story" | "email" | "asset";
    story?: {
      name: string;
      id: number;
      uuid: string;
      slug: string;
      url: string;
      full_slug: string;
      _stopResolving: boolean;
    };
  };
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
  | Anchor
  | Styled
  | TextStyle
  | Highlight
  | Link;

type Break = { type: "hard_break" };

type HorizontalRule = { type: "horizontal_rule" };

export type Text = {
  type: "text";
  text: string;
  marks?: Mark[];
};

export type Paragraph = {
  type: "paragraph";
  content?: Array<Text | Break | ListItem | Image | Emoji>;
};

export type Heading = {
  type: "heading";
  attrs: {
    level: 1 | 2 | 3 | 4 | 5 | 6;
  };
  content?: Text[];
};

export type Blok = {
  type: "blok";
  attrs: {
    id: string;
    body: SbBlok[];
  };
};

export type Image = {
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

export type Emoji = {
  type: "emoji";
  attrs: {
    name: string;
    emoji: string;
    fallbackImage: string;
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
    | Emoji
    | CodeBlock
  >;
};

type ListItem = {
  type: "list_item";
  content?: Array<
    Paragraph | Blok | BulletList | OrderedList | HorizontalRule | Image | Emoji
  >;
};

export type BulletList = {
  type: "bullet_list";
  content?: Array<ListItem>;
};

export type OrderedList = {
  type: "ordered_list";
  attrs: {
    order: number;
  };
  content?: Array<ListItem>;
};

export type CodeBlock = {
  type: "code_block";
  attrs: {
    class: string;
  };
  content?: Array<Text>;
};

export type Table = {
  type: "table";
  content?: Array<TableRow>;
};

export type TableRow = {
  type: "tableRow";
  content?: Array<TableHeader | TableCell>;
};

export type TableHeader = {
  type: "tableHeader";
  attrs: {
    colspan: number;
    rowspan: number;
    colwidth?: Nullable<Array<number>>;
  };
  content?: Array<
    Paragraph | Blok | BulletList | OrderedList | HorizontalRule | Image | Emoji
  >;
};

export type TableCell = {
  type: "tableCell";
  attrs: {
    colspan: number;
    rowspan: number;
    colwidth?: Nullable<Array<number>>;
    backgroundColor?: Nullable<string>;
  };
  content?: Array<
    Paragraph | Blok | BulletList | OrderedList | HorizontalRule | Image | Emoji
  >;
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
  | CodeBlock
  | Table
  | TableRow
  | TableHeader
  | TableCell;

export type SchemaNode = RichTextContent | Text | ListItem | Image | Emoji;

export type RichTextType = {
  type: "doc";
  content: Array<RichTextContent>;
};
