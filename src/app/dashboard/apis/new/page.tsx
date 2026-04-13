'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  CheckCircle,
  Globe,
  Server,
  Eye,
  EyeOff,
  Shield,
  Tag,
} from 'lucide-react';

export default function AddApiPage() {
  const [saved, setSaved] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [listOnMarketplace, setListOnMarketplace] = useState(false);

  const [form, setForm] = useState({
    name: '',
    url: '',
    method: 'GET',
    headers: '{}',
    authToken: '',
    checkInterval: '300',
    category: 'REST',
    description: '',
    slug: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // Validate required fields
    if (!form.name.trim() || !form.url.trim()) return;

    // Validate headers JSON if provided
    if (form.headers.trim() && form.headers.trim() !== '{}') {
      try {
        JSON.parse(form.headers);
      } catch {
        return;
      }
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-secondary)',
    borderColor: 'var(--border)',
    color: 'var(--text-primary)',
  };

  const labelStyle: React.CSSProperties = {
    color: 'var(--text-secondary)',
  };

  const methods = ['GET', 'POST', 'PUT', 'DELETE'];
  const intervals = [
    { label: '30 seconds', value: '30' },
    { label: '1 minute', value: '60' },
    { label: '5 minutes', value: '300' },
    { label: '10 minutes', value: '600' },
    { label: '30 minutes', value: '1800' },
  ];
  const categories = [
    'REST',
    'AI',
    'Payment',
    'Crypto',
    'Infrastructure',
    'Auth',
    'Email',
    'Database',
    'Communication',
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-4 transition-colors hover:opacity-80"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Add New API
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Configure a new API endpoint for monitoring
        </p>
      </div>

      {/* Form */}
      <div
        className="rounded-xl border p-5 sm:p-6"
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1.5" style={labelStyle}>
              <span className="flex items-center gap-1.5">
                <Server size={14} />
                API Name <span style={{ color: 'var(--error)' }}>*</span>
              </span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Stripe Payments API"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--accent)]/40"
              style={inputStyle}
            />
          </div>

          {/* URL + Method */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-1">
              <label htmlFor="method" className="block text-sm font-medium mb-1.5" style={labelStyle}>
                Method
              </label>
              <select
                id="method"
                name="method"
                value={form.method}
                onChange={handleChange}
                className="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--accent)]/40"
                style={inputStyle}
              >
                {methods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="url" className="block text-sm font-medium mb-1.5" style={labelStyle}>
                API URL <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                id="url"
                name="url"
                type="text"
                placeholder="https://api.example.com/v1/health"
                value={form.url}
                onChange={handleChange}
                className="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--accent)]/40 font-mono"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Headers */}
          <div>
            <label htmlFor="headers" className="block text-sm font-medium mb-1.5" style={labelStyle}>
              Custom Headers
              <span className="ml-1.5 text-xs font-normal" style={{ color: 'var(--text-tertiary)' }}>
                (JSON format)
              </span>
            </label>
            <textarea
              id="headers"
              name="headers"
              rows={3}
              placeholder='{"X-Custom-Header": "value"}'
              value={form.headers}
              onChange={handleChange}
              className="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--accent)]/40 resize-none font-mono"
              style={inputStyle}
            />
          </div>

          {/* Auth Token */}
          <div>
            <label htmlFor="authToken" className="block text-sm font-medium mb-1.5" style={labelStyle}>
              <span className="flex items-center gap-1.5">
                <Shield size={14} />
                Auth Token
              </span>
            </label>
            <div className="relative">
              <input
                id="authToken"
                name="authToken"
                type={showToken ? 'text' : 'password'}
                placeholder="Bearer token or API key"
                value={form.authToken}
                onChange={handleChange}
                className="w-full rounded-lg border px-3.5 py-2.5 pr-10 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--accent)]/40 font-mono"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors hover:opacity-70"
                style={{ color: 'var(--text-tertiary)' }}
                aria-label={showToken ? 'Hide token' : 'Show token'}
              >
                {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Check Interval + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="checkInterval" className="block text-sm font-medium mb-1.5" style={labelStyle}>
                Check Interval
              </label>
              <select
                id="checkInterval"
                name="checkInterval"
                value={form.checkInterval}
                onChange={handleChange}
                className="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--accent)]/40"
                style={inputStyle}
              >
                {intervals.map((i) => (
                  <option key={i.value} value={i.value}>
                    {i.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1.5" style={labelStyle}>
                <span className="flex items-center gap-1.5">
                  <Tag size={14} />
                  Category
                </span>
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--accent)]/40"
                style={inputStyle}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t pt-5" style={{ borderColor: 'var(--border)' }}>
            {/* Marketplace Toggle */}
            <div
              className="flex items-center justify-between rounded-lg border p-4 cursor-pointer transition-colors hover:bg-white/[0.02]"
              style={{
                borderColor: listOnMarketplace ? 'var(--accent)' : 'var(--border)',
                background: listOnMarketplace ? 'rgba(59,130,246,0.05)' : 'transparent',
              }}
              onClick={() => setListOnMarketplace(!listOnMarketplace)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setListOnMarketplace(!listOnMarketplace);
                }
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{
                    background: listOnMarketplace ? 'rgba(59,130,246,0.15)' : 'var(--bg-secondary)',
                    color: listOnMarketplace ? 'var(--accent)' : 'var(--text-tertiary)',
                    width: 36,
                    height: 36,
                  }}
                >
                  <Globe size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    List on Marketplace
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    Share your API health publicly
                  </p>
                </div>
              </div>
              <div
                className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
                style={{
                  background: listOnMarketplace ? 'var(--accent)' : 'var(--bg-primary)',
                  border: `1px solid ${listOnMarketplace ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
                  style={{
                    background: 'var(--text-primary)',
                    left: listOnMarketplace ? '22px' : '2px',
                  }}
                />
              </div>
            </div>

            {/* Marketplace fields */}
            {listOnMarketplace && (
              <div className="mt-4 space-y-4 pl-0 sm:pl-12">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1.5" style={labelStyle}>
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    placeholder="Describe what your API does..."
                    value={form.description}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--accent)]/40 resize-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label htmlFor="slug" className="block text-sm font-medium mb-1.5" style={labelStyle}>
                    URL Slug
                    <span className="ml-1.5 text-xs font-normal" style={{ color: 'var(--text-tertiary)' }}>
                      (marketplace/your-slug)
                    </span>
                  </label>
                  <input
                    id="slug"
                    name="slug"
                    type="text"
                    placeholder="my-awesome-api"
                    value={form.slug}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--accent)]/40 font-mono"
                    style={inputStyle}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saved}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all ${
                saved ? 'opacity-80 cursor-default' : 'hover:opacity-90'
              }`}
              style={{
                background: saved ? 'var(--success)' : 'var(--accent)',
              }}
            >
              {saved ? (
                <>
                  <CheckCircle size={16} />
                  API added!
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Save API
                </>
              )}
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors hover:bg-white/5"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
