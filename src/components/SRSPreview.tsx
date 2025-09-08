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
    <Card className="w-full max-w-4xl mx-auto border shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex justify-between items-center">
        <CardTitle className="text-lg font-bold">SRS Preview</CardTitle>
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

      <CardContent className="p-4">
        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-blue-700 dark:prose-headings:text-blue-400 prose-a:text-purple-600 dark:prose-a:text-purple-400 overflow-y-auto max-h-[500px] border rounded-md p-4 bg-muted/20">
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
                    className="bg-muted px-1 py-0.5 rounded text-sm font-mono"
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <pre className="bg-muted p-4 rounded-md text-sm font-mono overflow-x-auto">
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