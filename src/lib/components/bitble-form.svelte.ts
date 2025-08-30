const formRegistry: Record<string, FormRegistry> = $state({});

export interface FormRegistry {
  /**
   * Form data: Key is the input's name, value is the input's value
   */
  formData: Record<string, any>;
  /**
   * Form errors: Key is the input's name, value is the error messages
   */
  errors: Record<string, string>;
  /**
   * Form warnings: Key is the input's name, value is the warning messages
   */
  warnings: Record<string, string>;
}

export function createForm(formName: string): FormRegistry {
  if (formRegistry[formName]) {
    console.warn(`Form '${formName}' already exists`);
  } else {
    formRegistry[formName] = {
      formData: {},
      errors: {},
      warnings: {},
    };
  }

  return formRegistry[formName];
}

export function getForm(formName: string) {
  return formRegistry[formName];
}

export function setError(formName: string, fieldName: string, error: string) {
  formRegistry[formName].errors[fieldName] = error;
  throw new Error(`[${formName}/${fieldName}] - FormError: ${error}`);
}

export function removeError(formName: string, fieldName: string) {
  delete formRegistry[formName].errors[fieldName];
}

export function clearErrors(formName: string) {
  formRegistry[formName].errors = {};
}

export function createSubmitAction(
  formName: string, 
  action: (formData: Record<string, any>, e?: Event) => Promise<any>
): (e?: Event) => Promise<any> {
  return async (e?: Event) => {
    clearErrors(formName);
    const formData = getForm(formName).formData;
    const result = await action(formData, e);
    return result;
  }
}


