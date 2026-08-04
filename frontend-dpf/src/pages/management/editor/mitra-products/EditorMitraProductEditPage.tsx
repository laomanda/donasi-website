import { useParams } from "react-router-dom";
import EditorMitraProductForm from "@/components/management/editor/mitra-products/EditorMitraProductForm";
export default function EditorMitraProductEditPage() { const { id } = useParams(); return <EditorMitraProductForm mode="edit" productId={Number(id)} />; }
