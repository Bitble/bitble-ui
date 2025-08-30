/** `true` when passed, `error string` when failed */
export type ValidationResult = true | string;
export type Validator = (v: any) => ValidationResult;

export const FAIL_MESSAGES = {
	filled: "Required field must be fulfilled",
	vnPhone: "Must be VN phone format: 0XXXXXXXXX"
}

export const VALIDATORS = {
	filled: passIf(v => v || String(v ?? '').length > 0	, FAIL_MESSAGES.filled),
	vnPhone: passIf(v => v?.match(/^0\d{9}$/g), FAIL_MESSAGES.vnPhone),
}

/**
 * Instead of:
 * ```ts
 * if (VALIDATORS.validate(value) === true) {
 * ```
 *
 * Now:
 * ```ts
 * if (isPassed(value, VALIDATORS.validate)) {
 * ```
 */
export function isPassed(input: any, validator: Validator): boolean {
	return validator(input) === true;
}

export function isFailed(input: any, validator: Validator): boolean {
	return validator(input) !== true;
}

/**
 * Instead of:
 * ```ts
 * const validator = v => condition(v) ? true : failMessage;
 * ```
 *
 * Now:
 * ```ts
 * const validator = passIf(condition, failMessage);
 * ```
 */
export function passIf(positiveCondition: (v: any) => boolean, failMessage: string): Validator {
	return (v: any) => (positiveCondition(v) ? true : failMessage);
}

export function denyIf(negativeCondition: (v: any) => boolean, failMessage: string): Validator {
	return (v: any) => (negativeCondition(v) ? failMessage : true);
}