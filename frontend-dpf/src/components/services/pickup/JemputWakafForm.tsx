import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faLocationDot, faBoxOpen, faHeadset, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { InputField, PhoneInputField, SelectField } from "../shared/ServiceUI";
import http from "../../../lib/http";

type JemputWakafFormProps = {
  translate: (key: string, fallback?: string) => string;
  locale: string;
};

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

export function JemputWakafForm({ translate: t, locale }: JemputWakafFormProps) {
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
  const [programs, setPrograms] = useState<{ id: number; title: string; title_en?: string | null }[]>([]);
  const [customWakaf, setCustomWakaf] = useState("");
  const [estimationUnit, setEstimationUnit] = useState("Kg");

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

    return () => { active = false; };
  }, [selectedCityId]);

  useEffect(() => {
    http.get<{ data: { id: number; title: string; title_en?: string | null }[] }>("/programs?per_page=100")
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
    if (value !== "Lainnya") setCustomWakaf("");
  };

  const validate = () => {
    const alphaSpace = /^[A-Za-z\s]+$/;
    const next: { [k: string]: string } = {};

    if (!form.donor_name.trim()) next.donor_name = "jemput.form.error.name.required";
    else if (!alphaSpace.test(form.donor_name.trim())) next.donor_name = "jemput.form.error.name.alpha";

    if (!form.donor_phone.trim()) next.donor_phone = "jemput.form.error.phone.required";
    else if (form.donor_phone.trim().length < 8) next.donor_phone = "jemput.form.error.phone.numeric";

    if (!form.address_full.trim()) next.address_full = "jemput.form.error.address.required";
    if (!form.city.trim()) next.city = "jemput.form.error.city.required";
    if (!form.district.trim()) next.district = "jemput.form.error.district.required";
    if (!form.wakaf_type.trim()) next.wakaf_type = "jemput.form.error.wakaf.required";

    if (form.estimation.trim() && !/^[0-9.,\s]+$/.test(form.estimation)) {
        next.estimation = "jemput.form.error.estimation.numeric";
    }

    if (form.preferred_time.trim() && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(form.preferred_time)) {
       next.preferred_time = "jemput.form.error.time.invalid";
    }

    return { ok: Object.keys(next).length === 0, errors: next };
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
    <div className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr] lg:items-start">
      <div className="lg:sticky lg:top-[120px] lg:self-start rounded-[24px] border border-slate-100 bg-gradient-to-br from-brandGreen-600 to-primary-600 p-8 text-white shadow-[0_28px_80px_-50px_rgba(16,185,129,0.6)] h-fit">
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
              <InputField label={t("jemput.form.fields.name")} value={form.donor_name} onChange={(v: string) => handleChange("donor_name", v)} required error={errors.donor_name ? t(errors.donor_name) : ""} />
              <PhoneInputField
                label={t("jemput.form.fields.phone")}
                value={form.donor_phone}
                onChange={(v: string | undefined) => handleChange("donor_phone", v || "")}
                disabled={submitting}
                error={errors.donor_phone ? t(errors.donor_phone) : ""}
                required
              />
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
            <InputField label={t("jemput.form.fields.address")} value={form.address_full} onChange={(v: string) => handleChange("address_full", v)} required error={errors.address_full ? t(errors.address_full) : ""} />
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label={t("jemput.form.fields.city")}
                value={selectedCityId}
                onChange={handleCitySelect}
                required
                error={errors.city ? t(errors.city) : ""}
                options={JABODETABEK_CITIES.map(c => ({ value: c.id, label: c.label }))}
                placeholder={t("jemput.form.fields.city")}
              />
              <SelectField
                label={t("jemput.form.fields.district")}
                value={form.district}
                onChange={(v: string) => handleChange("district", v)}
                required
                disabled={!selectedCityId || districtLoading}
                error={errors.district ? t(errors.district) : ""}
                options={districts.map(d => ({ value: d.name, label: d.name }))}
                placeholder={districtLoading ? "Memuat kecamatan..." : t("jemput.form.fields.district")}
                loading={districtLoading}
              />
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
              <SelectField
                label={t("jemput.form.fields.wakaf")}
                value={form.wakaf_type}
                onChange={handleWakafTypeChange}
                required
                error={errors.wakaf_type ? t(errors.wakaf_type) : ""}
                options={[
                  ...programs.map(p => ({ value: pickLocale(p.title, p.title_en), label: pickLocale(p.title, p.title_en) })),
                  { value: "Lainnya", label: locale === "en" ? "Other" : "Lainnya" }
                ]}
                placeholder={t("jemput.form.fields.wakaf")}
              />

              <label className="space-y-1 text-sm font-medium text-slate-700">
                <span className="font-bold">{t("jemput.form.fields.estimation")}</span>
                <div className="group flex rounded-xl border border-slate-200 bg-white shadow-sm transition focus-within:border-primary-200 focus-within:ring-2 focus-within:ring-primary-100 overflow-hidden">
                  <input
                    value={form.estimation}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^[0-9.,\s]*$/.test(v)) handleChange("estimation", v);
                    }}
                    className="w-full flex-1 border-none bg-transparent px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:ring-0"
                    placeholder="0"
                  />
                  <div className="w-px bg-slate-100 my-1" />
                  <select
                    value={estimationUnit}
                    onChange={(e) => setEstimationUnit(e.target.value)}
                    className="w-24 border-none bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 focus:bg-white focus:ring-0 cursor-pointer"
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
                onChange={(v: string) => setCustomWakaf(v)}
                required
              />
            )}

            <InputField
              label={t("jemput.form.fields.time")}
              value={form.preferred_time}
              onChange={(v: string) => handleChange("preferred_time", v)}
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FontAwesomeIcon icon={faPaperPlane} />
            {submitting ? t("jemput.form.submit.sending") : t("jemput.form.submit.label")}
          </button>
        </form>
      </div>
    </div>
  );
}
