<script lang="ts">
	import { onMount, setContext } from "svelte";
	import { createForm } from "./bitble-form.svelte";

  let {name, children} = $props();

  let formWrapper: HTMLDivElement | undefined;
  let submitElement: any | null;

  let formObject = $state(createForm(name));

  setContext('formObject', formObject);


  function setupEnterKeyToSubmit() {
    if (formWrapper) {
      formWrapper.onkeydown = (e) => {
        const keyCode = e ? (e.which ? e.which : e.keyCode) : e.keyCode;
        if (keyCode == 13) submitElement?.click();
      }
    }
  }

  function bindFormDataFlow() {

    function _updateFormData(e: Event) {
      const fieldName = (e.target as HTMLInputElement).name;
      const fieldValue = (e.target as HTMLInputElement).value;
      (formObject as any).formData[fieldName] = fieldValue;
    }

    if (formWrapper) {
      // real time update to registered form's formData
      // apply for `input`, `select`, `textarea`
      formWrapper.querySelectorAll('input, select, textarea').forEach(element => {
        (element as HTMLInputElement).oninput = _updateFormData;
        (element as HTMLInputElement).onchange = _updateFormData;
      });
    }
  }

  onMount(() => {
    submitElement = formWrapper?.querySelector('[role="submit"]');
    if (!submitElement) {
      throw new Error('Submit element not found. There must be a button with role="submit" as a child of <BitbleForm/>.');
    }

    setupEnterKeyToSubmit();
    bindFormDataFlow();
  });

</script>

<div bind:this={formWrapper}>
  {@render children()}
</div>