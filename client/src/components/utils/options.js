import dayjs from "dayjs";

const ageItems = [
  {
    value: "15-25",
    label: "15-25",
  },
  {
    value: ">25",
    label: ">25",
  },
];

const genderItems = [
  {
    value: "male",
    label: "Male",
  },
  {
    value: "female",
    label: "Female",
  },
];

const rangePresets = [
  {
    label: "Today",
    value: [dayjs().startOf("day"), dayjs().endOf("day")], // Range for today
  },
  {
    label: "Yesterday",
    value: [
      dayjs().subtract(1, "day").startOf("day"),
      dayjs().subtract(1, "day").endOf("day"),
    ], // Range for yesterday
  },
  {
    label: "Last 7 Days",
    value: [dayjs().subtract(7, "day").startOf("day"), dayjs().endOf("day")], // Last 7 days from today
  },
  {
    label: "This Month",
    value: [dayjs().startOf("month"), dayjs().endOf("month")], // Current month range
  },
];

export { ageItems, genderItems, rangePresets };
