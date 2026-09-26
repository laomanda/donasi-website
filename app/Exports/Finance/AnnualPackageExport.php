<?php

namespace App\Exports\Finance;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class AnnualPackageExport implements WithMultipleSheets
{
    protected array $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function sheets(): array
    {
        return [
            new AccountsExport($this->filters, 'AD'),
            new JournalEntriesExport($this->filters, 'JU'),
            new GeneralLedgerExport($this->filters, 'BB'),
            new TrialBalanceExport($this->filters, 'NS-TB'),
            new BalanceSheetExport($this->filters, 'LP'),
            new ActivityStatementExport($this->filters, 'LA'),
            new WaqfAssetsExport($this->filters, 'LRAW'),
            new FinancialNotesExport($this->filters, 'CLK'),
        ];
    }
}
