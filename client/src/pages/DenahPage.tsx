import { useEffect, useState } from "react";
import type { Tenant } from "../types";
import { DenahCard } from "../components/denah/DenahCard";
import { Link } from "react-router-dom";

export function DenahPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          "https://festivaloka-dev.up.railway.app/api/tenants"
        );
        const data: Tenant[] = await res.json();

        // SORT BY STAND CODE
        const sorted = data.sort((a, b) => {
          const getCode = (str: string) =>
            str.match(/[A-Z]-\d+/)?.[0] ?? "Z-999";

          return getCode(a.address ?? "").localeCompare(
            getCode(b.address ?? "")
          );
        });

        setTenants(sorted);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FF385C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Memuat denah...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-2 border-gray-200 bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div>
              <h1 className="text-md font-medium md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <svg
                  className="w-5 h-5 md:w-7 md:h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                Denah Food Court
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {tenants.length} tenant tersedia
              </p>
            </div>
            <Link
              to="/"
              className="
                bg-[#FF385C] text-white px-6 py-3 rounded-lg font-semibold
                shadow-lg hover:bg-[#E31C5F] hover:shadow-xl
                transition-all transform hover:-translate-y-0.5
                flex items-center gap-2
              "
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Beranda
            </Link>
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tenants.map((t, index) => (
            <div
              key={t.id}
              style={{ animationDelay: `${index * 0.03}s` }}
              className="animate-fade-in"
            >
              <DenahCard tenant={t} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
