export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl">🏀</span>
            </div>
            <h1 className="text-white text-2xl font-bold">HOOPX</h1>
          </div>
          <div className="text-white text-sm">
            <span className="opacity-70">EN</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-md mx-auto">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-purple-700 rounded-full border-4 border-orange-500 mb-6">
              <span className="text-6xl">🏀</span>
            </div>
            <div className="mb-4">
              <h2 className="text-orange-500 text-3xl font-bold tracking-wider mb-2">
                HOOPX
              </h2>
              <p className="text-white text-xl">认购活动</p>
            </div>
          </div>

          {/* Balance Display */}
          <div className="bg-purple-800/50 rounded-lg p-6 mb-6 text-center">
            <p className="text-white/70 text-sm mb-2">USDT/HOOPX</p>
            <p className="text-white text-4xl font-bold">0.003</p>
          </div>

          {/* Buy Button */}
          <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-purple-900 font-bold text-lg py-4 px-6 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg">
            还没认购
          </button>

          <p className="text-white/60 text-xs text-center mt-4">
            1000-5000USDT 认购金额
          </p>

          {/* Info Section */}
          <div className="mt-8 space-y-4">
            <div className="bg-purple-800/30 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">What is HOOPX?</h3>
              <p className="text-white/70 text-sm">
                HOOPX Token is a Solana-based token for basketball enthusiasts.
                Join our presale and be part of the community.
              </p>
            </div>

            <div className="bg-purple-800/30 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">How to Purchase</h3>
              <ol className="text-white/70 text-sm space-y-2 list-decimal list-inside">
                <li>Connect your Solana wallet</li>
                <li>Select purchase amount (1000-5000 USDT)</li>
                <li>Confirm transaction</li>
                <li>Wait for tokens to be locked and vested</li>
              </ol>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
