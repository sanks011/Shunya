"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithPopup, GithubAuthProvider } from "firebase/auth";
import { app } from "@/lib/firebase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const setSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    setSize();

    type P = { x: number; y: number; v: number; o: number };
    let ps: P[] = [];
    let raf = 0;

    const make = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      v: Math.random() * 0.25 + 0.05,
      o: Math.random() * 0.35 + 0.15,
    });

    const init = () => {
      ps = [];
      const count = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < count; i++) ps.push(make());
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ps.forEach((p) => {
        p.y -= p.v;
        if (p.y < 0) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + Math.random() * 40;
          p.v = Math.random() * 0.25 + 0.05;
          p.o = Math.random() * 0.35 + 0.15;
        }
        ctx.fillStyle = `rgba(210, 100, 70, ${p.o})`;
        ctx.fillRect(p.x, p.y, 0.7, 2.2);
      });
      raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      setSize();
      init();
    };

    if (isOpen) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        window.addEventListener("resize", onResize);
        init();
        raf = requestAnimationFrame(draw);
      }, 100);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [isOpen]);

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    try {
      const auth = getAuth(app);
      const provider = new GithubAuthProvider();
      provider.addScope('user:email');

      const result = await signInWithPopup(auth, provider);
      console.log('User signed in:', result.user);

      // Close modal and redirect to dashboard after successful login
      onClose();
      navigate('/dashboard');
    } catch (error) {
      console.error('GitHub login error:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90 p-0 overflow-hidden">
        <DialogHeader className="px-8 pt-8 pb-2">
          <DialogTitle className="text-2xl text-center font-semibold">Welcome to Shunya</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground text-sm">
            Sign in to access your AI builder dashboard
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <style>{`
            .accent-lines{position:absolute;inset:0;pointer-events:none;opacity:.7}
            .hline,.vline{position:absolute;background:hsl(var(--border));will-change:transform,opacity}
            .hline{left:0;right:0;height:1px;transform:scaleX(0);transform-origin:50% 50%;animation:drawX .8s cubic-bezier(.22,.61,.36,1) forwards}
            .vline{top:0;bottom:0;width:1px;transform:scaleY(0);transform-origin:50% 0%;animation:drawY .9s cubic-bezier(.22,.61,.36,1) forwards}
            .hline:nth-child(1){top:18%;animation-delay:.12s}
            .hline:nth-child(2){top:50%;animation-delay:.22s}
            .hline:nth-child(3){top:82%;animation-delay:.32s}
            .vline:nth-child(4){left:22%;animation-delay:.42s}
            .vline:nth-child(5){left:50%;animation-delay:.54s}
            .vline:nth-child(6){left:78%;animation-delay:.66s}
            .hline::after,.vline::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,hsl(var(--primary) / 0.3),transparent);opacity:0;animation:shimmer .9s ease-out forwards}
            .hline:nth-child(1)::after{animation-delay:.12s}
            .hline:nth-child(2)::after{animation-delay:.22s}
            .hline:nth-child(3)::after{animation-delay:.32s}
            .vline:nth-child(4)::after{animation-delay:.42s}
            .vline:nth-child(5)::after{animation-delay:.54s}
            .vline:nth-child(6)::after{animation-delay:.66s}
            @keyframes drawX{0%{transform:scaleX(0);opacity:0}60%{opacity:.95}100%{transform:scaleX(1);opacity:.7}}
            @keyframes drawY{0%{transform:scaleY(0);opacity:0}60%{opacity:.95}100%{transform:scaleY(1);opacity:.7}}
            @keyframes shimmer{0%{opacity:0}35%{opacity:.25}100%{opacity:0}}

            /* === Card minimal fade-up animation === */
            .card-animate {
              opacity: 0;
              transform: translateY(20px);
              animation: fadeUp 0.8s cubic-bezier(.22,.61,.36,1) 0.4s forwards;
            }
            @keyframes fadeUp {
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>

          {/* Subtle vignette */}
          <div className="absolute inset-0 pointer-events-none [background:radial-gradient(80%_60%_at_50%_30%,hsl(var(--primary)/.08),transparent_60%)] rounded-lg" />

          {/* Animated accent lines */}
          <div className="accent-lines rounded-lg">
            <div className="hline" />
            <div className="hline" />
            <div className="hline" />
            <div className="vline" />
            <div className="vline" />
            <div className="vline" />
          </div>

          {/* Particles */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full opacity-30 mix-blend-screen pointer-events-none rounded-lg"
          />

          <Card className="card-animate border-0 bg-transparent shadow-none">
            <CardContent className="grid gap-5 pt-4 px-8">
              <Button
                onClick={handleGitHubLogin}
                disabled={isLoading}
                className="w-auto mx-auto px-8 h-11 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-base font-medium transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-sm hover:shadow-md"
              >
                <Github className="h-5 w-5 mr-3" />
                {isLoading ? "Signing in..." : "Continue with GitHub"}
              </Button>
            </CardContent>

            <CardFooter className="flex items-center justify-center text-sm text-muted-foreground pt-4 pb-8 px-8">
              By signing in, you agree to our
              <a className="ml-1 text-primary hover:underline font-medium" href="#">
                Terms of Service
              </a>
            </CardFooter>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}