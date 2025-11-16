"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Code, Palette, X } from "lucide-react";

interface WhatsNewDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WhatsNewDialog({ isOpen, onClose }: WhatsNewDialogProps) {
  const handleClose = () => {
    localStorage.setItem('whats-new-seen', 'true');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90">
        <DialogHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold">What's New in Shunya</DialogTitle>
          <DialogDescription className="text-base">
            Discover the latest features and improvements we've added to enhance your AI building experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* New Features */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">Lightning Fast AI Generation</h3>
                  <Badge variant="secondary" className="text-xs">New</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Experience 3x faster AI-powered code generation with our optimized models and improved caching system.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50">
              <div className="p-2 rounded-lg bg-secondary">
                <Code className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">Advanced Code Editor</h3>
                  <Badge variant="outline" className="text-xs">Enhanced</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  New syntax highlighting, auto-completion, and real-time error detection for better coding experience.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-accent/50">
              <div className="p-2 rounded-lg bg-accent">
                <Palette className="h-5 w-5 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">Theme Customization</h3>
                  <Badge variant="outline" className="text-xs">Enhanced</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Customize your workspace with new theme options and improved dark/light mode switching.
                </p>
              </div>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="border-t border-border pt-4">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Coming Soon
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>Collaborative editing with real-time sync</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>Advanced AI model selection and fine-tuning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>One-click deployment to multiple platforms</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button onClick={handleClose} className="px-6">
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}