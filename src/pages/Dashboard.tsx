import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { WhatsNewDialog } from "@/components/WhatsNewDialog";
import { Sidebar } from "@/components/Sidebar";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { DashboardNavbar } from "@/components/DashboardNavbar";
import { Button } from "@/components/ui/button";

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

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <DashboardNavbar user={user} />
        <div className="flex-1 p-6 m-4 bg-muted/30 rounded-tl-3xl overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user.displayName || 'there'}!</h1>
              <p className="text-muted-foreground">Ready to build something amazing?</p>
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