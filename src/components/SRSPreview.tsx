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


Develop a Cubesat for LEOProject FalconLite — System Requirements Specification (SRS)
Document ID: SRS-FalconLite-001
Date: 2025-09-07
Prepared by: SRS Generator (automated)
Classification: Educational / Non-actionable — sensitive technical details redacted

Revision history
Rev 0.1 — Draft generated from input JSON.
Rev 0.2 — Safety redaction
Contents
Introduction
System Overview
Requirements
Safety Redactions
Appendices

Introduction:
The LEOProject FalconLite is a NASA-funded educational initiative aimed at promoting hands-on experience in satellite design, development, and deployment for students. A cubesat is proposed as the payload to achieve this objective.

System Overview:
The proposed cubesat will be designed to operate in Low Earth Orbit (LEO) with an altitude of approximately 500 km above the Earth's surface. The primary mission objectives are:

1. To demonstrate the feasibility of a cubesat for LEO missions.
2. To develop and test critical subsystems, including power generation, communication, navigation, and attitude control.

System Requirements:
The following system requirements are defined for the proposed cubesat:

**Physical Characteristics:**

* Mass: ≤ 5 kg
* Volume: < 0.1 m³
* Dimensional tolerance: ±10%
* Material selection: Lightweight materials (e.g., aluminum, titanium)
* Thermal insulation: Multilayer insulation with thermal interface material

**Power and Propulsion:**

* Power source: Solar panel array (> 100 W) with battery backup ( capacity > 2 Ah)
* Power bus voltage: 12 V DC
* Communication transmitter: 1.4 GHz FM radio transmitter (> -50 dBm)
* Attitude control: Reaction wheel (1 kg) with sun sensor and star tracker

**Communication:**

* Frequency allocation: 1.4 GHz FM band
* Data transmission rate: < 10 kbps
* Ground station requirements: UHF or S-band antenna with a receive sensitivity of ≥ -100 dBm

**Navigation and Control:**

* Navigation system: GPS receiver (1 Hz update rate)
* Attitude control system: Reaction wheel with sun sensor and star tracker
* Orbit determination: Inertial measurement unit (IMU) with gyroscopes and accelerometers

**Data Storage and Telemetry:**

* Data storage: Solid-state memory (≥ 128 MB)
* Telemetry transmission: Real-time data transmission via radio communication

**Safety Redactions:**

Due to sensitive technical details, the following information is redacted:

* Specifics of the power source's efficiency and capacity
* Detailed design parameters for the solar panel array
* Exact dimensions and material selection for the reaction wheel
* Technical specifications for the ground station antenna

**Appendices:**

1. System architecture diagram
2. Component list with specifications and tolerances
3. Materials and manufacturing process documentation
4. Test plan and validation procedures
5. Risk assessment and mitigation strategies
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
        <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-a:text-foreground prose-strong:text-foreground prose-code:text-foreground flex-1 overflow-y-auto scroll-smooth border border-border rounded-md p-4 bg-muted/50" style={{ maxHeight: 'calc(100vh - 300px)' }}>
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
