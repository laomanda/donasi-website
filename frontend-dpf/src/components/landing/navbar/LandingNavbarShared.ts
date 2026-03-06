import { 
    faHouse, 
    faHandsHoldingCircle, 
    faHeart, 
    faBookOpen, 
    faCircleInfo 
} from "@fortawesome/free-solid-svg-icons";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { globalDict } from "../../../i18n/global";

export interface NavItem {
    label: { id: string; en: string };
    href: string;
    icon: IconProp;
}

export const NAV_ITEMS: NavItem[] = [
    { label: globalDict["nav.home"], href: "/", icon: faHouse },
    { label: globalDict["nav.services"], href: "/layanan", icon: faHandsHoldingCircle },
    { label: globalDict["nav.programs"], href: "/program", icon: faHeart },
    { label: globalDict["nav.literacy"], href: "/literasi", icon: faBookOpen },
    { label: globalDict["nav.about"], href: "/tentang-kami", icon: faCircleInfo },
];

export const SEARCH_ITEMS = [
    {
        href: "/",
        labels: { id: "Beranda", en: "Home" },
        keywords: [
            "beranda", "home", "dpf", "djalaludin pane foundation",
            "pintu pemberdayaan", "pemberdayaan", "amanah", "profesional", "katalog kebaikan"
        ],
    },
    {
        href: "/program",
        labels: { id: "Program", en: "Programs" },
        keywords: ["program", "programs", "katalog", "pintu", "unggulan", "mitra", "partner"],
    },
    {
        href: "/donate",
        labels: { id: "Donasi", en: "Donate" },
        keywords: ["donasi", "donate", "donation"],
    },
    {
        href: "/literasi",
        labels: { id: "Literasi", en: "Literacy" },
        keywords: ["literasi", "literacy", "artikel", "articles", "berita", "konten"],
    },
    {
        href: "/layanan",
        labels: { id: "Layanan", en: "Services" },
        keywords: ["layanan", "services"],
    },
    {
        href: "/tentang-kami",
        labels: { id: "Tentang Kami", en: "About Us" },
        keywords: ["tentang", "about"],
    },
    {
        href: "/konsultasi",
        labels: { id: "Konsultasi WAKAF", en: "WAKAF Consultation" },
        keywords: ["konsultasi", "consultation", "wakaf"],
    },
    {
        href: "/jemput-wakaf",
        labels: { id: "Jemput Wakaf", en: "Pickup Wakaf" },
        keywords: ["jemput", "pickup", "wakaf"],
    },
    {
        href: "/konfirmasi-donasi",
        labels: { id: "Konfirmasi Donasi", en: "Donation Confirmation" },
        keywords: ["konfirmasi", "confirmation", "transfer"],
    },
];

export const SEARCH_INDEX = [
    { href: "/", corpus: "Djalaludin Pane Foundation Pintu pemberdayaan Amanah profesional Katalog kebaikan Mulai donasi Lihat program Program unggulan Mitra Bank rekening Rekening donasi Artikel terbaru Program terbaru" },
    { href: "/program", corpus: "Program unggulan Wakaf Donasi Beasiswa Campaign sosial Mitra Partner Program aktif Program nonaktif Donasi program" },
    { href: "/layanan", corpus: "Layanan Jemput Wakaf Konfirmasi Donasi Konsultasi WAKAF Konsultasi wakaf Jemput wakaf ke lokasi Donasi langsung" },
    { href: "/donate", corpus: "Donasi online Pembayaran otomatis Transfer bank Rekening donasi Donasi umum Pilih nominal Rekening resmi Tujuan transfer" },
    { href: "/literasi", corpus: "Literasi Artikel Berita Konten edukasi Baca selengkapnya Penulis Kategori" },
    { href: "/konsultasi", corpus: "Konsultasi Konsultasi WAKAF Tanya wakaf infak sedekah wakaf Konsultasi wakaf Hubungi kami" },
    { href: "/jemput-wakaf", corpus: "Jemput wakaf Pickup wakaf Penjemputan donasi Antar jemput Jadwalkan penjemputan" },
    { href: "/tentang-kami", corpus: "Tentang kami Profil Struktur Amanah profesional Sejarah Visi misi Mitra" },
    { href: "/konfirmasi-donasi", corpus: "Konfirmasi donasi Upload bukti transfer Verifikasi donasi" },
    { href: "/program-detail", corpus: "Detail program Progress donasi Target donasi" },
];
