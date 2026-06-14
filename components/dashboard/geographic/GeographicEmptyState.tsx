import React from 'react';
import { Search, MapPin } from 'lucide-react';

interface GeographicEmptyStateProps {
  query: string;
  hasResults: boolean;
}

export function GeographicEmptyState({ query, hasResults }: GeographicEmptyStateProps) {
  if (query.length > 0 && !hasResults) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground opacity-60 mt-12">
        <MapPin className="w-12 h-12 mb-4" />
        <p>No exposure found in &quot;{query}&quot;</p>
      </div>
    );
  }

  if (query.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground opacity-60 mt-12">
        <Search className="w-12 h-12 mb-4" />
        <p>Type a country or click the map</p>
      </div>
    );
  }

  return null;
}
