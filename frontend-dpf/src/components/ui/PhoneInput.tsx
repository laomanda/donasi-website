import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { forwardRef } from 'react';
// @ts-ignore
import en from 'react-phone-number-input/locale/en';

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
}

const CustomPhoneInput = forwardRef<any, PhoneInputProps>(({ value, onChange, label, error, required, disabled }, ref) => {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-semibold text-slate-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className={`overflow-hidden rounded-xl border bg-white transition focus-within:border-brandGreen-500 focus-within:ring-1 focus-within:ring-brandGreen-500 ${error ? "border-red-300 focus-within:border-red-500 focus-within:ring-red-500" : "border-slate-300"
                } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}>
                <PhoneInput
                    ref={ref}
                    defaultCountry="ID"
                    labels={en}
                    value={value}
                    onChange={(val) => onChange(val as string)}
                    disabled={disabled}
                    international
                    /* @ts-ignore: library typings might be missing this prop but it exists */
                    withCountryCallingCode
                    className="flex h-12 w-full items-center px-4 outline-none [&_.PhoneInputCountry]:mr-3 [&_.PhoneInputCountrySelect]:cursor-pointer [&_input]:h-full [&_input]:w-full [&_input]:bg-transparent [&_input]:outline-none [&_input]:placeholder-slate-400"
                />
            </div>
            {error && <p className="text-xs font-semibold text-red-500">{error}</p>}
        </div>
    );
});

CustomPhoneInput.displayName = 'PhoneInput';

export default CustomPhoneInput;
