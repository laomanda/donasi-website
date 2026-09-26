<?php

namespace Database\Seeders;

use App\Models\WaqfAssetCategory;
use Illuminate\Database\Seeder;

class WaqfAssetCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name'        => 'Tanah',
                'description' => 'Aset wakaf tidak bergerak berupa tanah / lahan produktif dan sosial.',
            ],
            [
                'name'        => 'Bangunan',
                'description' => 'Aset wakaf berupa gedung, ruko, sarana ibadah, dan sarana pendidikan.',
            ],
            [
                'name'        => 'Kendaraan',
                'description' => 'Aset wakaf bergerak berupa kendaraan ambulans dan armada layanan umat.',
            ],
            [
                'name'        => 'Investasi',
                'description' => 'Penempatan dana wakaf pada portofolio investasi produktif syariah.',
            ],
            [
                'name'        => 'Kas dan Setara Kas',
                'description' => 'Wakaf uang tunai yang tersimpan di rekening perbankan syariah.',
            ],
            [
                'name'        => 'Surat Berharga',
                'description' => 'Instrumen Sukuk Wakaf (Cash Waqf Linked Sukuk / CWLS) dan efek syariah.',
            ],
            [
                'name'        => 'Logam Mulia',
                'description' => 'Emas batangan atau logam mulia titipan wakaf abadi.',
            ],
            [
                'name'        => 'Aset Tidak Berwujud',
                'description' => 'Hak cipta, paten, lisensi teknologi, atau hak kekayaan intelektual wakaf.',
            ],
            [
                'name'        => 'Aset Lainnya',
                'description' => 'Aset wakaf lainnya yang belum tercakup dalam klasifikasi utama.',
            ],
        ];

        foreach ($categories as $cat) {
            WaqfAssetCategory::firstOrCreate(
                ['name' => $cat['name']],
                ['description' => $cat['description']]
            );
        }
    }
}
