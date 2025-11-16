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
import { Rocket, BrainCircuit, Terminal, Blocks, X } from "lucide-react";

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
      <DialogContent className="w-full max-w-sm rounded-2xl border-border bg-card text-card-foreground p-5 shadow-lg">
        <div className="space-y-4">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="p-2.5 rounded-full bg-primary/10">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-bold tracking-tight">What's New</h2>
            <p className="text-xs text-muted-foreground mt-1.5">
              Latest features and improvements
            </p>
          </div>

          {/* New Features */}
          <div className="space-y-3">
              <div className="group rounded-xl bg-muted/50 p-3 transition-all duration-300 hover:bg-muted/80 hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <BrainCircuit className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-card-foreground">AI Generation</h3>
                      <p className="text-[10px] text-muted-foreground">3x faster models</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px] px-2 py-0.5">New</Badge>
                </div>
              </div>

              <div className="group rounded-xl bg-muted/50 p-3 transition-all duration-300 hover:bg-muted/80 hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-secondary/50">
                      <Terminal className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-card-foreground">Code Editor</h3>
                      <p className="text-[10px] text-muted-foreground">Smart completion</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5">Enhanced</Badge>
                </div>
              </div>

              <div className="group rounded-xl bg-muted/50 p-3 transition-all duration-300 hover:bg-muted/80 hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-accent/50">
                      <Blocks className="h-4 w-4 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-card-foreground">Components</h3>
                      <p className="text-[10px] text-muted-foreground">New themes & blocks</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5">Enhanced</Badge>
                </div>
              </div>
          </div>

          {/* Coming Soon */}
          <div className="border-t border-border pt-3">
              <h4 className="font-semibold text-card-foreground mb-2 flex items-center gap-2 text-xs">
                <Rocket className="h-3.5 w-3.5 text-primary" />
                Coming Soon
              </h4>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0"></div>
                  <span className="text-[10px] text-muted-foreground">Real-time collaboration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0"></div>
                  <span className="text-[10px] text-muted-foreground">AI model fine-tuning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0"></div>
                  <span className="text-[10px] text-muted-foreground">One-click deployment</span>
                </div>
              </div>
            </div>

          <div className="flex justify-end border-t border-border pt-3 mt-4">
            <Button onClick={handleClose} className="px-5 py-2 text-xs rounded-lg">
              Get Started
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}