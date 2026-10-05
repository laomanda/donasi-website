<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Throwable;

/**
 * Validates that a finance import upload is an actual readable Excel workbook.
 *
 * Laravel's mimes rule relies on the detected MIME type/content signature and
 * can reject valid workbooks before PhpSpreadsheet gets a chance to inspect
 * them. The finance import contract is intentionally layered instead:
 * extension -> upload/size rules -> parser readability.
 */
class FinanceExcelFileRule implements ValidationRule
{
    private const XLSX_OLE_HEADER = "\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1";

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $value instanceof UploadedFile) {
            $fail('File Excel tidak valid atau rusak. Gunakan template resmi dan unggah kembali file yang dapat dibuka.');

            return;
        }

        $extension = strtolower((string) pathinfo($value->getClientOriginalName(), PATHINFO_EXTENSION));
        if (! in_array($extension, ['xlsx', 'xls'], true)) {
            $fail('File harus berformat Excel (.xlsx atau .xls).');

            return;
        }

        $path = $value->getRealPath();
        if (! is_string($path) || $path === '' || ! is_readable($path)) {
            $fail('File Excel tidak valid atau rusak. Gunakan template resmi dan unggah kembali file yang dapat dibuka.');

            return;
        }

        // An encrypted OOXML workbook is stored as an OLE compound document
        // instead of the normal ZIP package. PhpSpreadsheet cannot open it
        // without a password, which this import flow intentionally does not
        // accept.
        if ($extension === 'xlsx' && $this->hasEncryptedXlsxSignature($path)) {
            $fail($this->passwordProtectedMessage());

            return;
        }

        try {
            $reader = IOFactory::createReaderForFile($path);
            $sheetNames = $reader->listWorksheetNames($path);

            if ($sheetNames === []) {
                $fail($this->invalidWorkbookMessage());
            }
        } catch (Throwable $exception) {
            $message = strtolower($exception->getMessage());

            if (preg_match('/password|decrypt|encrypt|encrypted/', $message) === 1) {
                $fail($this->passwordProtectedMessage());

                return;
            }

            $fail($this->invalidWorkbookMessage());
        }
    }

    private function hasEncryptedXlsxSignature(string $path): bool
    {
        $contents = @file_get_contents($path);
        if (! is_string($contents) || ! str_starts_with($contents, self::XLSX_OLE_HEADER)) {
            return false;
        }

        // Encrypted OOXML workbooks are OLE containers with these stream
        // names. A random/corrupt OLE-looking file should remain classified
        // as corrupt rather than being reported as password protected.
        return stripos($contents, 'EncryptedPackage') !== false
            || stripos($contents, 'EncryptionInfo') !== false
            || stripos($contents, "E\0n\0c\0r\0y\0p\0t\0e\0d\0P\0a\0c\0k\0a\0g\0e") !== false
            || stripos($contents, "E\0n\0c\0r\0y\0p\0t\0i\0o\0n\0I\0n\0f\0o") !== false;
    }

    private function passwordProtectedMessage(): string
    {
        return 'File Excel dilindungi password dan tidak dapat diproses. Hapus password dokumen terlebih dahulu, lalu unggah kembali file yang dapat dibuka.';
    }

    private function invalidWorkbookMessage(): string
    {
        return 'File Excel tidak valid atau rusak. Gunakan template resmi dan unggah kembali file yang dapat dibuka.';
    }
}
