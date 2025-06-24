import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold text-light-1 mb-4">Home</h1>
      <p className="text-light-1 mt-4 text-lg">
        Welcome to Threads!
      </p>
      
      <section className="mt-9 flex flex-col gap-10">
        <div className="bg-dark-2 p-6 rounded-lg border border-dark-4">
          <h2 className="text-light-1 text-2xl font-bold mb-4">Your Profile</h2>
          <p className="text-light-1 text-base font-semibold">
            User ID: {userId}
          </p>
          <p className="text-light-3 text-sm mt-2">
            You are successfully logged in to Threads!
          </p>
        </div>
        
        <div className="bg-dark-2 p-6 rounded-lg border border-dark-4">
          <h3 className="text-light-1 text-xl font-bold mb-2">Quick Actions</h3>
          <div className="flex gap-4">
            <a 
              href="/onboarding" 
              className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition-all"
            >
              Visit Onboarding
            </a>
            <button className="bg-dark-3 text-light-1 px-4 py-2 rounded-lg hover:bg-dark-4 transition-all">
              Create Thread
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
