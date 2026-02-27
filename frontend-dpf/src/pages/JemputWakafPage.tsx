import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBoxOpen,
  faCalendarCheck,
  faCheckCircle,
  faClipboardCheck,
  faClock,
  faHandHoldingHeart,
  faHeadset,
  faLocationDot,
  faMapMarkedAlt,
  faPaperPlane,
  faShieldHalved,
  faTruckRampBox,
} from "@fortawesome/free-solid-svg-icons";
import { LandingLayout } from "../layouts/LandingLayout";
import { PageHero } from "../components/PageHero";
import http from "../lib/http";
import PhoneInput from "../components/ui/PhoneInput";
import { useLang } from "../lib/i18n";
import { landingDict, translate as translateLanding } from "../i18n/landing";

const BENEFITS = [
  { titleKey: "jemput.benefits.1.title", descKey: "jemput.benefits.1.desc", icon: faShieldHalved },
  { titleKey: "jemput.benefits.2.title", descKey: "jemput.benefits.2.desc", icon: faClock },
  { titleKey: "jemput.benefits.3.title", descKey: "jemput.benefits.3.desc", icon: faMapMarkedAlt },
  { titleKey: "jemput.benefits.4.title", descKey: "jemput.benefits.4.desc", icon: faClipboardCheck },
];

const STEPS = [
  { titleKey: "jemput.steps.1.title", descKey: "jemput.steps.1.desc", icon: faTruckRampBox },
  { titleKey: "jemput.steps.2.title", descKey: "jemput.steps.2.desc", icon: faCalendarCheck },
  { titleKey: "jemput.steps.3.title", descKey: "jemput.steps.3.desc", icon: faHandHoldingHeart },
  { titleKey: "jemput.steps.4.title", descKey: "jemput.steps.4.desc", icon: faPaperPlane },
];

const JABODETABEK_CITIES = [
  { id: "3101", label: "Kabupaten Kepulauan Seribu" },
  { id: "3171", label: "Kota Jakarta Selatan" },
  { id: "3172", label: "Kota Jakarta Timur" },
  { id: "3173", label: "Kota Jakarta Pusat" },
  { id: "3174", label: "Kota Jakarta Barat" },
  { id: "3175", label: "Kota Jakarta Utara" },
  { id: "3201", label: "Kabupaten Bogor" },
  { id: "3271", label: "Kota Bogor" },
  { id: "3275", label: "Kota Bekasi" },
  { id: "3276", label: "Kota Depok" },
  { id: "3216", label: "Kabupaten Bekasi" },
  { id: "3603", label: "Kabupaten Tangerang" },
  { id: "3671", label: "Kota Tangerang" },
  { id: "3674", label: "Kota Tangerang Selatan" },
];

type DistrictOption = {
  id: string;
  name: string;
};

export function JemputWakafPage() {
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translateLanding(landingDict, locale, key, fallback);
  const [form, setForm] = useState({
    donor_name: "",
    donor_phone: "",
    address_full: "",
    city: "",
    district: "",
    wakaf_type: "",
    estimation: "",
    preferred_time: "",
  });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string | null }>({
    type: null,
    message: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [districtLoading, setDistrictLoading] = useState(false);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setStatus({ type: null, message: null });
  };

  const handleCitySelect = (cityId: string) => {
    const city = JABODETABEK_CITIES.find((item) => item.id === cityId);
    setSelectedCityId(cityId);
    setForm((prev) => ({
      ...prev,
      city: city?.label ?? "",
      district: "",
    }));
    setErrors((prev) => ({ ...prev, city: "", district: "" }));
    setStatus({ type: null, message: null });
  };

  useEffect(() => {
    let active = true;
    if (!selectedCityId) {
      setDistricts([]);
      setDistrictLoading(false);
      return;
    }

    setDistrictLoading(true);
    fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${selectedCityId}.json`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load districts"))))
      .then((data: DistrictOption[]) => {
        if (!active) return;
        setDistricts(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!active) return;
        setDistricts([]);
      })
      .finally(() => {
        if (active) setDistrictLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedCityId]);

  const validate = () => {
    const alphaSpace = /^[A-Za-z\s]+$/;
    const next: { [k: string]: string } = {};

    if (!form.donor_name.trim()) next.donor_name = "jemput.form.error.name.required";
    else if (!alphaSpace.test(form.donor_name.trim())) next.donor_name = "jemput.form.error.name.alpha";

    if (!form.donor_phone.trim()) next.donor_phone = "jemput.form.error.phone.required";
    else if (form.donor_phone.trim().length < 8) next.donor_phone = "jemput.form.error.phone.numeric";

    if (!form.address_full.trim()) next.address_full = "jemput.form.error.address.required";

    if (!form.city.trim()) next.city = "jemput.form.error.city.required";
    else if (!alphaSpace.test(form.city.trim())) next.city = "jemput.form.error.city.alpha";

    if (!form.district.trim()) next.district = "jemput.form.error.district.required";
    else if (!alphaSpace.test(form.district.trim())) next.district = "jemput.form.error.district.alpha";

    if (!form.wakaf_type.trim()) next.wakaf_type = "jemput.form.error.wakaf.required";

    if (form.estimation.trim() && !/^[0-9.,\s]+$/.test(form.estimation)) {
        next.estimation = "jemput.form.error.estimation.numeric";
    }

    // Since we use type="time", browser validation handles most, but we can add check if needed.
    // However, user asked for validation "validasi yang benar".
    // If browser support isn't perfect, we check regex.
    if (form.preferred_time.trim() && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(form.preferred_time)) {
       next.preferred_time = "jemput.form.error.time.invalid";
    }

    return { ok: Object.keys(next).length === 0, errors: next };
  };

  const [programs, setPrograms] = useState<{ id: number; title: string; title_en?: string | null }[]>([]);
  const [customWakaf, setCustomWakaf] = useState("");
  const [estimationUnit, setEstimationUnit] = useState("Kg");

  useEffect(() => {
    http.get<{ data: { id: number; title: string; title_en?: string | null }[] }>("/programs")
      .then((res) => setPrograms(res.data.data || []))
      .catch(() => setPrograms([]));
  }, []);

  const pickLocale = (idVal?: string | null, enVal?: string | null) => {
    const idText = (idVal ?? "").trim();
    const enText = (enVal ?? "").trim();
    if (locale === "en") return enText || idText;
    return idText || enText;
  };

  const handleWakafTypeChange = (value: string) => {
    handleChange("wakaf_type", value);
    if (value !== "Lainnya") {
      setCustomWakaf("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (!v.ok) {
      setErrors(v.errors);
      setStatus({ type: "error", message: t("jemput.form.submit.error") });
      return;
    }
    setSubmitting(true);
    setStatus({ type: null, message: null });
    try {
      await http.post("/pickups", {
        donor_name: form.donor_name,
        donor_phone: form.donor_phone,
        address_full: form.address_full,
        city: form.city,
        district: form.district,
        zakat_type: form.wakaf_type === "Lainnya" ? customWakaf : form.wakaf_type,
        estimation: form.estimation ? `${form.estimation} ${estimationUnit}` : undefined,
        preferred_time: form.preferred_time || undefined,
      });
      setStatus({ type: "success", message: t("jemput.form.submit.success") });
      setForm({
        donor_name: "",
        donor_phone: "",
        address_full: "",
        city: "",
        district: "",
        wakaf_type: "",
        estimation: "",
        preferred_time: "",
      });
      setCustomWakaf("");
      setEstimationUnit("Kg");
    } catch {
      setStatus({ type: "error", message: t("jemput.form.submit.error") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LandingLayout footerWaveBgClassName="bg-slate-50">
      {/* HERO */}
      <PageHero
        fullHeight={true}
        badge={t("jemput.hero.badge")}
        title={
          <>
            {t("jemput.hero.title.leading")}{" "}
            <span className="text-primary-500">{t("jemput.hero.title.highlight")}</span>{" "}
            {t("jemput.hero.title.trailing")}
          </>
        }
        subtitle={t("jemput.hero.subtitle")}
        breadcrumb={[
          { label: t("landing.navbar.services", "Layanan"), href: "/layanan" },
          { label: t("landing.navbar.pickup", "Jemput Wakaf") }
        ]}
        rightElement={
          <div className="rounded-[40px] border border-white/60 bg-white/60 p-8 shadow-[0_30px_90px_-50px_rgba(0,0,0,0.3)] backdrop-blur-md">
            <div className="flex items-center gap-4 rounded-3xl bg-gradient-to-r from-brandGreen-600 to-primary-600 px-6 py-5 text-white shadow-xl shadow-brandGreen-900/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-sm">
                <FontAwesomeIcon icon={faShieldHalved} className="text-xl" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">{t("jemput.hero.trust.badge")}</p>
                <p className="text-lg font-heading font-bold leading-tight">{t("jemput.hero.trust.title")}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InfoPill icon={faClock} label={t("jemput.hero.pills.1")} />
              <InfoPill icon={faCheckCircle} label={t("jemput.hero.pills.2")} />
              <InfoPill icon={faLocationDot} label={t("jemput.hero.pills.3")} />
              <InfoPill icon={faClipboardCheck} label={t("jemput.hero.pills.4")} />
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="#form-jemput"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:-translate-y-0.5 hover:bg-primary-700"
          >
            <FontAwesomeIcon icon={faTruckRampBox} />
            {t("jemput.hero.cta.submit")}
          </a>
          <a
            href="#alur-jemput"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-200 bg-white px-6 py-3 text-sm font-semibold text-primary-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-50"
          >
            <FontAwesomeIcon icon={faArrowRight} />
            {t("jemput.hero.cta.flow")}
          </a>
        </div>
      </PageHero>

      {/* BENEFITS */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-primary-700 shadow-sm">
              {t("jemput.benefits.badge")}
            </p>
            <h2 className="text-3xl font-heading font-semibold text-slate-900 sm:text-4xl">{t("jemput.benefits.heading")}</h2>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto">
              {t("jemput.benefits.subtitle")}
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
            {BENEFITS.map((item) => (
              <div key={item.titleKey} className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.35)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-700 shadow-sm">
                  <FontAwesomeIcon icon={item.icon} />
                </div>
                <h3 className="mt-3 text-lg font-heading font-semibold text-slate-900">{t(item.titleKey)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{t(item.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ALUR */}
      <section id="alur-jemput" className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                <FontAwesomeIcon icon={faTruckRampBox} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-700">{t("jemput.steps.badge")}</p>
                <h2 className="text-2xl font-heading font-semibold text-slate-900">{t("jemput.steps.heading")}</h2>
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
            {STEPS.map((step, idx) => (
              <div
                key={step.titleKey}
                className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_18px_45px_-30px_rgba(0,0,0,0.4)] transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brandGreen-50 text-brandGreen-700">
                    <FontAwesomeIcon icon={step.icon} />
                  </div>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white shadow-sm">
                    {idx + 1}
                  </span>
                </div>
                <h3 className="text-lg font-heading font-semibold text-slate-900">{t(step.titleKey)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{t(step.descKey)}</p>
                {idx < STEPS.length - 1 && (
                  <div className="pointer-events-none absolute inset-y-0 right-2 hidden w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section id="form-jemput" className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
            <div className="rounded-[24px] border border-slate-100 bg-gradient-to-br from-brandGreen-600 to-primary-600 p-8 text-white shadow-[0_28px_80px_-50px_rgba(16,185,129,0.6)]">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-50">{t("jemput.form.badge")}</p>
              <h3 className="mt-3 text-3xl font-heading font-semibold leading-tight">{t("jemput.form.heading")}</h3>
              <ul className="mt-6 space-y-3 text-sm leading-relaxed text-emerald-50">
                <li className="flex gap-3">
                  <FontAwesomeIcon icon={faClock} />
                  {t("jemput.form.points.1")}
                </li>
                <li className="flex gap-3">
                  <FontAwesomeIcon icon={faLocationDot} />
                  {t("jemput.form.points.2")}
                </li>
                <li className="flex gap-3">
                  <FontAwesomeIcon icon={faBoxOpen} />
                  {t("jemput.form.points.3")}
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-900 shadow-sm">
                <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100">
                  <FontAwesomeIcon icon={faHeadset} />
                </span>
                <p className="leading-relaxed">
                  Untuk layanan jemput wakaf di luar wilayah Jabodetabek, kami dengan senang hati melayani melalui nomor{" "}
                  <a
                    href="https://wa.me/6281311768254?text=Halo%20DPF%2C%20saya%20ingin%20bertanya%20mengenai%20layanan%20jemput%20wakaf%20di%20luar%20Jabodetabek."
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    081311768254
                  </a>
                  .
                </p>
              </div>
            <form onSubmit={handleSubmit} className="relative space-y-8 rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_22px_70px_-45px_rgba(0,0,0,0.35)] sm:p-8">
              
              {/* SECTION: DATA DONATUR */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                     <FontAwesomeIcon icon={faHeadset} className="text-sm" />
                  </div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    {locale === "en" ? "Donor Details" : "Data Donatur"}
                  </h4>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField label={t("jemput.form.fields.name")} value={form.donor_name} onChange={(v) => handleChange("donor_name", v)} required error={errors.donor_name ? t(errors.donor_name) : ""} />
                  <label className="space-y-1 text-sm font-medium text-slate-700">
                    <span>{t("jemput.form.fields.phone")}</span>
                    <PhoneInput
                      value={form.donor_phone}
                      onChange={(v) => handleChange("donor_phone", v || "")}
                      disabled={submitting}
                    />
                    {errors.donor_phone && <span className="text-xs font-semibold text-red-600">{t(errors.donor_phone)}</span>}
                  </label>
                </div>
              </div>

              {/* SECTION: LOKASI */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                     <FontAwesomeIcon icon={faLocationDot} className="text-sm" />
                  </div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    {locale === "en" ? "Pickup Location" : "Lokasi Penjemputan"}
                  </h4>
                </div>
                <InputField label={t("jemput.form.fields.address")} value={form.address_full} onChange={(v) => handleChange("address_full", v)} required error={errors.address_full ? t(errors.address_full) : ""} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-sm font-medium text-slate-700">
                    <span>{t("jemput.form.fields.city")}</span>
                    <select
                      value={selectedCityId}
                      onChange={(e) => handleCitySelect(e.target.value)}
                      required
                      className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:outline-none focus:ring-2 ${
                        errors.city
                          ? "border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-100"
                          : "border-slate-200 bg-white focus:border-primary-200 focus:ring-primary-100"
                      }`}
                    >
                      <option value="">{t("jemput.form.fields.city")}</option>
                      {JABODETABEK_CITIES.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.label}
                        </option>
                      ))}
                    </select>
                    {errors.city && <span className="text-xs font-semibold text-red-600">{t(errors.city)}</span>}
                  </label>
                  <label className="space-y-1 text-sm font-medium text-slate-700">
                    <span>{t("jemput.form.fields.district")}</span>
                    <select
                      value={form.district}
                      onChange={(e) => handleChange("district", e.target.value)}
                      required
                      disabled={!selectedCityId || districtLoading}
                      className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:outline-none focus:ring-2 ${
                        errors.district
                          ? "border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-100"
                          : "border-slate-200 bg-white focus:border-primary-200 focus:ring-primary-100"
                      } ${!selectedCityId || districtLoading ? "bg-slate-100 text-slate-400" : ""}`}
                    >
                      <option value="">
                        {districtLoading ? "Memuat kecamatan..." : t("jemput.form.fields.district")}
                      </option>
                      {districts.map((district) => (
                        <option key={district.id} value={district.name}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                    {errors.district && <span className="text-xs font-semibold text-red-600">{t(errors.district)}</span>}
                  </label>
                </div>
              </div>

              {/* SECTION: DETAIL WAKAF */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                     <FontAwesomeIcon icon={faBoxOpen} className="text-sm" />
                  </div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    {locale === "en" ? "Item Details" : "Detail Barang Wakaf"}
                  </h4>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-sm font-medium text-slate-700">
                    <span>{t("jemput.form.fields.wakaf")}</span>
                    <select
                      value={form.wakaf_type}
                      onChange={(e) => handleWakafTypeChange(e.target.value)}
                      required
                      className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:outline-none focus:ring-2 ${
                        errors.wakaf_type
                          ? "border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-100"
                          : "border-slate-200 bg-white focus:border-primary-200 focus:ring-primary-100"
                      }`}
                    >
                      <option value="">{t("jemput.form.fields.wakaf")}</option>
                      {programs.map((p) => (
                        <option key={p.id} value={pickLocale(p.title, p.title_en)}>{pickLocale(p.title, p.title_en)}</option>
                      ))}
                      <option value="Lainnya">{locale === "en" ? "Other" : "Lainnya"}</option>
                    </select>
                    {errors.wakaf_type && <span className="text-xs font-semibold text-red-600">{t(errors.wakaf_type)}</span>}
                  </label>

                  <label className="space-y-1 text-sm font-medium text-slate-700">
                    <span>{t("jemput.form.fields.estimation")}</span>
                    <div className="group flex rounded-xl border border-slate-200 bg-white shadow-sm transition focus-within:border-primary-200 focus-within:ring-2 focus-within:ring-primary-100">
                      <input
                        value={form.estimation}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (/^[0-9.,\s]*$/.test(v)) handleChange("estimation", v);
                        }}
                        className="w-full flex-1 rounded-l-xl border-none bg-transparent px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:ring-0"
                        placeholder="0"
                      />
                      <div className="mr-0.5 my-1 w-px bg-slate-100" />
                      <select
                        value={estimationUnit}
                        onChange={(e) => setEstimationUnit(e.target.value)}
                        className="w-24 rounded-r-xl border-none bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 focus:bg-white focus:ring-0"
                      >
                        <option value="Kg">Kg</option>
                        <option value="Box">Box</option>
                        <option value="Pcs">Pcs</option>
                        <option value="Unit">Unit</option>
                        <option value="Jam">Jam</option>
                      </select>
                    </div>
                    {errors.estimation && <span className="text-xs font-semibold text-red-600">{t(errors.estimation)}</span>}
                  </label>
                </div>

                {form.wakaf_type === "Lainnya" && (
                  <InputField
                    label={locale === "en" ? "Specify Other Wakaf" : "Tuliskan Jenis Wakaf Lainnya"}
                    value={customWakaf}
                    onChange={(v) => setCustomWakaf(v)}
                    required
                  />
                )}

                <InputField
                  label={t("jemput.form.fields.time")}
                  value={form.preferred_time}
                  onChange={(v) => handleChange("preferred_time", v)}
                  type="time"
                  error={errors.preferred_time ? t(errors.preferred_time) : ""}
                />
              </div>

              {status.message && (
                <div
                  className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                    status.type === "success"
                      ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                      : "border border-red-100 bg-red-50 text-red-700"
                  }`}
                >
                  {status.message}
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                {submitting ? t("jemput.form.submit.sending") : t("jemput.form.submit.label")}
              </button>
            </form>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}

function InfoPill({ icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
        <FontAwesomeIcon icon={icon} className="text-lg" />
      </div>
      <span className="font-semibold text-slate-800 leading-tight">{label}</span>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  required,
  error,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  error?: string;
  type?: string;
}) {
  const base =
    "w-full rounded-xl border px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:outline-none focus:ring-2";
  const state = error
    ? "border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-100"
    : "border-slate-200 bg-white focus:border-primary-200 focus:ring-primary-100";
  return (
    <label className="space-y-1 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`${base} ${state}`}
      />
      {error && <span className="text-xs font-semibold text-red-600">{error}</span>}
    </label>
  );
}

export default JemputWakafPage;
