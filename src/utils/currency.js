export const formatPrice = (priceInNaira, currencyCode, exchangeRate = 1500) => {
  if (priceInNaira === undefined || priceInNaira === null) return '';
  if (currencyCode === 'USD') {
    const priceInUSD = Math.round(priceInNaira / exchangeRate);
    return `$${priceInUSD.toLocaleString()}`;
  }
  return `₦${priceInNaira.toLocaleString()}`;
};
