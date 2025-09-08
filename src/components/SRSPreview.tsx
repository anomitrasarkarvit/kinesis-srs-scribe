import React from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, FileDown } from "lucide-react";

interface SRSPreviewProps {
  content: string;
  onExport: (format: "md" | "pdf") => void;
  isUpdating?: boolean;
  lastUpdated?: Date;
}

const SRSPreview: React.FC<SRSPreviewProps> = ({
  content,
  onExport,
  isUpdating,
  lastUpdated,
}) => {
  const defaultTemplate = `
# Project FalconLite — System Requirements Specification (SRS)

Document ID: SRS-FalconLite-001  
Date: 2025-09-07  
Prepared by: SRS Generator (automated)  
Classification: Educational / Non-actionable — sensitive technical details redacted  

---

## Revision history

- Rev 0.1 — Draft generated from input JSON.
- Rev 0.2 — Safety redaction

---

## Contents

1. Introduction  
2. System Overview  
3. Requirements  
4. Safety Redactions  
5. Appendices

---

⚠️ This is a **preview**. Final SRS will be exportable as PDF/Markdown.
`;

  const previewContent = content?.trim() || defaultTemplate;
  const wordCount =
    content?.trim().length > 0
      ? content.trim().split(/\s+/).length
      : 0;

  return (
    <Card className="h-full flex flex-col border border-border bg-card overflow-hidden">
      <CardHeader className="bg-card border-b border-border p-4 flex justify-between items-center">
        <CardTitle className="text-lg font-bold text-foreground">SRS Preview</CardTitle>
        <div className="flex space-x-2">
          <Button
            aria-label="Export as Markdown"
            variant="outline"
            size="sm"
            disabled={isUpdating}
            onClick={() => onExport("md")}
          >
            <FileText className="h-4 w-4 mr-1" />
            .MD
          </Button>
          <Button
            aria-label="Export as PDF"
            variant="outline"
            size="sm"
            disabled={isUpdating}
            onClick={() => onExport("pdf")}
          >
            <FileDown className="h-4 w-4 mr-1" />
            Export PDF
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-a:text-foreground prose-strong:text-foreground prose-code:text-foreground flex-1 overflow-y-auto border border-border rounded-md p-4 bg-muted/50">
          <ReactMarkdown
            components={{
              code({
                inline,
                className,
                children,
                ...props
              }: {
                inline?: boolean;
                className?: string;
                children: React.ReactNode;
              }) {
                  return inline ? (
                    <code
                      className="bg-muted border border-border px-1 py-0.5 rounded text-sm font-mono text-foreground"
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-muted border border-border p-4 rounded-md text-sm font-mono overflow-x-auto">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  );
              },
            }}
          >
            {previewContent}
          </ReactMarkdown>
        </div>

        <div className="mt-3 flex justify-between text-sm text-muted-foreground">
          <span>
            {isUpdating ? "Updating..." : `${wordCount} words`}
          </span>
          {lastUpdated && (
            <span>
              Last updated:{" "}
              {lastUpdated.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SRSPreview;