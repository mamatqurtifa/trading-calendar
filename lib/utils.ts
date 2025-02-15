export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const formatPercentage = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "PROFIT":
      return "text-green-600";
    case "LOSS":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};
