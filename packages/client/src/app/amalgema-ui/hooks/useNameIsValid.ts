import { useEntityQuery } from "@latticexyz/react";
import { useAmalgema } from "../../../useAmalgema";
import { Has, getComponentValue } from "@latticexyz/recs";

export function useNameIsValid(name: string) {
  const {
    components: { Name },
  } = useAmalgema();

  const allNames = useEntityQuery([Has(Name)]).map((e) => getComponentValue(Name, e)?.value);
  const nameTaken = allNames.includes(name);
  const nameIncludesWhitespaces = [" ", "\t", "\n", "\r"].some((char) => name.includes(char));
  // eslint-disable-next-line no-control-regex
  const nameIsNonAscii = name.match(/[^\x00-\x7F]/g);
  const nameTooLong = name.length > 32;
  const nameIsEmpty = name.length === 0;

  let message = "";
  if (nameTaken) {
    message = "Name taken";
  } else if (nameIsEmpty) {
    message = "Name cannot be empty";
  } else if (nameIncludesWhitespaces) {
    message = "No whitespaces allowed";
  } else if (nameIsNonAscii) {
    message = "No special characters allowed";
  } else if (nameTooLong) {
    message = "Name too long";
  }

  const disabled = nameTaken || nameIsEmpty || nameIncludesWhitespaces || nameIsNonAscii || nameTooLong;

  return {
    nameValid: !disabled,
    nameValidityMessage: message,
  };
}
