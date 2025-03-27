const formatNumber = (num) => {
  num = Number(num) || 0; // Ensure num is a valid number

  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + "B"; // Billions
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + "M"; // Millions
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + "K"; // Thousands
  } else {
    return num.toFixed(2); // Keep two decimal places for small numbers
  }
};

export { formatNumber };
