export type Validable = {
  value: string | number;
  required?: boolean;
  maxLen?: number;
  minLen?: number;
  min?: number;
  max?: number;
};

export function validate(validateInput: Validable) {
  let isValid = true;

  if (validateInput.required) {
    isValid = isValid && validateInput.value.toString().trim().length !== 0;
  }
  if (validateInput.maxLen && typeof validateInput.value === "string") {
    isValid = isValid && validateInput.maxLen >= validateInput.value.length;
  }
  if (validateInput.minLen && typeof validateInput.value === "string") {
    isValid = isValid && validateInput.minLen <= validateInput.value.length;
  }
  if (validateInput.min && typeof validateInput.value === "number") {
    isValid = isValid && validateInput.min <= validateInput.value;
  }
  if (validateInput.max && typeof validateInput.value === "number") {
    isValid = isValid && validateInput.max >= validateInput.value;
  }

  return isValid;
}
