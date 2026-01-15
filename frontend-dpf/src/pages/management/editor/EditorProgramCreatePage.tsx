import { EditorProgramForm } from "./EditorProgramForm";

export function EditorProgramCreatePage() {
  return (
    <div className="relative min-h-screen bg-slate-50">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-brandGreen-100/40 blur-[90px]" />
        <div className="absolute bottom-0 left-[-10%] h-72 w-72 rounded-full bg-primary-100/50 blur-[110px]" />
      </div>
      <div className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <EditorProgramForm mode="create" />
      </div>
    </div>
  );
}

export default EditorProgramCreatePage;


