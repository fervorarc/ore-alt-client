import { lamportsToSol } from '@/lib/accounts';

interface GridProps {
  deployed: bigint[];
  count: bigint[];
}

export function Grid({ deployed, count }: GridProps) {
  if (deployed.length !== 25 || count.length !== 25) {
    return (
      <div className="text-red-500">
        Invalid grid data (expected 25 squares)
      </div>
    );
  }

  // Find max deployed to scale colors
  const maxDeployed = Math.max(...deployed.map(d => Number(d)));

  return (
    <div className="grid grid-cols-5 gap-3">
      {deployed.map((lamports, index) => {
        const sol = lamportsToSol(lamports);
        const miners = count[index];
        const isEmpty = sol === 0;

        // Calculate color intensity based on SOL amount
        const intensity = maxDeployed > 0
          ? Math.min(100, Math.floor((Number(lamports) / maxDeployed) * 100))
          : 0;

        return (
          <div
            key={index}
            className={`
              relative rounded-lg p-4 transition-all duration-300
              hover:scale-105 hover:shadow-lg cursor-pointer
              ${
                isEmpty
                  ? 'bg-gray-800/50 border-2 border-gray-700'
                  : `bg-blue-900/30 border-2 border-blue-500`
              }
            `}
            style={{
              backgroundColor: !isEmpty
                ? `rgba(59, 130, 246, ${0.1 + (intensity / 100) * 0.4})`
                : undefined
            }}
          >
            {/* Square number badge */}
            <div className="absolute top-1 right-1 text-xs text-gray-500 font-mono">
              #{index}
            </div>

            {/* SOL amount */}
            <div className={`text-lg font-bold mb-1 ${isEmpty ? 'text-gray-500' : 'text-white'}`}>
              {sol.toFixed(4)}
            </div>
            <div className="text-xs text-gray-400 mb-2">
              SOL
            </div>

            {/* Miner count */}
            <div className="flex items-center gap-1 text-xs">
              <span className={isEmpty ? 'text-gray-600' : 'text-blue-300'}>
                👤 {miners.toString()}
              </span>
            </div>

            {/* Intensity indicator */}
            {!isEmpty && intensity > 0 && (
              <div className="absolute bottom-1 left-1 right-1">
                <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400 transition-all duration-500"
                    style={{ width: `${intensity}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
