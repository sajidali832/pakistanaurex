"use client";

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

interface Company {
  id: number;
  name: string;
  nameUrdu: string | null;
  ntnNumber: string | null;
  strnNumber: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankIban: string | null;
  defaultCurrency: string;
  createdAt: string;
}

export function useCompany() {
  const { user, isLoaded } = useUser();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompany = useCallback(async () => {
    if (!user) {
      setCompany(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/user-company');

      if (!res.ok) {
        throw new Error('Failed to fetch company');
      }

      const data = await res.json();
      setCompany(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setCompany(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded) {
      fetchCompany();
    }
  }, [isLoaded, fetchCompany]);

  const refetch = useCallback(() => {
    fetchCompany();
  }, [fetchCompany]);

  return {
    company,
    companyId: company?.id || null,
    isLoading: !isLoaded || isLoading,
    error,
    refetch,
  };
}
