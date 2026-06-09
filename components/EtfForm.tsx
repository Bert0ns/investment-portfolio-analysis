'use client';

import { useState } from 'react';
import { Issuer, EtfConfig } from '../lib/types';
import { getCsvParser } from '../lib/parsers';

interface EtfFormProps {
  onAddEtf: (etf: EtfConfig) => void;
}

export default function EtfForm({ onAddEtf }: EtfFormProps) {
  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState<Issuer>('iShares');
  const [ter, setTer] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !ter || !file) {
      setError('Please fill all fields and upload a CSV file.');
      return;
    }

    const terNumber = parseFloat(ter);
    if (isNaN(terNumber) || terNumber < 0) {
      setError('Please enter a valid TER (e.g., 0.22)');
      return;
    }

    setIsLoading(true);

    try {
      const parser = getCsvParser(issuer);
      const result = await parser.parse(file);

      if (result.errors.length > 0 && result.holdings.length === 0) {
        setError(`Failed to parse CSV: ${result.errors[0]}`);
        setIsLoading(false);
        return;
      }

      if (result.holdings.length === 0) {
        setError('No valid holdings found in the CSV. Please check the file format.');
        setIsLoading(false);
        return;
      }

      const newEtf: EtfConfig = {
        id: Math.random().toString(36).substring(7),
        name,
        issuer,
        ter: terNumber,
        globalWeight: 0, // Starts at 0, user adjusts later
        holdings: result.holdings,
      };

      onAddEtf(newEtf);

      // Reset form
      setName('');
      setTer('');
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while parsing the CSV.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New ETF</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ETF Name / Ticker</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., S&P 500 Information Technology"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issuer</label>
            <select
              value={issuer}
              onChange={(e) => setIssuer(e.target.value as Issuer)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
            >
              <option value="iShares">iShares</option>
              <option value="Vanguard">Vanguard</option>
              <option value="Amundi">Amundi</option>
              <option value="Lyxor">Lyxor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">TER (%)</label>
            <input
              type="number"
              step="0.01"
              value={ter}
              onChange={(e) => setTer(e.target.value)}
              placeholder="e.g., 0.22"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Holdings CSV File</label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Add ETF'}
        </button>
      </form>
    </div>
  );
}
