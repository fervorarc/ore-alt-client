import { gramsToOre } from '@/lib/accounts';

interface MotherlodeProps {
  amount: bigint;
}

export function Motherlode({ amount }: MotherlodeProps) {
  const oreAmount = gramsToOre(amount);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-yellow-600 via-orange-600 to-yellow-700 rounded-xl p-6 shadow-xl">
      {/* Animated background sparkle effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-white to-transparent animate-pulse" />
      </div>

      <div className="relative z-10">
        {/* Title */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-3xl">💎</span>
          <h2 className="text-2xl font-bold text-yellow-100">
            Motherlode
          </h2>
        </div>

        {/* Amount */}
        <div className="mb-3">
          <div className="text-5xl font-extrabold text-white tracking-tight">
            {oreAmount.toFixed(4)}
          </div>
          <div className="text-xl font-semibold text-yellow-100 mt-1">
            ORE
          </div>
        </div>

        {/* Info */}
        <div className="bg-black/20 rounded-lg p-3 backdrop-blur-sm">
          <div className="text-sm text-yellow-100 font-medium">
            ⚡ 1 in 625 chance to win!
          </div>
          <div className="text-xs text-yellow-200/80 mt-1">
            Hit the motherlode when you mine the winning square
          </div>
        </div>

        {/* Decorative shine */}
        <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full blur-2xl" />
      </div>
    </div>
  );
}
