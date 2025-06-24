import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

async function Page() {
    const { userId } = await auth();
    
    // If user is not authenticated, redirect to sign-in
    if (!userId) {
        redirect("/sign-in");
    }

    return (
        <main className="mx-auto flex max-w-3xl flex-col justify-start px-10 py-20 bg-dark-1 min-h-screen">
            <h1 className="head-text text-center">Onboarding</h1>
            <p className="mt-3 text-base-regular text-light-2 text-center">
                Complete your profile now to use Threads
            </p>

            <section className="mt-9 bg-dark-2 p-10 rounded-lg">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <h2 className="text-light-1 text-2xl font-bold">
                                Welcome to Threads!
                            </h2>
                            <p className="text-light-3 text-base">
                                User ID: {userId}
                            </p>
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <a 
                            href="/"
                            className="inline-block bg-primary-500 px-8 py-2 text-light-1 rounded-lg hover:bg-opacity-80 transition-all text-center"
                        >
                            Continue to Threads
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Page;