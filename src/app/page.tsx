import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex-col flex gap-8">
        <h1 className="text-4xl font-bold">Welcome to MotoTracker Pro</h1>
        <p className="text-xl text-muted-foreground">Professional motorcycle maintenance tracking application</p>
        <div className="flex gap-4">
          <Link href="/login" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
            Login
          </Link>
          <Link href="/register" className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90">
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
