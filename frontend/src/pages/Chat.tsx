import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Chat() {
    const { id } = useParams<{ id: string }>();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate AI processing
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, [id]);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl mx-auto">
                {isLoading ? (
                    <div className="text-center">
                        <div className="animate-pulse text-xl text-muted-foreground">
                            Processing your request...
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold">Chat {id}</h1>
                        <div className="bg-card border border-border rounded-lg p-6">
                            <p className="text-muted-foreground">
                                This is your chat interface for session: {id}
                            </p>
                            {/* Add your chat interface components here */}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
