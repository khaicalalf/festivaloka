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

        // SORT BY STAND CODE → Example: "Stand D-03" jadi "D-03"
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
    return <p className="text-center mt-10 animate-pulse">Memuat denah...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Denah Food Court</h1>
        <Link
          to="/"
          className="block text-center bg-black text-white py-4 px-4 rounded-xl shadow-md hover:bg-neutral-900 transition-all duration-200 animate-slide-up"
        >
          Homepage
        </Link>
      </div>

      {/* GRID 2 KOLOM */}
      <div className="grid grid-cols-2 gap-8 mx-4 my-6">
        {tenants.map((t) => (
          <DenahCard key={t.id} tenant={t} />
        ))}
      </div>
    </div>
  );
}
