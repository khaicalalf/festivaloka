import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getTransactionDetail } from "../api/transactions";
import type { TransactionDetail } from "../types";

export function TransactionResultPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const [data, setData] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uuid) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getTransactionDetail(uuid);
        setData(res);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Gagal memuat detail transaksi");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [uuid]);

  if (!uuid) {
    return <p>UUID tidak ditemukan.</p>;
  }

  if (loading) {
    return <p className="p-4 text-sm">Memuat status transaksi...</p>;
  }

  if (error) {
    return (
      <div className="p-4 space-y-2">
        <p className="text-red-600 text-sm">{error}</p>
        <Link to="/" className="text-sm underline">
          Kembali ke beranda
        </Link>
      </div>
    );
  }

  if (!data) return null;

  const { status, queueNumber, etaMinutes, tenantName, totalAmount } = data;

  let title = "";
  let description = "";

  if (status === "SUCCESS") {
    title = "Pembayaran Berhasil";
    description =
      "Pesananmu sudah tercatat, silakan tunggu sesuai nomor antrian.";
  } else if (status === "PROCESSING" || status === "PENDING") {
    title = "Transaksi Sedang Diproses";
    description =
      "Pembayaran sedang diverifikasi. Jika sudah selesai, halaman ini akan diperbarui.";
  } else if (status === "FAILED") {
    title = "Transaksi Gagal";
    description =
      "Pembayaranmu tidak berhasil. Kamu bisa mencoba lagi dari awal.";
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-4">
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="text-sm text-gray-600">{description}</p>

      <div className="border rounded-lg p-4 text-sm space-y-2">
        <p>
          <span className="font-semibold">ID Transaksi:</span> {data.uuid}
        </p>
        <p>
          <span className="font-semibold">Tenant:</span> {tenantName}
        </p>
        <p>
          <span className="font-semibold">Total:</span> Rp
          {totalAmount.toLocaleString("id-ID")}
        </p>
        <p>
          <span className="font-semibold">Status:</span> {status}
        </p>

        {queueNumber != null && (
          <p>
            <span className="font-semibold">Nomor Antrian:</span> {queueNumber}
          </p>
        )}

        {etaMinutes != null && (
          <p>
            <span className="font-semibold">Estimasi Selesai:</span> sekitar{" "}
            {etaMinutes} menit
          </p>
        )}
      </div>

      <Link
        to="/"
        className="inline-block text-sm bg-black text-white px-4 py-2 rounded"
      >
        Kembali ke Home
      </Link>
    </div>
  );
}
