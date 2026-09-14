export const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export const getMonthName = (monthNumber) => {
  return (
    MONTHS.find(
      (month) =>
        month.value === Number(monthNumber)
    )?.label || ""
  );
};

const formatDateForInput = (date) => {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getReportPeriod = (
  period,
  currentDate = new Date()
) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const day = currentDate.getDate();

  const today = new Date(year, month, day);

  switch (period) {
    case "today":
      return {
        startDate: formatDateForInput(today),
        endDate: formatDateForInput(today),
      };

    case "week": {
      const start = new Date(today);

      const dayOfWeek = start.getDay();
      const daysSinceMonday =
        dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      start.setDate(
        start.getDate() - daysSinceMonday
      );

      return {
        startDate: formatDateForInput(start),
        endDate: formatDateForInput(today),
      };
    }

    case "month":
      return {
        startDate: formatDateForInput(
          new Date(year, month, 1)
        ),
        endDate: formatDateForInput(today),
      };

    case "year":
      return {
        startDate: formatDateForInput(
          new Date(year, 0, 1)
        ),
        endDate: formatDateForInput(today),
      };

    default:
      return null;
  }
};