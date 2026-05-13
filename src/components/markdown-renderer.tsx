import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="break-words text-2xl font-semibold text-fg-primary">{children}</h1>,
        h2: ({ children }) => <h2 className="break-words text-xl font-semibold text-fg-primary">{children}</h2>,
        h3: ({ children }) => <h3 className="break-words text-lg font-semibold text-fg-primary">{children}</h3>,
        p: ({ children }) => <p className="break-words text-sm text-fg-secondary">{children}</p>,
        ul: ({ children }) => <ul className="w-full list-disc pl-4 text-sm text-fg-secondary">{children}</ul>,
        ol: ({ children }) => <ol className="w-full list-decimal pl-4 text-sm text-fg-secondary">{children}</ol>,
        li: ({ children }) => <li className="break-words">{children}</li>,
        table: ({ children }) => <table className="w-full border-collapse text-sm">{children}</table>,
        thead: ({ children }) => <thead className="bg-surface-secondary/70">{children}</thead>,
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => <tr className="border-b border-border">{children}</tr>,
        th: ({ children }) => <th className="border border-border px-2 py-1 text-left font-semibold text-fg-primary">{children}</th>,
        td: ({ children }) => <td className="break-words border border-border px-2 py-1 text-fg-secondary">{children}</td>,
        code: ({ children }) => (
          <code className="block overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-surface-secondary p-2 text-sm text-fg-primary">
            {children}
          </code>
        ),
        a: ({ href, children, ...props }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="break-words text-brand-primary underline underline-offset-2" {...props}>
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;