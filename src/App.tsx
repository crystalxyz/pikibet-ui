
import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import { LoginForm } from './components/LoginForm'
import { RegisterForm } from './components/RegisterForm'

export default function App() {
  const [selected, setSelected] = useState<number | null>(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [betting, setBetting] = useState(false);
  const { user, logout, loading } = useAuth();
  
  // One-directional market: 5-10 Yes answers only
  // Fair price is 5 (minimum), prices increase as you bet on higher numbers
  const minPrice = 5;
  const basePrice = 0.15; // Base price per unit
  const volatility = 0.08; // How much prices increase for higher bets
  
  const costFor = (x: number) => {
    const distanceFromMin = x - minPrice;
    const exponentialMultiplier = 1 + (volatility * distanceFromMin * distanceFromMin);
    return +(basePrice * x * exponentialMultiplier).toFixed(2);
  };
  const options = Array.from({ length: 6 }, (_, x) => x + 5); // 5..10 yes (one-directional market)

  const handlePlaceBet = async () => {
    if (selected === null) return;
    
    setBetting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/bet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          questionId: 'cornell-tech-question',
          selectedOption: selected,
          cost: costFor(selected)
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Bet placed! New wallet balance: $${data.newWalletBalance.toFixed(2)}`);
        setSelected(null);
        // Refresh user data
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to place bet');
      }
    } catch (error) {
      alert('Failed to place bet');
    } finally {
      setBetting(false);
    }
  };

  // TEMPORARILY DISABLED: Bypass authentication for testing
  // if (loading) {
  //   return (
  //     <div className="min-h-screen w-full bg-white text-black flex items-center justify-center">
  //       <div className="text-lg">Loading...</div>
  //     </div>
  //   );
  // }

  // if (!user) {
  //   return (
  //     <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-6">
  //       {isLoginMode ? (
  //         <LoginForm onToggleMode={() => setIsLoginMode(false)} />
  //       ) : (
  //         <RegisterForm onToggleMode={() => setIsLoginMode(true)} />
  //       )}
  //     </div>
  //   );
  // }

  // Mock user for testing when login is disabled
  const mockUser = user || {
    username: 'testuser',
    wallet: 100.00
  };

  return (
    <div className="min-h-screen w-full bg-white text-black flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Piki • Prediction Market</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Welcome, <span className="font-semibold">{mockUser.username}</span>
            </div>
            <div className="text-sm text-green-600 font-semibold">
              Wallet: ${mockUser.wallet.toFixed(2)}
            </div>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Question */}
        <div className="px-8 pt-6">
          <p className="text-sm uppercase tracking-wide text-gray-500 mb-2">Question</p>
          <h2 className="text-3xl font-semibold leading-snug">Do you like Cornell Tech?</h2>
          <p className="mt-2 text-gray-600">
            Bet on the <span className="font-medium">exact number</span> of "Yes" answers among the next 10 respondents.
            <br />
            <span className="text-sm text-blue-600 font-medium">One-directional market: 5-10 Yes answers only</span>
          </p>
        </div>

        {/* Options */}
        <div className="px-8 py-6">
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium mb-2">🎯 One-Directional Market</p>
            <p className="text-sm text-green-700">
              Bet on <span className="font-semibold">5-10 Yes</span> answers only. 
              <span className="font-semibold">5 Yes</span> is the minimum (cheapest), prices increase for higher numbers.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {options.map((x) => {
              const active = selected === x;
              const cost = costFor(x);
              const isMinPrice = x === minPrice;
              const isLowRisk = x <= 6;
              const isHighRisk = x >= 9;
              
              return (
                <button
                  key={x}
                  onClick={() => setSelected(x)}
                  className={[
                    'group relative flex flex-col items-center justify-center rounded-xl border px-4 py-3 text-center transition',
                    active 
                      ? 'border-blue-600 bg-blue-50' 
                      : isMinPrice
                        ? 'border-green-500 bg-green-50 hover:bg-green-100'
                        : isLowRisk
                          ? 'border-yellow-400 bg-yellow-50 hover:bg-yellow-100'
                          : isHighRisk
                            ? 'border-red-400 bg-red-50 hover:bg-red-100'
                            : 'border-orange-400 bg-orange-50 hover:bg-orange-100'
                  ].join(' ')}
                >
                  <span className={[
                    'text-lg font-semibold',
                    active 
                      ? 'text-blue-700' 
                      : isMinPrice
                        ? 'text-green-700'
                        : isLowRisk
                          ? 'text-yellow-700'
                          : isHighRisk
                            ? 'text-red-700'
                            : 'text-orange-700'
                  ].join(' ')}>
                    {x} Yes
                    {isMinPrice && ' 🎯'}
                    {isHighRisk && ' ⚠️'}
                  </span>
                  <span className={[
                    'mt-1 text-sm',
                    active 
                      ? 'text-blue-700' 
                      : isMinPrice
                        ? 'text-green-700'
                        : isLowRisk
                          ? 'text-yellow-700'
                          : isHighRisk
                            ? 'text-red-700'
                            : 'text-orange-700'
                  ].join(' ')}>
                    Cost: ${cost.toFixed(2)}
                    {isMinPrice && ' (Min)'}
                    {isHighRisk && ' (High Risk)'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary / Action */}
        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div>
              <p className="text-sm text-gray-500">Your Selection</p>
              <p className="text-lg font-semibold">{selected === null ? 'None' : `${selected} Yes`}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Cost</p>
                <p className="text-xl font-bold text-blue-700">${selected === null ? '0.00' : costFor(selected).toFixed(2)}</p>
              </div>
              <button
                disabled={selected === null || betting || mockUser.wallet < (selected ? costFor(selected) : 0)}
                onClick={handlePlaceBet}
                className={[
                  'inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold',
                  selected === null || betting || mockUser.wallet < (selected ? costFor(selected) : 0)
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow'
                ].join(' ')}
              >
                {betting ? 'Placing Bet...' : 'Place Bet'}
              </button>
            </div>
          </div>

          {/* Footnotes */}
          <div className="mt-4 text-xs text-gray-500">
            <p>
              This is a demo. Pricing shown uses a simple linear rule for clarity; real markets may use AMMs and dynamic prices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
