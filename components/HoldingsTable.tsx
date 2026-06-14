'use client';

import React, { useState, useMemo } from 'react';
import { Holding } from '@/lib/types';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { normalizeSector, normalizeCountry } from '@/lib/math';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface HoldingsTableProps {
  holdings: Holding[];
}

export function HoldingsTable({ holdings }: HoldingsTableProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const rowsPerPage = 50;

  const filteredHoldings = useMemo(() => {
    let filtered = holdings;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (h) => h.name.toLowerCase().includes(q) || h.ticker.toLowerCase().includes(q)
      );
    }
    return filtered.sort((a, b) => b.weight - a.weight);
  }, [holdings, search]);

  const totalPages = Math.ceil(filteredHoldings.length / rowsPerPage);
  const currentHoldings = filteredHoldings.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return (
    <div className="space-y-4 mt-12 pt-8 border-t border-border">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h3 className="text-xl font-bold tracking-tight">
          All Holdings{' '}
          <span className="text-muted-foreground text-sm font-normal">
            ({filteredHoldings.length})
          </span>
        </h3>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t.deepDiveTab.searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="pl-9 w-full"
          />
        </div>
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[100px]">Ticker</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Sector</TableHead>
              <TableHead className="hidden sm:table-cell">Country</TableHead>
              <TableHead className="text-right">Weight</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentHoldings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  {t.deepDiveTab.noHoldingsFound} &quot{search}&quot
                </TableCell>
              </TableRow>
            ) : (
              currentHoldings.map((h, i) => {
                const canonSector = normalizeSector(String(h.sector || 'Unknown'));
                const translatedSector =
                  t.sectors[canonSector as keyof typeof t.sectors] || canonSector;

                const canonCountry = normalizeCountry(String(h.country || 'Unknown'));
                const translatedCountry =
                  t.countries[canonCountry as keyof typeof t.countries] || canonCountry;

                return (
                  <TableRow key={`${h.ticker}-${i}`} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs">{h.ticker}</TableCell>
                    <TableCell
                      className="font-medium max-w-[120px] sm:max-w-[200px] truncate"
                      title={h.name}
                    >
                      {h.name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {translatedSector}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      {translatedCountry}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      {h.weight.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 pt-2">
          <div className="text-sm text-muted-foreground mr-4">
            Page {page + 1} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
