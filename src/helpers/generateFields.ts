import type { TField } from 'types';

const generateFields = (): TField[] => {
  const fields: TField[] = [];

  for (let i = 0; i < 9; i += 1) {
    fields.push({ id: `0${i}`, type: '' });
  }
  return fields;
};

export default generateFields;
