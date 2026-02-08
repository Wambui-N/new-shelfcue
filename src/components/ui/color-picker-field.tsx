"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { hexToHsv, hsvToHex } from "@/lib/color-utils";

const H_MAX = 360;
const S_MAX = 100;
const V_MAX = 100;

function parseHex(value: string): string {
  const v = value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(v)) return v;
  if (/^[0-9A-Fa-f]{6}$/.test(v)) return `#${v}`;
  return "#000000";
}

interface ColorPickerFieldProps {
  id?: string;
  value: string;
  onChange: (hex: string) => void;
  label?: string;
  className?: string;
  /** On desktop: false = native color input + hex. true or mobile = click swatch opens modal with H/S/V. */
  forceModal?: boolean;
}

export function ColorPickerField({
  id,
  value,
  onChange,
  label,
  className,
  forceModal = false,
}: ColorPickerFieldProps) {
  const hex = parseHex(value || "#000000");
  const [open, setOpen] = useState(false);
  const [hsv, setHsv] = useState(() => hexToHsv(hex));
  const [hexInput, setHexInput] = useState(hex);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const set = () => setIsMobile(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  useEffect(() => {
    const h = parseHex(value || "#000000");
    setHexInput(h);
    setHsv(hexToHsv(h));
  }, [value, open]);

  const showModal = forceModal || isMobile;

  const handleHsvChange = (h: number, s: number, v: number) => {
    setHsv({ h, s, v });
    const newHex = hsvToHex(h, s, v);
    setHexInput(newHex);
    onChange(newHex);
  };

  const handleHexChangeInModal = (raw: string) => {
    setHexInput(raw);
    const h = parseHex(raw);
    if (/^#[0-9A-Fa-f]{6}$/.test(h) || /^[0-9A-Fa-f]{6}$/.test(h.trim())) {
      const next = parseHex(raw);
      setHsv(hexToHsv(next));
      onChange(next);
    }
  };

  const applyAndClose = () => {
    onChange(parseHex(hexInput));
    setOpen(false);
  };

  if (!showModal) {
    return (
      <div className={cn("space-y-2", className)}>
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="flex items-center gap-2">
          <Input
            id={id}
            type="color"
            value={hex}
            onChange={(e) => onChange(parseHex(e.target.value))}
            className="w-12 h-10 p-1 border rounded cursor-pointer"
          />
          <Input
            value={hexInput}
            onChange={(e) => {
              setHexInput(e.target.value);
              const h = parseHex(e.target.value);
              if (h !== hex) onChange(h);
            }}
            placeholder="#000000"
            className="flex-1 font-mono text-sm"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          id={id}
          onClick={() => setOpen(true)}
          className={cn(
            "w-12 h-10 rounded border border-border flex-shrink-0 cursor-pointer",
            "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
          style={{ backgroundColor: hex }}
          aria-label="Pick color"
        />
        <Input
          value={hexInput}
          onChange={(e) => {
            setHexInput(e.target.value);
            const h = parseHex(e.target.value);
            if (h !== hex) onChange(h);
          }}
          placeholder="#000000"
          className="flex-1 font-mono text-sm"
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Pick color</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Large preview: current color so users can see what they're picking */}
            <div
              className="w-full h-24 sm:h-28 rounded-lg border-2 border-border shrink-0"
              style={{
                backgroundColor: hsvToHex(hsv.h, hsv.s, hsv.v),
              }}
            />
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-10 rounded-lg border border-border flex-shrink-0"
                style={{ backgroundColor: hsvToHex(hsv.h, hsv.s, hsv.v) }}
              />
              <Input
                value={hexInput}
                onChange={(e) => handleHexChangeInModal(e.target.value)}
                placeholder="#000000"
                className="flex-1 font-mono text-sm"
              />
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Hue</span>
                  <span>{hsv.h} / {H_MAX}</span>
                </div>
                {/* Hue strip: full spectrum so users see all colors */}
                <div
                  className="w-full h-3 rounded-full border border-border overflow-hidden"
                  style={{
                    background: `linear-gradient(to right, ${[
                      "#ff0000",
                      "#ff8000",
                      "#ffff00",
                      "#80ff00",
                      "#00ff00",
                      "#00ff80",
                      "#00ffff",
                      "#0080ff",
                      "#0000ff",
                      "#8000ff",
                      "#ff00ff",
                      "#ff0080",
                      "#ff0000",
                    ].join(", ")})`,
                  }}
                />
                <Slider
                  min={0}
                  max={H_MAX}
                  step={1}
                  value={[hsv.h]}
                  onValueChange={([v]) => handleHsvChange(v, hsv.s, hsv.v)}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Saturation</span>
                  <span>{hsv.s} / {S_MAX}</span>
                </div>
                <Slider
                  min={0}
                  max={S_MAX}
                  step={1}
                  value={[hsv.s]}
                  onValueChange={([v]) => handleHsvChange(hsv.h, v, hsv.v)}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Value</span>
                  <span>{hsv.v} / {V_MAX}</span>
                </div>
                <Slider
                  min={0}
                  max={V_MAX}
                  step={1}
                  value={[hsv.v]}
                  onValueChange={([v]) => handleHsvChange(hsv.h, hsv.s, v)}
                />
              </div>
            </div>
            <Button type="button" onClick={applyAndClose} className="w-full">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
