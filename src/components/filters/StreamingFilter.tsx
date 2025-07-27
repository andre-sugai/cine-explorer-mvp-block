import React from 'react';
import { StreamingProvider } from '@/hooks/useStreamingProviders';

interface StreamingFilterProps {
  providers: StreamingProvider[];
  selectedProvider: string;
  onProviderChange: (providerId: string) => void;
  loading?: boolean;
}

export const StreamingFilter: React.FC<StreamingFilterProps> = ({
  providers,
  selectedProvider,
  onProviderChange,
  loading = false
}) => {
  return (
    <div className="min-w-[200px]">
      <label className="block text-sm mb-1 font-medium text-primary">
        Streaming
      </label>
      <select
        value={selectedProvider}
        onChange={(e) => onProviderChange(e.target.value)}
        disabled={loading}
        className="w-full rounded px-3 py-2 bg-secondary/50 border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
      >
        <option value="all">Todos os streamings</option>
        {providers.map((provider) => (
          <option key={provider.provider_id} value={provider.provider_id.toString()}>
            {provider.provider_name}
          </option>
        ))}
      </select>
    </div>
  );
};