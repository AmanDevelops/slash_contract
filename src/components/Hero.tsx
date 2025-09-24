import { Button } from "@/components/ui/button";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import Link from "next/link";

export default function Hero() {
  const { account, connected, disconnect, wallet } = useWallet();

  return (
    <main className="flex-grow flex flex-col items-center justify-center h-[60vh] max-sm:h-[42vh]">
      <section className="text-center flex flex-col items-center justify-end">
        <h1 className="text-3xl md:text-7xl font-bold tracking-tighter gradient-text">
          Decentralizing Trust Between <br /> Employers and Workers.
        </h1>
        <p className="mt-5 text-xl font-semibold text-gray-200 text-center tracking-tight leading-6 max-w-2xl">
          SlashContract - Next-Generation Escrow, Powered by Aptos Move.
        </p>

        <div className="mt-8 flex gap-4 flex-col sm:flex-row">
          <Button
            asChild
            size="lg"
            className="gradient-button"
          >
            <Link href="/employer">{connected ? "Dashboard" : "Get Started"}</Link>
          </Button>

          {/* <Button asChild variant="outline" size="lg" className="dark:border-gray-500 dark:text-gray-200">
            <Link href="/explore">Ask a Question</Link>
          </Button> */}
        </div>
      </section>
    </main>
  );
}
