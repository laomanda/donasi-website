import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

type Props = {
  onCreate: () => void;
};

export default function EditorTagsHeader({ onCreate }: Props) {
  return (
    <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-400 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">Tags</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Kelola daftar tag website yang tampil pada footer dan filter konten.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-brandGreen-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-700"
        >
          <FontAwesomeIcon icon={faPlus} />
          Tambah Tag
        </button>
      </div>
    </div>
  );
}
