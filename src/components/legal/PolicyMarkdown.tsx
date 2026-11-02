import type { ComponentProps } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const EXTERNAL = /^https?:\/\//i;

/**
 * Renders a legal document's Markdown in the LegalPage look. Raw HTML in the source is not
 * rendered (react-markdown's default). Tables sit in their own horizontal scroller so a wide
 * table scrolls inside the column on a phone instead of widening the page.
 */
const components: Components = {
  h2: (props) => <h2 className="mt-10 scroll-mt-20 text-balance text-xl font-bold text-ink first:mt-0" {...omitNode(props)} />,
  h3: (props) => <h3 className="mt-6 text-lg font-bold text-ink" {...omitNode(props)} />,
  p: (props) => <p className="mt-3 text-pretty leading-relaxed text-ink-muted" {...omitNode(props)} />,
  ul: (props) => <ul className="mt-3 list-disc space-y-1.5 ps-6 leading-relaxed text-ink-muted marker:text-mkt-teal-deep" {...omitNode(props)} />,
  ol: (props) => <ol className="mt-3 list-decimal space-y-1.5 ps-6 leading-relaxed text-ink-muted marker:font-semibold marker:text-mkt-teal-deep" {...omitNode(props)} />,
  li: (props) => <li className="text-pretty ps-1" {...omitNode(props)} />,
  strong: (props) => <strong className="font-bold text-ink" {...omitNode(props)} />,
  hr: () => <hr className="my-8 border-divider" />,
  blockquote: (props) => <blockquote className="mt-3 border-s-4 border-mkt-mint-border ps-4 text-ink-muted" {...omitNode(props)} />,
  a: ({ href, children }) => {
    const external = typeof href === "string" && EXTERNAL.test(href);

    return (
      <a
        href={href}
        className="font-semibold text-mkt-teal-deep underline decoration-mkt-teal-deep/30 underline-offset-2 hover:text-primary [overflow-wrap:anywhere]"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  },
  table: (props) => (
    <div className="mt-4 max-w-full overflow-x-auto rounded-field border border-border/70">
      <table className="w-full min-w-[34rem] border-collapse text-sm" {...omitNode(props)} />
    </div>
  ),
  thead: (props) => <thead className="bg-mkt-mint-bg/60 text-mkt-teal-deep" {...omitNode(props)} />,
  tr: (props) => <tr className="border-b border-divider last:border-0" {...omitNode(props)} />,
  th: (props) => <th className="px-3 py-2.5 text-start text-xs font-bold" {...omitNode(props)} />,
  td: (props) => <td className="px-3 py-2.5 text-start align-top leading-relaxed text-ink-muted" {...omitNode(props)} />,
};

/** react-markdown passes the syntax-tree `node` prop to every component; it must not reach the DOM. */
function omitNode<T extends { node?: unknown }>(props: T): Omit<T, "node"> {
  const rest = { ...props };
  delete rest.node;

  return rest;
}

export function PolicyMarkdown({ source, ...rest }: { source: string } & Omit<ComponentProps<"div">, "children">) {
  return (
    <div {...rest}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
