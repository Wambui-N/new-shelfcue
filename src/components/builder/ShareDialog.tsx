"use client";

import { motion } from "framer-motion";
import {
  CheckCircle,
  Code,
  Copy,
  Download,
  ExternalLink,
  Link as LinkIcon,
  Mail,
  MessageSquare,
  QrCode as QrCodeIcon,
  Share2,
} from "lucide-react";
import posthog from "posthog-js";
import { useRef, useState } from "react";
import QRCode from "react-qr-code";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ColorPickerField } from "@/components/ui/color-picker-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formId: string;
  formTitle: string;
  formStatus: "draft" | "published";
}

export function ShareDialog({
  open,
  onOpenChange,
  formId,
  formTitle,
  formStatus,
}: ShareDialogProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [qrSize, setQrSize] = useState(256);
  const [qrColor, setQrColor] = useState("#151419");
  const [qrBgColor, setQrBgColor] = useState("#FFFFFF");
  const qrRef = useRef<HTMLDivElement>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const formUrl = `${baseUrl}/form/${formId}`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);

    // PostHog: Capture form link/embed code copy
    posthog.capture("form_link_copied", {
      form_id: formId,
      copy_type: type,
      form_title: formTitle,
    });
  };

  const embedCode = `<iframe
  src="${formUrl}"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none; border-radius: 8px;"
></iframe>`;

  const embedCodeReact = `<iframe
  src="${formUrl}"
  width="100%"
  height={600}
  frameBorder="0"
  style={{ border: 'none', borderRadius: '8px' }}
/>`;

  const embedCodeWordPress = `[iframe src="${formUrl}" width="100%" height="600"]`;

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out this form: ${formTitle}`);
    const body = encodeURIComponent(
      `I'd like to share this form with you:\n\n${formUrl}`,
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaTwitter = () => {
    const text = encodeURIComponent(`Check out this form: ${formTitle}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${formUrl}`);
  };

  const shareViaLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${formUrl}`,
    );
  };

  const downloadQRCode = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    // Create a canvas to convert SVG to PNG at high resolution
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set high resolution for printing (300 DPI equivalent)
    const scaleFactor = 4; // 4x resolution for high quality printing
    canvas.width = qrSize * scaleFactor;
    canvas.height = qrSize * scaleFactor;

    // Create an image from the SVG
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      // Convert to PNG and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `${formTitle.replace(/[^a-z0-9]/gi, "_")}_qr_code.png`;
        link.href = downloadUrl;
        link.click();
        URL.revokeObjectURL(downloadUrl);
      }, "image/png");
    };

    img.src = url;
  };

  if (formStatus !== "published") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Form Not Published</DialogTitle>
            <DialogDescription>
              You need to publish this form before you can share it.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-muted-foreground mb-4">
              Click the "Publish" button to make your form available for
              sharing.
            </p>
            <Button type="button" onClick={() => onOpenChange(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed inset-0 z-50 w-full h-full max-w-none translate-x-0 translate-y-0 top-0 left-0 rounded-none flex flex-col gap-0 overflow-hidden p-0 data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100">
        <div className="flex flex-col h-full min-h-0 overflow-hidden">
          <DialogHeader className="flex-shrink-0 p-4 sm:p-6 pb-2">
            <DialogTitle className="text-2xl">Share & Embed Form</DialogTitle>
            <DialogDescription>
              Share your form with others or embed it on your website
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="link" className="flex flex-col flex-1 min-h-0 overflow-hidden px-4 sm:px-6">
            <TabsList className="flex-shrink-0 grid w-full grid-cols-4">
            <TabsTrigger value="link" className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Link</span>
            </TabsTrigger>
            <TabsTrigger value="qr" className="flex items-center gap-2">
              <QrCodeIcon className="w-4 h-4" />
              <span className="hidden sm:inline">QR Code</span>
            </TabsTrigger>
            <TabsTrigger value="embed" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              <span className="hidden sm:inline">Embed</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Social</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden smooth-scroll mt-4 pb-6">
          {/* Link Tab */}
          <TabsContent value="link" className="space-y-4 mt-0">
            <div>
              <Label
                htmlFor="form-url"
                className="text-base font-semibold mb-2 block"
              >
                Form URL
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Share this link with anyone to collect responses
              </p>
              <div className="flex flex-col sm:flex-row gap-2 min-w-0">
                <Input
                  id="form-url"
                  value={formUrl}
                  readOnly
                  className="font-mono text-sm min-w-0"
                />
                <Button
                  type="button"
                  onClick={() => copyToClipboard(formUrl, "url")}
                  variant="outline"
                  className="flex-shrink-0"
                >
                  {copied === "url" ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => window.open(formUrl, "_blank")}
                  variant="outline"
                  className="flex-shrink-0"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open
                </Button>
              </div>
            </div>

            <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <LinkIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Direct Link
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Anyone with this link can submit responses to your form.
                    Share it via email, social media, or anywhere else you'd
                    like to collect responses.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* QR Code Tab */}
          <TabsContent value="qr" className="space-y-6 mt-4">
            <div className="space-y-6">
              {/* QR Code Display */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  QR Code Preview
                </Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Scan this code with a mobile device to access your form
                </p>

                <div
                  ref={qrRef}
                  className="flex justify-center items-center p-8 bg-white rounded-lg border-2 border-dashed border-border"
                  style={{ backgroundColor: qrBgColor }}
                >
                  <QRCode
                    value={formUrl}
                    size={qrSize}
                    fgColor={qrColor}
                    bgColor={qrBgColor}
                    level="H"
                  />
                </div>
              </div>

              {/* Customization Options */}
              <div className="space-y-4">
                <Label className="text-base font-semibold block">
                  Customize
                </Label>

                {/* Size Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Size</Label>
                    <span className="text-sm text-muted-foreground">
                      {qrSize}px
                    </span>
                  </div>
                  <Slider
                    value={[qrSize]}
                    onValueChange={(value) => setQrSize(value[0])}
                    min={128}
                    max={512}
                    step={32}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Larger sizes are better for printing
                  </p>
                </div>

                {/* Color Controls - on phone: custom HSV only (no presets), H/S/V at full range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ColorPickerField
                    label="QR Color"
                    value={qrColor}
                    onChange={setQrColor}
                  />
                  <ColorPickerField
                    label="Background"
                    value={qrBgColor}
                    onChange={setQrBgColor}
                  />
                </div>

                {/* Preset Colors - hidden on phone so users go straight to custom */}
                <div className="hidden sm:block space-y-2">
                  <Label className="text-sm">Brand Presets</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setQrColor("#151419");
                        setQrBgColor("#FFFFFF");
                      }}
                      className="flex-1"
                    >
                      Default
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setQrColor("#000000");
                        setQrBgColor("#FFFFFF");
                      }}
                      className="flex-1"
                    >
                      Classic
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setQrColor("#FFFFFF");
                        setQrBgColor("#151419");
                      }}
                      className="flex-1"
                    >
                      Inverted
                    </Button>
                  </div>
                </div>
              </div>

              {/* Download Button */}
              <Button
                type="button"
                onClick={downloadQRCode}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Download className="w-4 h-4 mr-2" />
                Download High-Res QR Code
              </Button>

              {/* Info Card */}
              <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <QrCodeIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                      High-Quality Print Ready
                    </h4>
                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <li>• 4x resolution for crystal-clear prints</li>
                      <li>• Perfect for posters, flyers, and business cards</li>
                      <li>• High error correction for reliable scanning</li>
                      <li>• Customize colors to match your brand</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Embed Tab */}
          <TabsContent value="embed" className="space-y-6 mt-4">
            {/* Standard HTML Embed */}
            <div>
              <Label className="text-base font-semibold mb-2 block">
                Standard HTML
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Copy this code and paste it into your website's HTML
              </p>
              <div className="relative min-w-0">
                <div className="min-w-0 overflow-hidden rounded-lg border border-border">
                  <pre className="bg-muted p-4 text-xs overflow-x-auto overflow-y-hidden">
                    <code>{embedCode}</code>
                  </pre>
                </div>
                <Button
                  onClick={() => copyToClipboard(embedCode, "html")}
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                >
                  {copied === "html" ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* React/Next.js Embed */}
            <div>
              <Label className="text-base font-semibold mb-2 block">
                React / Next.js
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                For React or Next.js applications
              </p>
              <div className="relative min-w-0">
                <div className="min-w-0 overflow-hidden rounded-lg border border-border">
                  <pre className="bg-muted p-4 text-xs overflow-x-auto overflow-y-hidden">
                    <code>{embedCodeReact}</code>
                  </pre>
                </div>
                <Button
                  onClick={() => copyToClipboard(embedCodeReact, "react")}
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                >
                  {copied === "react" ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* WordPress Embed */}
            <div>
              <Label className="text-base font-semibold mb-2 block">
                WordPress
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                For WordPress sites (use in HTML block)
              </p>
              <div className="relative min-w-0">
                <div className="min-w-0 overflow-hidden rounded-lg border border-border">
                  <pre className="bg-muted p-4 text-xs overflow-x-auto overflow-y-hidden">
                    <code>{embedCodeWordPress}</code>
                  </pre>
                </div>
                <Button
                  onClick={() =>
                    copyToClipboard(embedCodeWordPress, "wordpress")
                  }
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                >
                  {copied === "wordpress" ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Code className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                    Embed Tips
                  </h4>
                  <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                    <li>• Adjust the height value to fit your form</li>
                    <li>• The form is fully responsive and mobile-friendly</li>
                    <li>• Submissions are tracked in your dashboard</li>
                    <li>• Form styling matches your theme settings</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="space-y-4 mt-4">
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Share on Social Media
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                Share your form on social platforms
              </p>

              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={shareViaEmail}
                  variant="outline"
                  className="justify-start h-auto p-4"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold">Email</div>
                      <div className="text-xs text-muted-foreground">
                        Share via email
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Button>

                <Button
                  onClick={shareViaTwitter}
                  variant="outline"
                  className="justify-start h-auto p-4"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold">X (Twitter)</div>
                      <div className="text-xs text-muted-foreground">
                        Share on X
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Button>

                <Button
                  onClick={shareViaLinkedIn}
                  variant="outline"
                  className="justify-start h-auto p-4"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold">LinkedIn</div>
                      <div className="text-xs text-muted-foreground">
                        Share on LinkedIn
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Button>
              </div>
            </div>

            <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                    Pro Tip
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Add a compelling message when sharing on social media to
                    increase response rates. Explain what the form is for and
                    why people should fill it out.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
          </div>
        </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
