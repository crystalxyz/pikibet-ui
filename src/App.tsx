
import { useState } from 'react'

export default function App() {
  const [selected, setSelected] = useState<number | null>(null);
  const costFor = (x: number) => +(0.1 * x).toFixed(2);
  const options = Array.from({ length: 11 }, (_, x) => x); // 0..10 yes

  return (
    <div className="min-h-screen w-full bg-white text-black flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Piki • Prediction Market</h1>
          <div className="text-sm text-gray-500">Demo UI</div>
        </div>

        {/* Question */}
        <div className="px-8 pt-6">
          <p className="text-sm uppercase tracking-wide text-gray-500 mb-2">Question</p>
          <h2 className="text-3xl font-semibold leading-snug">Do you like Cornell Tech?</h2>
          <p className="mt-2 text-gray-600">
            Bet on the <span className="font-medium">exact number</span> of “Yes” answers among the next 10 respondents.
          </p>
        </div>

        {/* Options */}
        <div className="px-8 py-6">
          <p className="text-sm text-gray-600 mb-3">
            Price rule: you pay <span className="font-semibold text-blue-700">$0.10 × x</span> for betting on <span className="font-semibold">x</span> Yes.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {options.map((x) => {
              const active = selected === x;
              const cost = costFor(x);
              return (
                <button
                  key={x}
                  onClick={() => setSelected(x)}
                  className={[
                    'group relative flex flex-col items-center justify-center rounded-xl border px-4 py-3 text-center transition',
                    active ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                  ].join(' ')}
                >
                  <span className={[
                    'text-lg font-semibold',
                    active ? 'text-blue-700' : 'text-gray-900'
                  ].join(' ')}>{x} Yes</span>
                  <span className={[
                    'mt-1 text-sm',
                    active ? 'text-blue-700' : 'text-gray-600'
                  ].join(' ')}>Cost: ${cost.toFixed(2)}</span>
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
                disabled={selected === null}
                className={[
                  'inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold',
                  selected === null
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow'
                ].join(' ')}
              >
                Place Bet
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
