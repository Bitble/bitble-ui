<script lang="ts">
  import { quadInOut } from 'svelte/easing';
  import { slide, type SlideParams } from 'svelte/transition';
  import { Accordion, AccordionItem, Button, Heading, Modal, P, Spinner, Textarea } from 'flowbite-svelte';
	import { getToastStore } from './stores/Toast';

	let {
		label,
		onclick,
    loading = $bindable(false),
		icon = '',
    type = 'button',
		color = 'primary',
    role = undefined,
    useWarning = false,
    useDefaultErrorDialog = true,
    warningMessage = 'Are you sure want to continue?',
    successToastTitle = '',
    successToastMessage = 'The action completed successfully',
		disabled = $bindable(false),
		// classes = '',
		onsuccess = console.log,
		onerror = console.error,
		..._props
  }: AsyncButtonProps<any> = $props();

  const toastStore = getToastStore();
  const transitionConfig: Partial<SlideParams> = {axis: 'x', easing: quadInOut, duration: 250};

  let error: any = $state(undefined);
  let event: Event | undefined = $state(undefined);
  let buttonState: AsyncButtonStates = $state.raw(undefined);
  let openedWarningModal: boolean = $state.raw(false);

  $effect(() => {
    if (loading) buttonState = 'loading';
  })

  function guardAction(event: Event) {
    if (!useWarning) {
      _onExecute(event);
    } else {
      openedWarningModal = true;
      event = event;
    }
  }

  function _onError(err: any, title: string, message?: string) {
    toastStore.trigger({
      title,
      message: err.message ?? JSON.stringify(err, null, 2),
      color: 'red',
      icon: 'bi bi-x-circle'
    });
    buttonState = 'error';
    error = err
    onerror(err);
  }

  function _onSuccess(result: any) {
    if (successToastMessage) {
      toastStore.trigger({
        title: successToastTitle,
        message: successToastMessage,
        color: 'green',
        icon: 'bi bi-check-circle-fill'
      });
    }
    buttonState = 'success';
    onsuccess(result);
  }

  function _onExecute(event?: Event) {
    buttonState = 'loading';

    try {
      onclick(event).then(result => {
        if (result?.status >= 400) throw { ...result };
        return result;
      })
      .then(_onSuccess).catch(err => _onError(err, 'An error occurred'))
    } catch (err) {
      _onError(err, 'Catched Exception');
    }
  }
</script>

<Button
  type='button'
  role={role ?? undefined}
  {color} {..._props}
  disabled={disabled || (buttonState === 'loading')}
  onclick={guardAction}
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
      <span class="nowrap">{label}</span>
    {/if}
  </div>
</Button>

{#if openedWarningModal}
<Modal open={true} size="xs" dismissable={false} shadow={true}>
  <div slot="header">
    <Heading tag="h5"><i class="bi bi-exclamation-triangle"></i> Warning</Heading>
  </div>
	<div class="text-center">
		<P>{warningMessage}</P>
	</div>
  <div class="w-full text-right" slot="footer">
    <Button color="alternative" size="sm" onclick={() => { openedWarningModal = false }}>Cancel</Button>
    <Button color="yellow" size="sm" onclick={() => {
      openedWarningModal = false;
      _onExecute(event);
    }}>Proceed</Button>
  </div>
</Modal>
{/if}

{#if (buttonState === 'error') && useDefaultErrorDialog}
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