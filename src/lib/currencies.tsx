
export const Currencies = [
    { value: "USD", label: "$ Dollar", locale: "en-US" },
    { value: "EUR", label: "€ Euro", locale: "fr-FR" },
    { value: "JPY", label: "¥ Yen", locale: "ja-JP" },
    { value: "GBP", label: "£ Pound", locale: "en-GB" },
    { value: "DZ", label: "د.ج Dinar", locale: "ar-DZ" },
];

export type Currency = (typeof Currencies)[0]