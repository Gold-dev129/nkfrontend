export const formatPrice = (priceInNaira, currencyCode, exchangeRate = 1500) => {
  if (priceInNaira === undefined || priceInNaira === null) return '';
  return `₦${priceInNaira.toLocaleString()}`;
};
