"use client";

import { motion } from "framer-motion";
import {
  CheckCircle,
  Code,
  Copy,
  ExternalLink,
  Link as LinkIcon,
  Mail,
  MessageSquare,
  Share2,
} from "lucide-react";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const formUrl = `${baseUrl}/form/${formId}`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
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
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Share & Embed Form</DialogTitle>
          <DialogDescription>
            Share your form with others or embed it on your website
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link" className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Link
            </TabsTrigger>
            <TabsTrigger value="embed" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Embed
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Social
            </TabsTrigger>
          </TabsList>

          {/* Link Tab */}
          <TabsContent value="link" className="space-y-4 mt-4">
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
              <div className="flex gap-2">
                <Input
                  id="form-url"
                  value={formUrl}
                  readOnly
                  className="font-mono text-sm"
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
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto border border-border">
                  <code>{embedCode}</code>
                </pre>
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
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto border border-border">
                  <code>{embedCodeReact}</code>
                </pre>
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
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto border border-border">
                  <code>{embedCodeWordPress}</code>
                </pre>
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

          {/* Embed Tab */}
          <TabsContent value="embed" className="space-y-6 mt-4">
            <div className="space-y-6">
              {/* Embed Codes */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-semibold">HTML</Label>
                    <Badge variant="secondary" className="text-xs">
                      Most Common
                    </Badge>
                  </div>
                  <div className="relative">
                    <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto border border-border">
                      <code>{embedCode}</code>
                    </pre>
                    <Button
                      type="button"
                      onClick={() => copyToClipboard(embedCode, "embed-html")}
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                    >
                      {copied === "embed-html" ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2 block">
                    React/Next.js
                  </Label>
                  <div className="relative">
                    <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto border border-border">
                      <code>{embedCodeReact}</code>
                    </pre>
                    <Button
                      type="button"
                      onClick={() =>
                        copyToClipboard(embedCodeReact, "embed-react")
                      }
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                    >
                      {copied === "embed-react" ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2 block">
                    WordPress
                  </Label>
                  <div className="relative">
                    <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto border border-border">
                      <code>{embedCodeWordPress}</code>
                    </pre>
                    <Button
                      type="button"
                      onClick={() =>
                        copyToClipboard(embedCodeWordPress, "embed-wp")
                      }
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                    >
                      {copied === "embed-wp" ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Code className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                    Customization
                  </h4>
                  <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                    <li>
                      • Change{" "}
                      <code className="bg-purple-200 dark:bg-purple-800 px-1 rounded">
                        height
                      </code>{" "}
                      to adjust form size
                    </li>
                    <li>
                      • Set{" "}
                      <code className="bg-purple-200 dark:bg-purple-800 px-1 rounded">
                        width="600"
                      </code>{" "}
                      for fixed width
                    </li>
                    <li>
                      • Add{" "}
                      <code className="bg-purple-200 dark:bg-purple-800 px-1 rounded">
                        loading="lazy"
                      </code>{" "}
                      for better performance
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="mt-4">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Quick Share
                </Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Share your form directly on social platforms
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <motion.button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    shareViaEmail();
                  }}
                  className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-accent transition-colors text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">
                      Share via Email
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Send form link to your contacts
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                </motion.button>

                <motion.button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    shareViaTwitter();
                  }}
                  className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-accent transition-colors text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">
                      Share on X (Twitter)
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Post to your X timeline
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                </motion.button>

                <motion.button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    shareViaLinkedIn();
                  }}
                  className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-accent transition-colors text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">
                      Share on LinkedIn
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Post to your network
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              </div>
            </div>

            <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Share2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Maximize Reach
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Share your form across multiple platforms to reach more
                    people. Each platform has its own audience, so diversifying
                    your sharing strategy can significantly increase response
                    rates.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
