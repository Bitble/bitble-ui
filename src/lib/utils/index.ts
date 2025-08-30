import { get, writable } from "svelte/store";
// import jp from 'jsonpath';
import { VALIDATORS, isFailed, type Validator, isPassed } from "./BitbleValidators";
import type { ModalSettings } from "@skeletonlabs/skeleton";
import type { PowerQuery } from "./PowerQuery";
import pako from 'pako';

/*
! SIDE NOTE

* Only create a new util function when:
  - Used for significant number of times
  - Help to shorten the code (with same argument name) more than 40% (Eg. `mLog` case)

* EARLY OPTIMIZATION is an unacceptable trap
*/


export async function mockFetch(result: any, timeout: number = 1000) {
	await new Promise(_ => setTimeout(_, timeout));
	return result;
}

export function fileUrlToPath(fileUrl: string): string {
  return "file:///" + fileUrl.replace("\\", "/");
}


export function clone(obj: any): any {
  return JSON.parse(JSON.stringify(obj))
}

export function htmlQuery(component: any, queryString: string): Array<HTMLElement> {
  return Array.from(component?.querySelectorAll(queryString));
}

export function getFieldValue(thisPointer: any, id: string) {
  return thisPointer?.querySelector(`#${id}`)?.value;
}

export function getFieldText(thisPointer: any, id: string) {
  return thisPointer?.querySelector(`#${id}`)?.innerText;
}

/**
 * This util function is used to shorten function chainings
 *
 * Instead of:
 * ```ts
 * promise().then(v => { console.log(v); return v; }).then(...)
 * ```
 *
 * Now:
 * ```ts
 * promise().then(mLog).then(...)
 * ```
 */
export function mLog(v: any) {
  console.log(v);
  return v;
}

/**
 * This util function is used to shorten function chainings
 *
 * Instead of:
 * ```ts
 * promise().then(v => { const t = jsonPath(query, v); receiver = t; return t; }).then(...)
 * ```
 *
 * Now:
 * ```ts
 * promise().then(mAssignMap(receiver, query)).then(...)
 * ```
 */
export function mAssignMap(receiver: any, query: string) {
  return (v: any) => { const t = jsonPath(query, v); receiver = t; return t; };
}

/**
 * **This is part of `bitble-form`**
 *
 * Create a new object from sets of **form fields** (with no prefixes)
 *
 * @param obj an object with **form fields**
 *   ```ts
 *   preparePayload({ form_field1, form_field2, ... })
 *   ```
 */
export function getFormPayload(obj: object) {
  let payload: any = {}

  Object.entries(obj).forEach((entry, index) => {
    const fieldName = entry[0].replace("form_", "");
    payload[fieldName] = entry[1];
  })

  return payload;
}

/**
 * **This is part of `bitble-form`**
 *
 * Check if the given list of **form fields** are fulfilled. Throw `Error` when
 *   failed.
 *
 * **Side effects**:
 * 1. Replace `errors[fieldName]` during check
 * 2. Trigger warning toast when failed
 *
 * @param errors the error registry for current form, which is a multable `Object`
 * @param toastStore
 * @param requiredFieldsRegistry an object contains form variables (Eg. `{ form_field1, form_field2, form_field3 }`)
 * @returns
 */
export function ensureFormFulfillment(errors: any, toastStore: any, requiredFieldsRegistry: object) {
  console.log(requiredFieldsRegistry);
  let isOk: boolean = Object.keys(errors).length === 0;
  errors = {};
  // check for fulfillment
  for (const [name, val] of Object.entries(requiredFieldsRegistry)) {
    if (isPassed(val, VALIDATORS.filled)) continue;

    errors[name.replace("form_", "")] = "Required field must be filled";
    isOk = false;
  }

  if (isOk) return;

  console.warn(errors);
  triggerWarningToast(
    toastStore,
    "Invalid form information",
    "Please check your inputs before submitting"
  );
  throw Error("Invalid form information");
}

export function ensureThat(toastStore: any, value: any, validator: Validator) {
  const validateResult = validator(value);
  if (validateResult === true) return;

  triggerWarningToast(
    toastStore,
    "Preconditions check failed",
    validateResult
  );
  throw Error(validateResult);
}

export function ensureFormFields(errors: any, toastStore: any, fieldsRegistry: object, validator: Validator) {
  let isOk: boolean = Object.keys(errors).length === 0;

  // check for passing given validator
  for (const [name, val] of Object.entries(fieldsRegistry)) {
    const validateResult = validator(val);
    if (validateResult === true) continue;

    errors[name.replace("form_", "")] = validateResult;
    isOk = false;
  }

  if (isOk) return;

  console.warn(errors);
  triggerWarningToast(
    toastStore,
    "Preconditions check failed",
    "Please check your inputs before submitting"
  );
  throw Error("Preconditions check failed");
}

export function triggerSuccessToast(toastStore: any, title: string, message: string, timeout: number = 5000) {
  toastStore.trigger({
    message: `
    <div style="min-width: 15vw">
      <p><i class="mr-2 bi bi-check-circle-fill text-green-400 text-xl"></i><b>${title}</b></p>
      <p>${message}</p>
    </div>
    `,
    timeout,
    background: 'variant-ghost-success bg-green-800'
  });
}

export function triggerInfoToast(toastStore: any, message: string, timeout: number = 5000) {
  toastStore.trigger({
    message,
    timeout,
    background: 'variant-ghost-primary'
  });
}

export function triggerErrorToast(toastStore: any, title: string, message: string, timeout: number = 5000) {
  toastStore.trigger({
    message: `
      <div style="min-width: 15vw">
        <p><i class="mr-2 bi bi-x-circle-fill text-red-400 text-xl"></i><b>${title}</b></p>
        <p>${message}</p>
      </div>
    `,
    timeout,
    hoverable: true,
    background: 'variant-ghost-error',
    classes: 'text-red'
  });
}

export function triggerWarningToast(toastStore: any, title: string, message: string, timeout: number = 5000) {
  toastStore.trigger({
    message: `
      <div style="min-width: 15vw">
        <p><i class="mr-2 bi bi-exclamation-triangle-fill text-xl"></i><b>${title}</b></p>
        <p>${message}</p>
      </div>
    `,
    timeout,
    hoverable: true,
    background: 'variant-ghost-warning shadow-xl bg-yellow-500',
    classes: 'text-black'
  });
}

export async function triggerLoadingToast(
  toastStore: any,
  asyncAction: () => Promise<any>,
  displayContent?: {
    processingTitle?: string,
    processingMessage?: string,
    successTitle?: string,
    successMessage?: string
  }
) {
  const loadingToastId = toastStore.trigger({
    message: `
      <div class="flex flex-row gap-4 justify-center">
        <div uk-spinner></div>
        <div style="min-width: 15vw">
          <p><b>${displayContent?.processingTitle ?? "Processing ..."}</b></p>
          <p>${
            displayContent?.processingMessage ?? "Your required actions is being processed"
          }</p>
        </div>
      </div>
    `,
    autohide: false,
    hideDismiss: true,
    timeout: 120000,
    background: 'variant-ghost-surface shadow-xl bg-gray-700',
    classes: 'text-yellow-600'
  });

  let result: any = undefined;
  return asyncAction()
    .then(r => result = r)
    .then(_ => triggerSuccessToast(
      toastStore,
      displayContent?.successTitle ?? "Completed",
      displayContent?.successMessage ?? "Your required action has been successfully done"
    ))
    .then(_ => result)
    .catch(e => triggerErrorToast(toastStore, 'Something went wrong', e))
    .finally(() => { toastStore.close(loadingToastId)});
}

export function requireConfirmOnAction(
  modalStore: any,
  toastStore: any,
  asyncAction: () => Promise<any>,
  onBeforeAction: () => void = () => {},
  onSuccess: (result: any) => void = r => { console.log(r) },
  dialogContent?: {
    title?: string,
    htmlBody?: string,
    actionName?: string,
    processingTitle?: string,
    processingMessage?: string,
    successTitle?: string,
    successMessage?: string,
  }
) {
  modalStore.trigger({
		type: 'confirm',
		title: `<span> <i class="bi bi-exclamation-triangle-fill text-red-500"/> ${
      dialogContent?.title ?? 'Confirm your action'
    } </span>`,
		buttonTextConfirm: dialogContent?.actionName ?? 'Continue',
		body: dialogContent?.htmlBody ?? '<p>This action will unable to undo, are you want to process?</p>',
		response: (r: any) => {
			if (!r) return;
      onBeforeAction();
      modalStore.close();

			triggerLoadingToast(
        toastStore, asyncAction, {...(dialogContent ?? {})}
      ).then(onSuccess);
		},
	});
}

export function triggerToastOnError(toastStore: any, toastMessage: string) {
  return async (err: Error) => triggerErrorToast(toastStore, toastMessage, err.message);
}

export function percent(a: number, b: number, floatPoint: number = 2): number {
  return parseFloat(((a * 1.0) / (b * 1.0) * 100).toFixed(floatPoint))
}

/**
 * Compress the given query and set it to the URL as a query parameter
 *
 * **Side-effect**: push compressed objects query to current url with `objectsQueryKey` automatically
 *
 * @param {ObjectsQuery} query the query to compress
 * @param {string} objectsQueryKey the key to set the compressed query to. Default is `objects_query`
 * @returns {string} the compressed query
 */
export function compressObjectsQuery(query: PowerQuery<any>, objectsQueryKey: string = 'objects_query'): string {
  // Convert to JSON and compress using pako
  const jsonString = JSON.stringify(query);
  const compressedData = pako.deflate(jsonString);

  // Convert compressed binary to base64 URL-safe string
  const compressedObjectsQuery = btoa(String.fromCharCode.apply(null, compressedData))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  // Update URL
  const url = new URL(window.location.href);
  url.searchParams.set(objectsQueryKey, compressedObjectsQuery);
  history.pushState({}, '', url.toString());

  return compressedObjectsQuery;
}

/**
 * Parse the compressed query from the URL and return the query object
 *
 * @param {any} pageStore the page store, usually from `$page`
 * @param {string} objectsQueryKey the key to get the compressed query from. Default is `objects_query`
 * @returns {ObjectsQuery | null} the parsed query
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseObjectsQuery(pageStore: any, objectsQueryKey: string = 'objects_query'): PowerQuery<any> | null {
  let compressedObjectsQuery = new URLSearchParams(pageStore.url.searchParams).get(objectsQueryKey);

  if (!compressedObjectsQuery) return {
    page: 0,
    perPage: 20,
    filters: {
      status: [],
      categories: []
    }
  };

  try {
    // Restore padding and URL-safe characters
    const padding = compressedObjectsQuery.length % 4;
    if (padding) {
      compressedObjectsQuery += '='.repeat(4 - padding);
    }
    compressedObjectsQuery = compressedObjectsQuery.replace(/-/g, '+').replace(/_/g, '/');

    // Decode base64 to binary
    const binaryString = atob(compressedObjectsQuery);
    const compressedData = Uint8Array.from(binaryString, c => c.charCodeAt(0));

    // Decompress and parse JSON
    const decompressedStr = pako.inflate(compressedData, { to: 'string' });
    return JSON.parse(decompressedStr) as PowerQuery<any>;

  } catch (error) {
    console.error('Failed to decompress query:', error);
    throw new Error('Invalid compressed query string');
  }
}

export function bindHotkey(triggerCondition: (e: KeyboardEvent) => boolean, action: () => (Promise<void> | void)) {
  window.addEventListener('keydown', async (e) => {
    if (triggerCondition(e)) {
      e.stopPropagation();
      e.preventDefault();
      await action();
    }
  });
}

export function bindHotkeyToClick(cssSelector: string, triggerCondition: (e: KeyboardEvent) => boolean) {
  bindHotkey(triggerCondition, () => {
    const element = document.querySelector(cssSelector);
    if (element) {
      (element as HTMLButtonElement).click();
    }
  });
}