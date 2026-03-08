import { useEffect, useState, useMemo } from "react";
import {
  faHandshake,
  faCoins,
  faFileContract,
  faHeartPulse,
  faHandHoldingHeart,
} from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";
import { useLang } from "../../../lib/i18n";
import { mitraDict, translate } from "../../../i18n/mitra";

// Shared Components
import { MitraPageHeader } from "../../../components/management/mitra/shared/MitraPageHeader";
import { formatIDR } from "../../../components/management/mitra/shared/MitraUtils";

// Dashboard Components
import { MitraStatCards } from "../../../components/management/mitra/dashboard/MitraStatCards";
import { MitraDonationTrendChart } from "../../../components/management/mitra/dashboard/MitraDonationTrendChart";
import { MitraAllocationPieChart } from "../../../components/management/mitra/dashboard/MitraAllocationPieChart";
import { MitraRecentDonations } from "../../../components/management/mitra/dashboard/MitraRecentDonations";
import { MitraRecentAllocations } from "../../../components/management/mitra/dashboard/MitraRecentAllocations";
import { useNavigate } from "react-router-dom";

interface MitraStats {
  total_donations: number;
  total_allocations: number;
  remaining_balance: number;
  donation_count: number;
  allocation_count: number;
  recent_donations: Array<{
    id: string;
    amount: number;
    status: string;
    created_at: string;
    donatur_name: string;
  }>;
  recent_allocations: Array<{
    id: string;
    amount: number;
    title: string;
    created_at: string;
    proof_path?: string;
  }>;
  monthly_donations?: Array<{
    label: string;
    amount: number;
  }>;
  weekly_donations?: Array<{
    label: string;
    amount: number;
  }>;
  allocation_distribution?: Array<{
    name: string;
    value: number;
  }>;
}

export function MitraDashboardPage() {
  const [data, setData] = useState<MitraStats | null>(null);
  const [filterType, setFilterType] = useState<"monthly" | "weekly">("monthly");
  const { locale } = useLang();
  const navigate = useNavigate();
  
  const t = (key: string, fallback?: string) => translate(mitraDict, locale, key, fallback);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await http.get("/mitra/dashboard");
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch mitra dashboard data", error);
      }
    };
    fetchData();
  }, []);

  const chartData = useMemo(() => {
    if (filterType === "weekly") {
      return data?.weekly_donations || [];
    }
    return data?.monthly_donations || [
      { label: "Jan", amount: 4500000 },
      { label: "Feb", amount: 5200000 },
      { label: "Mar", amount: 4800000 },
      { label: "Apr", amount: 6100000 },
      { label: "May", amount: 5500000 },
      { label: "Jun", amount: 6700000 },
    ];
  }, [data, filterType]);

  const distributionData = useMemo(() => {
    return data?.allocation_distribution || [
      { name: t("chart.education", "Pendidikan"), value: 40 },
      { name: t("chart.health", "Kesehatan"), value: 30 },
      { name: t("chart.social", "Sosial"), value: 20 },
      { name: t("chart.other", "Lainnya"), value: 10 },
    ];
  }, [data, locale, t]);

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#6366f1"];

  return (
    <div className="space-y-8 pb-12">
      <MitraPageHeader
        title={t("dashboard.title", "Ringkasan Mitra")}
        subtitle={t("dashboard.subtitle", "Pantau donasi dan alokasi dana secara real-time.")}
        actionButton={{
          label: t("dashboard.donate_button", "Donasi Sekarang"),
          onClick: () => navigate("/donate"),
          icon: faHandHoldingHeart,
        }}
      />

      <MitraStatCards
        stats={{
          total_donations: formatIDR(data?.total_donations || 0),
          total_allocations: formatIDR(data?.total_allocations || 0),
          remaining_balance: formatIDR(data?.remaining_balance || 0),
          donation_count: data?.donation_count || 0,
        }}
        icons={{ faHeartPulse, faHandshake, faCoins, faFileContract }}
        t={t}
        loading={!data}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MitraDonationTrendChart
            data={chartData}
            filterType={filterType}
            setFilterType={setFilterType}
            t={t}
          />
        </div>

        <div>
          <MitraAllocationPieChart
            data={distributionData}
            colors={COLORS}
            t={t}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <MitraRecentDonations
          donations={data?.recent_donations || []}
          locale={locale}
          t={t}
        />
        <MitraRecentAllocations
          allocations={data?.recent_allocations || []}
          locale={locale}
          t={t}
        />
      </div>
    </div>
  );
}
