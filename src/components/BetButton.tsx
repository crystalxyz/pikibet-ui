import { useState } from 'react'

interface BetButtonProps {
  value: number
  cost: number
  isSelected: boolean
  onSelect: (value: number) => void
}

export function BetButton({ value, cost, isSelected, onSelect }: BetButtonProps) {
  return (
    <button
      onClick={() => onSelect(value)}
      className={[
        'group relative flex flex-col items-center justify-center rounded-xl border px-4 py-3 text-center transition',
        isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
      ].join(' ')}
    >
      <span className={[
        'text-lg font-semibold',
        isSelected ? 'text-blue-700' : 'text-gray-900'
      ].join(' ')}>{value} Yes</span>
      <span className={[
        'mt-1 text-sm',
        isSelected ? 'text-blue-700' : 'text-gray-600'
      ].join(' ')}>Cost: ${cost.toFixed(2)}</span>
    </button>
  )
}
