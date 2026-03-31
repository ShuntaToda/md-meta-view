import type { MdEntry } from "@md-meta-view/core";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

interface MarkdownViewProps {
  entry: MdEntry;
  onClose: () => void;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function renderInlineMd(text: string): string {
  const html = marked.parseInline(text) as string;
  return DOMPurify.sanitize(html);
}

function CopyableCell({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const html = useMemo(() => renderInlineMd(value), [value]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <TableCell
      className="text-xs cursor-pointer hover:bg-muted/50 relative group"
      onClick={handleCopy}
      title="Click to copy"
    >
      <div className="flex items-center gap-2">
        <span
          className="prose prose-xs dark:prose-invert [&_a]:text-primary [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {copied ? "Copied!" : "Copy"}
        </span>
      </div>
    </TableCell>
  );
}

export function MarkdownView({ entry, onClose }: MarkdownViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const url = new URL(`${window.location.origin}/`);
    url.searchParams.set("file", entry.id);
    await navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm text-muted-foreground truncate mr-2">
          {entry.relativePath}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            {copied ? "Copied!" : "Copy Link"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
      </div>

      {Object.keys(entry.frontmatter).length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableBody>
              {Object.entries(entry.frontmatter).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell className="font-medium text-muted-foreground w-32 text-xs">
                    {key}
                  </TableCell>
                  <CopyableCell value={formatValue(value)} />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div
        className="prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: entry.html }}
      />
    </div>
  );
}
