<script lang="ts">
  import { quadInOut } from 'svelte/easing';
  import { slide, type SlideParams } from 'svelte/transition';
  import { Accordion, AccordionItem, Button, Heading, Modal, P, Spinner, Textarea } from 'flowbite-svelte';
	import { getToastStore } from './stores/Toast';

	let {
		label,
		errors,
    loading = $bindable(false),
		icon = '',
		color = 'primary',
    useWarning = undefined,
    successToastTitle = '',
    successToastMessage = 'The action completed successfully',
		disabled = $bindable(false),
		..._props
	}: any = $props();

  const toastStore = getToastStore();
  const transitionConfig: Partial<SlideParams> = {axis: 'x', easing: quadInOut, duration: 250};

  let storedEvent: Event | undefined = $state(undefined);
  let buttonState: AsyncButtonStates = $state.raw(undefined);
  let openedWarningModal: boolean = $state.raw(false);
	let allowedWarning: boolean = $state.raw(false);

  $effect(() => {
		disabled = loading;
		buttonState = loading ? 'loading' : undefined;
  })

  function guardAction(event: Event) {
    if (!useWarning || allowedWarning) {
      handleClick(event);
    } else {
			event.preventDefault();
			event.stopPropagation();
      openedWarningModal = true;
      storedEvent = event;
    }
  }

  function handleError(err: any, title: string, message?: string) {
    toastStore.trigger({
      title,
      message: JSON.stringify(err, null, 2),
      color: 'red',
      icon: 'bi bi-x-circle'
    });
    buttonState = 'error';
    error = err
    onerror(err);
  }

  function handleClick(event?: Event) {
		storedEvent?.target?.click();
		allowedWarning = false;
  }
</script>

<Button
  type="submit"
  disabled={disabled || (buttonState === 'loading')}
  onclick={guardAction}
	color={color}
  {..._props}
>
  <div class='w-full flex flex-row justify-center items-center m-0 p-0'>
    {#if (buttonState === 'loading')}
      <div transition:slide={transitionConfig} class='mr-2'>
        <Spinner size={5} color={color}/>
      </div>
    {:else if icon}
      <span transition:slide={transitionConfig} style="font-size: 16px;">
        <i class="bi {icon} mr-2"></i>
      </span>
    {/if}
    {#if label}
      <span>{label}</span>
    {/if}
  </div>
</Button>

{#if openedWarningModal}
<Modal open={true} size="xs" dismissable={false} shadow={true}>
  <div slot="header">
    <Heading tag="h5"><i class="bi bi-exclamation-triangle"></i> {useWarning.title ?? 'Warning'}</Heading>
  </div>
	<div class="text-center">
		<P>{useWarning.message}</P>
	</div>
  <div class="w-full text-right" slot="footer">
    <Button color="alternative" size="sm" onclick={() => { openedWarningModal = false }}>Cancel</Button>
    <Button color="yellow" size="sm" onclick={() => {
      openedWarningModal = false;
      allowedWarning = true;
      handleClick(storedEvent);
    }}>Proceed</Button>
  </div>
</Modal>
{/if}

<!-- {#if (buttonState === 'success')}
<Modal open={true} color="green" size="xs" dismissable={false} shadow={true}>
	<div class="text-center mt-6">
		<Heading tag="h1" color="green">
			<i class="bi bi-check-circle-fill"></i>
		</Heading>
		<p class="mt-6">{'successMessage'}</p>
		<hr class="my-6">
		<div class="w-full">
			<Button color="green" onclick={() => {
				// isSuccess = false;
				// onSuccess();
			}} outline class="w-1/3">OK</Button>
		</div>
	</div>
</Modal>
{/if} -->

{#if (buttonState === 'error')}
<Modal open={true} color="red" dismissable={false} shadow={true}>
	<div class="text-center mt-6">
		<Heading tag="h1" color="red">
			<i class="bi bi-exclamation-diamond-fill"></i>
		</Heading>
		<p class="my-6"><strong>Thao tác thực hiện không thành công</strong></p>
		<div class="text-left">
			<p>
				<strong><i class="bi bi-chat-left-dots"></i> Nội dung: </strong><br>
				{error.message}
			</p>
			<br>
			<Accordion>
				<AccordionItem>
					<span slot="header">Xem thêm: thông tin kỹ thuật của lỗi</span>
					<Textarea style="font-family: consolas, monospaced; height: 300px" readonly value={JSON.stringify(error, null, 2)} row=6/>
				</AccordionItem>
			</Accordion>
		</div>
		<hr class="my-6">
		<div class="w-full">
			<Button color="alternative" onclick={() => {buttonState = undefined}} class="w-1/3">OK</Button>
		</div>
	</div>
</Modal>
{/if}