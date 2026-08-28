import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

type AdminAllocationHeaderProps = {
    total: number;
};

export default function AdminAllocationHeader({
    total,
}: AdminAllocationHeaderProps) {
    return (
        <div className="relative overflow-hidden rounded-[32px] bg-slate-900 shadow-2xl">
            <div className="absolute inset-0 bg-brandGreen-600" />
            <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full" />
            <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full" />

            <div className="relative z-10 p-8 md:p-12">
                <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-4">
                        <div>
                            <h1 className="font-heading text-3xl font-bold text-white md:text-5xl text-shadow-sm">
                                Penyaluran Mitra
                            </h1>
                            <p className="mt-2 max-w-2xl text-lg font-medium text-emerald-100/90">
                                Monitoring penggunaan dana dompet mitra secara
                                transparan.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-5 items-start md:items-end">
                        <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-emerald-50 backdrop-blur-sm shadow-sm ring-1 ring-white/15">
                            Total Penyaluran
                            <span className="font-bold text-white ml-1">
                                {new Intl.NumberFormat("id-ID").format(total)}
                            </span>
                        </span>

                        <Link
                            to="/admin/allocations/create"
                            className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 text-sm font-bold text-emerald-600 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl"
                        >
                            <FontAwesomeIcon
                                icon={faPlus}
                                className="bg-emerald-100/50 p-1.5 rounded-full text-xs"
                            />
                            Buat Penyaluran Baru
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
