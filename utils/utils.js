import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

dayjs.extend(customParseFormat);

export const formatDate = (input) => {
  const date = dayjs(input, "YYYY-DD-MM");

  return date.format("DD/MM/YYYY");
};

export const reverseFormat = (input) => {
  const date = dayjs(input, "YYYY-MM-DD");

  return date.format("YYYY-DD-MM");
};
