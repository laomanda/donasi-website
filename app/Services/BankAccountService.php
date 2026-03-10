<?php

namespace App\Services;

use App\Models\BankAccount;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class BankAccountService
{
    public function storeAccount(array $data, ?UploadedFile $image, ?UploadedFile $qrisImage): BankAccount
    {
        if ($image) {
            $data['image_path'] = $image->store('banks', 'public');
        }

        if ($qrisImage) {
            $data['qris_image_path'] = $qrisImage->store('qris', 'public');
        }

        return BankAccount::create($data);
    }

    public function updateAccount(BankAccount $bankAccount, array $data, ?UploadedFile $image, ?UploadedFile $qrisImage): BankAccount
    {
        if ($image) {
            if ($bankAccount->image_path && Storage::disk('public')->exists($bankAccount->image_path)) {
                Storage::disk('public')->delete($bankAccount->image_path);
            }
            $data['image_path'] = $image->store('banks', 'public');
        }

        if ($qrisImage) {
            if ($bankAccount->qris_image_path && Storage::disk('public')->exists($bankAccount->qris_image_path)) {
                Storage::disk('public')->delete($bankAccount->qris_image_path);
            }
            $data['qris_image_path'] = $qrisImage->store('qris', 'public');
        }

        $bankAccount->update($data);

        return $bankAccount->refresh();
    }

    public function deleteAccount(BankAccount $bankAccount): void
    {
        if ($bankAccount->image_path && Storage::disk('public')->exists($bankAccount->image_path)) {
            Storage::disk('public')->delete($bankAccount->image_path);
        }
        if ($bankAccount->qris_image_path && Storage::disk('public')->exists($bankAccount->qris_image_path)) {
            Storage::disk('public')->delete($bankAccount->qris_image_path);
        }
        
        $bankAccount->delete();
    }
}
