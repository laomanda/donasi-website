<?php

namespace App\Services;

use App\Exports\Finance\AccountsTemplateExport;
use App\Models\AuditLog;
use App\Models\User;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class FinanceImportTemplateService
{
    /**
     * Generate official Chart of Accounts (AD) Excel template.
     */
    public function generateAccountsTemplate(?User $user = null): BinaryFileResponse
    {
        $user = $user ?? auth()->user();

        if ($user) {
            AuditLog::create([
                'user_id'      => $user->id,
                'module'       => 'finance_import',
                'action'       => 'template_download',
                'reference_id' => null,
                'old_data'     => null,
                'new_data'     => [
                    'template'  => 'template_chart_of_accounts.xlsx',
                    'sheet'     => 'AD',
                    'timestamp' => now()->toIso8601String(),
                ],
            ]);
        }

        return Excel::download(new AccountsTemplateExport(), 'template_chart_of_accounts.xlsx');
    }
}
