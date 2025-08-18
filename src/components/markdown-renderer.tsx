import { Heading, Text, Table, List, Box, Link } from "@chakra-ui/react";
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
        // Headings
        h1: ({ children }) => (
          <Heading as="h1" size="xl" wordBreak="break-word">
            {children}
          </Heading>
        ),
        h2: ({ children }) => (
          <Heading as="h2" size="lg" wordBreak="break-word">
            {children}
          </Heading>
        ),
        h3: ({ children }) => (
          <Heading as="h3" size="md" wordBreak="break-word">
            {children}
          </Heading>
        ),
        // Paragraphs
        p: ({ children }) => (
          <Text fontSize="sm" wordBreak="break-word">
            {children}
          </Text>
        ),
        // Lists
        ul: ({ children }) => (
          <List.Root fontSize={"sm"} as="ul" pl={4} w={"100%"}>
            {children}
          </List.Root>
        ),
        ol: ({ children }) => (
          <List.Root fontSize={"sm"} as="ol" pl={4} w={"100%"}>
            {children}
          </List.Root>
        ),
        li: ({ children }) => (
          <List.Item wordBreak="break-word">{children}</List.Item>
        ),
        // Tables
        table: ({ children }) => (
          <Table.Root
            size="sm"
            variant="outline"
            colorScheme="gray"
            rounded="md"
            showColumnBorder
          >
            {children}
          </Table.Root>
        ),
        thead: ({ children }) => <Table.Header>{children}</Table.Header>,
        tbody: ({ children }) => <Table.Body>{children}</Table.Body>,
        tr: ({ children }) => <Table.Row>{children}</Table.Row>,
        th: ({ children }) => (
          <Table.ColumnHeader
            border="1px"
            borderColor="gray.200"
            p={2}
            wordBreak="break-word"
          >
            {children}
          </Table.ColumnHeader>
        ),
        td: ({ children }) => (
          <Table.Cell
            border="1px"
            borderColor="gray.200"
            p={2}
            wordBreak="break-word"
          >
            {children}
          </Table.Cell>
        ),

        // Code blocks
        code: ({ children }) => (
          <Box
            as="code"
            whiteSpace="pre-wrap"
            wordBreak="break-word"
            display="block"
            p={2}
            bg="gray.50"
            rounded="md"
            overflowX="auto"
          >
            {children}
          </Box>
        ),

        a: ({ href, children, ...props }) => (
          <Link
            href={href}
            textDecoration={"underline"}
            target="_blank"
            wordBreak="break-word"
            {...props}
          >
            {children}
          </Link>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
