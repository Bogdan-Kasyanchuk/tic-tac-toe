export interface IRadioInputProps {
  id: string;
  checked: boolean;
  name: string;
  value: string;
  label: string;
  handlerInput?: () => void;
}
