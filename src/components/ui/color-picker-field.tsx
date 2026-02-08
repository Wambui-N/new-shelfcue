"use client";

import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
  /** Shown on desktop: native color swatch + hex input. On mobile: only custom HSV sliders (no presets). */
  className?: string;
  /** Force custom HSV picker even on desktop (e.g. for consistency) */
  forceCustom?: boolean;
}

export function ColorPickerField({
  id,
  value,
  onChange,
  label,
  className,
  forceCustom = false,
}: ColorPickerFieldProps) {
  const hex = parseHex(value || "#000000");
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

  const syncFromHex = useCallback((newHex: string) => {
    const h = parseHex(newHex);
    setHsv(hexToHsv(h));
    setHexInput(h);
  }, []);

  useEffect(() => {
    const h = parseHex(value || "#000000");
    if (h !== hexInput) {
      setHexInput(h);
      setHsv(hexToHsv(h));
    }
  }, [value]);

  const showCustom = forceCustom || isMobile;

  const handleHsvChange = (h: number, s: number, v: number) => {
    setHsv({ h, s, v });
    const newHex = hsvToHex(h, s, v);
    setHexInput(newHex);
    onChange(newHex);
  };

  const handleHexChange = (raw: string) => {
    setHexInput(raw);
    const h = parseHex(raw);
    if (h !== parseHex(value || "#000000")) {
      setHsv(hexToHsv(h));
      onChange(h);
    }
  };

  if (!showCustom) {
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
            onChange={(e) => handleHexChange(e.target.value)}
            placeholder="#000000"
            className="flex-1 font-mono text-sm"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="flex items-center gap-2">
        <div
          className="w-12 h-10 rounded border border-border flex-shrink-0"
          style={{ backgroundColor: hex }}
          aria-hidden
        />
        <Input
          id={id}
          value={hexInput}
          onChange={(e) => handleHexChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 font-mono text-sm"
        />
      </div>
      <div className="space-y-3 pt-1">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Hue</span>
            <span>{hsv.h} / {H_MAX}</span>
          </div>
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
    </div>
  );
}
