export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/30 p-4">
      <div className="text-center space-y-4 max-w-lg glass p-8 rounded-2xl">
        <h1 className="text-4xl font-bold text-primary">Health Buddy</h1>
        <p className="text-lg text-muted-foreground">
          Premium AI-Powered Health Analysis Platform
        </p>
        <div className="p-4 bg-white rounded-xl shadow-sm border border-border">
          <p className="text-sm font-medium">To continue setup:</p>
          <ul className="text-sm list-disc list-inside mt-2 text-left space-y-1">
            <li>Configure Supabase URL & Key</li>
            <li>Configure Gemini API Key</li>
            <li>Start development server</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
