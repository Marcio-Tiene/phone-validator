const checkIfAllNumbersAreTheSame = /(\d)\1{7,}/;
const checkIfDDDIsValid = /^(1[1-9])$|^([2-9][0-9])$/;
const chekIfIsValidMobile = /^(([7-9][0-9]{7})|([7-9][0-9]{8}))$/;

export const validatePhone = ({ phone = '', isMobile = false }) => {
  const unmaskedPhone = phone.replace(/\D/g, '').trim();

  const DDD = unmaskedPhone.slice(0, 2);
  const phoneWithoutDDD = unmaskedPhone.slice(2).trim();

  const validationError = (message) => ({
    isValid: false,
    unmaskedPhone,
    originalPhone: phone,
    message
  });

  if (!unmaskedPhone) {
    return validationError('É preciso informar um telefone');
  }

  if (unmaskedPhone.length < 10 || unmaskedPhone.length > 11) {
    return validationError('É preciso informar um telefone com 10 ou 11 dígitos numéricos');
  }

  if (checkIfAllNumbersAreTheSame.test(unmaskedPhone)) {
    return validationError('O telefone não pode conter todos os dígitos iguais');
  }

  if (!checkIfDDDIsValid.test(DDD)) {
    return validationError('O DDD parece estar errado');
  }

  if (isMobile && !chekIfIsValidMobile.test(phoneWithoutDDD)) {
    return validationError('Esse número não parece um telefone celular válido');
  }

  return { isValid: true, unmaskedPhone, originalPhone: phone, message: 'Esse é um telefone válido' };
};

export const maskPhoneInputHandler = (phoneInput) => {
  const splitPhone = (unMaskedPhone = '') => {
    const isMobile = unMaskedPhone.length >= 11;

    let parts = {
      part1: '',
      part2: '',
      part3 : ''
    };
    if (isMobile) {
      const part1 = unMaskedPhone.slice(0, 2);
      const part2 = unMaskedPhone.slice(2, 7);
      const part3 = unMaskedPhone.slice(7, 11);

      parts = { part1, part2, part3 };
    } else {
      const part1 = unMaskedPhone.slice(0, 2);
      const part2 = unMaskedPhone.slice(2, 6);
      const part3 = unMaskedPhone.slice(6);

      parts = { part1, part2, part3 };
    }
    return parts;
  };

  const recusiveCheckToPositionCursor = (actualPosition, phone) => {
    const position = actualPosition;
    const testPhone = phone;

    const isNumberRegex = /\d/g;

    if (isNumberRegex.test(phone[position]) || typeof testPhone[position] === 'undefined') {
      return position + 1;
    }

    return recusiveCheckToPositionCursor(position + 1, phone);
  };

  phoneInput.addEventListener('keyup', (event) => {
    const cursorPosition = event.target.selectionStart;
    const inputMaskedPhone = event.target.value;
    const notNumberRegex = /\D/g;

    const unMaskedPhone = inputMaskedPhone.replace(notNumberRegex, '');

    const { part1, part2, part3 } = splitPhone(unMaskedPhone);

    const maskOne = part1 ? `(${part1}` : '';

    const maskTwo = part2 ? `) ${part2}` : '';

    const maskThree = part3 ? `-${part3}` : '';

    const maskedPhone = `${maskOne}${maskTwo}${maskThree}`;

    if (event.code === 'Delete') {
      if (inputMaskedPhone.length < maskedPhone.length) {
        event.target.value = maskedPhone;
        event.target.selectionStart = cursorPosition + 1;
        event.target.selectionEnd = cursorPosition + 1;
        return;
      } else {
        event.target.value = maskedPhone;
        event.target.selectionStart = cursorPosition;
        event.target.selectionEnd = cursorPosition;
        return;
      }
    }

    if (event.code === 'Backspace') {
      event.target.value = maskedPhone;
      event.target.selectionStart = cursorPosition;
      event.target.selectionEnd = cursorPosition;
      return;
    }

    event.target.value = maskedPhone;

    if (notNumberRegex.test(event.key)) {
      console.log(cursorPosition);
      event.target.selectionStart = cursorPosition - 1;
      event.target.selectionEnd = cursorPosition - 1;
      return;
    }

    const recursiveCalcPosition = recusiveCheckToPositionCursor(cursorPosition, maskedPhone);

    const { selectionStart: posMaskedPosition } = event.target;

    if (
      !notNumberRegex.test(event.key) &&
      posMaskedPosition === maskedPhone.length &&
      (recursiveCalcPosition === posMaskedPosition || posMaskedPosition === cursorPosition)
    ) {
      event.target.selectionStart = recursiveCalcPosition;
      event.target.selectionEnd = recursiveCalcPosition;
      return;
    }

    event.target.selectionStart = cursorPosition;
    event.target.selectionEnd = cursorPosition;
  });
};

