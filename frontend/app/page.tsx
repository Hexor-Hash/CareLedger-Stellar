import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-8 p-8">
      <h1 className="text-4xl font-bold text-blue-700">CareLedger</h1>
      <p className="text-lg text-gray-600 text-center max-w-md">
        Decentralized healthcare payments and medical records on Stellar/Soroban
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        <Link
          href="/patient"
          className="block p-6 bg-blue-600 text-white rounded-xl text-center font-semibold hover:bg-blue-700 transition"
        >
          Patient Portal
        </Link>
        <Link
          href="/provider"
          className="block p-6 bg-green-600 text-white rounded-xl text-center font-semibold hover:bg-green-700 transition"
        >
          Provider Portal
        </Link>
      </div>
    </main>
  );
}
