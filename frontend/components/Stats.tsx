import { lamportsToSol, gramsToOre } from '@/lib/accounts';
import type { Round } from '@/lib/types';

interface StatsProps {
  round: Round;
}

export function Stats({ round }: StatsProps) {
  const statCards = [
    {
      label: 'Total Deployed',
      value: `${lamportsToSol(round.totalDeployed).toFixed(4)} SOL`,
      icon: '📊',
      color: 'from-green-600 to-green-700',
    },
    {
      label: 'Total Winnings',
      value: `${lamportsToSol(round.totalWinnings).toFixed(4)} SOL`,
      icon: '🏆',
      color: 'from-purple-600 to-purple-700',
    },
    {
      label: 'Total Vaulted',
      value: `${lamportsToSol(round.totalVaulted).toFixed(4)} SOL`,
      icon: '🔒',
      color: 'from-indigo-600 to-indigo-700',
    },
    {
      label: 'Top Miner Reward',
      value: `${gramsToOre(round.topMinerReward).toFixed(4)} ORE`,
      icon: '⭐',
      color: 'from-amber-600 to-amber-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`
            bg-gradient-to-br ${stat.color}
            rounded-lg p-4 shadow-lg
            transform transition-all duration-300
            hover:scale-105 hover:shadow-xl
          `}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-xs text-white/80 font-medium">
              {stat.label}
            </div>
          </div>
          <div className="text-xl font-bold text-white">
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
