"use client";

import Link from "next/link";
import { WalletSelector } from "./WalletSelector";

export function Header() {
  return (
    <nav className="p-4 md:p-6 font-display dark:bg-gray-900 shadow ">
      <div className="container mx-auto flex flex-wrap md:flex-nowrap justify-between items-center ">
        {/* Title */}
        <Link href="/" className="text-2xl font-bold gradient-text">
          SlashContract
        </Link>

        {/* Connect Wallet */}
        <div className="text-blue-300 border-2 border-black">
          <WalletSelector />
        </div>
      </div>
    </nav>
  );
}
