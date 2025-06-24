import type { Metadata } from "next";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Threads",
  description: "A Next.js 15 Meta Threads Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SignedIn>
        <div className="w-full flex min-h-screen bg-dark-1">
          {/* Left sidebar */}
          <aside className="w-64 bg-dark-2 p-6 border-r border-dark-4">
            <div className="flex w-full flex-1 flex-col gap-6">
              <h2 className="text-light-1 text-xl font-bold">Threads</h2>
              <nav className="flex flex-col gap-4">
                <a href="/" className="text-light-2 hover:text-light-1 transition-colors">
                  🏠 Home
                </a>
                <a href="/onboarding" className="text-light-2 hover:text-light-1 transition-colors">
                  👤 Profile
                </a>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <section className="flex-1 bg-dark-1">
            <div className="w-full max-w-4xl mx-auto">
              {children}
            </div>
          </section>

          {/* Right sidebar */}
          <aside className="w-64 bg-dark-2 p-6 border-l border-dark-4">
            <div className="flex flex-col gap-6">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
              />
              <div className="text-light-2 text-sm">
                Welcome to Threads!
              </div>
            </div>
          </aside>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="min-h-screen bg-dark-1">
          {children}
        </div>
      </SignedOut>
    </>
  );
}
