import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuth, signOut } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { WhatsNewDialog } from "@/components/WhatsNewDialog";
import { Sidebar } from "@/components/Sidebar";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [showWhatsNew, setShowWhatsNew] = useState(false);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        // Show "What's New" dialog after a short delay if not seen before
        const hasSeenWhatsNew = localStorage.getItem('whats-new-seen');
        if (!hasSeenWhatsNew) {
          setTimeout(() => setShowWhatsNew(true), 1000);
        }
      } else {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    const auth = getAuth(app);
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <div className="flex-1">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome to Shunya</h1>
                <p className="text-muted-foreground">Your AI builder dashboard</p>
              </div>
              <Button onClick={handleSignOut} variant="outline">
                Sign Out
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>AI Builder</CardTitle>
                  <CardDescription>
                    Create applications with AI assistance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Start Building</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Projects</CardTitle>
                  <CardDescription>
                    Manage your AI-generated projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">View Projects</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>
                    Track your development metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">View Analytics</Button>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Your account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p className="text-muted-foreground">{user.displayName || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">GitHub ID</label>
                    <p className="text-muted-foreground">
                      {(() => {
                        const gh = user.providerData.find(p => p.providerId === 'github.com');
                        return gh ? `@${gh.displayName ?? gh.uid}` : 'Not available';
                      })()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <WhatsNewDialog isOpen={showWhatsNew} onClose={() => setShowWhatsNew(false)} />
      </div>
    </main>
  );
}