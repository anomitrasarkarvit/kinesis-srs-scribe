import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SRSPreviewProps {
  content: string;
  isUpdating: boolean;
  onExport: (format: 'md' | 'pdf') => void;
}

export const SRSPreview = ({ content, isUpdating, onExport }: SRSPreviewProps) => {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (content && !isUpdating) {
      setLastUpdated(new Date());
    }
  }, [content, isUpdating]);

  const defaultSRSTemplate = `# System Requirements Specification

## 1. Introduction
*This document will be populated based on your mission requirements...*

## 2. Mission Overview
*Awaiting mission description from user...*

## 3. System Architecture
*System design details will be generated here...*

## 4. Technical Requirements
*Detailed technical specifications will appear here...*

## 5. Performance Metrics
*Performance criteria and success metrics...*

## 6. Risk Assessment
*Risk analysis and mitigation strategies...*

## 7. Timeline & Milestones
*Project schedule and key deliverables...*

---

*Start the conversation to begin building your SRS document.*`;

  const displayContent = content || defaultSRSTemplate;
  const wordCount = displayContent.split(/\s+/).filter(word => word.length > 0).length;
  const estimatedReadTime = Math.ceil(wordCount / 200);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">SRS Document</h2>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
              <span>{wordCount} words</span>
              <span>~{estimatedReadTime} min read</span>
              {lastUpdated && (
                <span>Updated {lastUpdated.toLocaleTimeString()}</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isUpdating && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Updating...</span>
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('md')}
              disabled={!content || isUpdating}
            >
              <FileText className="h-4 w-4" />
              .MD
            </Button>
            
            <Button
              variant="kinesis"
              size="sm"
              onClick={() => onExport('pdf')}
              disabled={!content || isUpdating}
            >
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-y-auto">
        <Card 
          className={cn(
            "m-4 p-8 border-card-border bg-card min-h-[calc(100vh-200px)] transition-all duration-300",
            isUpdating && "opacity-75"
          )}
        >
          <div className="prose prose-slate max-w-none text-card-foreground">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-foreground mb-6 pb-2 border-b border-border">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-lg font-semibold text-foreground mt-4 mb-2">
                    {children}
                  </h4>
                ),
                p: ({ children }) => (
                  <p className="text-card-foreground leading-relaxed mb-4">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside text-card-foreground space-y-2 mb-4">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside text-card-foreground space-y-2 mb-4">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-card-foreground">
                    {children}
                  </li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground my-4">
                    {children}
                  </blockquote>
                ),
                code: ({ className, children }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
                      {children}
                    </code>
                  ) : (
                    <code className="block bg-muted p-4 rounded-md text-sm font-mono overflow-x-auto">
                      {children}
                    </code>
                  );
                },
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="w-full border-collapse border border-border">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-border bg-muted px-4 py-2 text-left font-semibold">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-border px-4 py-2">
                    {children}
                  </td>
                ),
                hr: () => (
                  <hr className="border-border my-6" />
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-muted-foreground">
                    {children}
                  </em>
                ),
              }}
            >
              {displayContent}
            </ReactMarkdown>
          </div>
        </Card>
      </div>
    </div>
  );
};