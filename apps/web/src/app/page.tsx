export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-32 px-16 text-center gap-8">
        <h1 className="text-5xl font-bold tracking-tight text-black dark:text-zinc-50">
          Stellar Drips
        </h1>
        <p className="max-w-lg text-lg text-zinc-600 dark:text-zinc-400">
          Recurring payments and subscriptions on the Stellar network.
          Powered by Soroban smart contracts.
        </p>
        <div className="flex gap-4">
          <div className="rounded-full border border-black/10 dark:border-white/20 px-6 py-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Connect Wallet →
          </div>
        </div>
      </main>
    </div>
  );
}
