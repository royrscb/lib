import React, { type JSX, type ReactNode } from 'react';
import ReactDOM from 'react-dom';
import clsx from 'clsx';
import { createRoot, type Root } from 'react-dom/client';

//#region Popup

// Const ---
const popAnimationDuration = 400;
const closeAnimationDuration = 200;

// Types ---
export type PopupPortalHandler = [
    popupPortal: React.JSX.Element,
    // eslint-disable-next-line no-unused-vars
    pop: (propsOverride?: PopupProps | null) => Promise<void>,
    close: () => Promise<void>,
];

// Props ---
export interface PopupButtonOnClickParams {
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>;
    button: HTMLButtonElement | null;
    popup: HTMLDivElement | null;
    formData?: Record<string, FormDataEntryValue>;
}
export interface PopupButtonProps {
    className?: string;
    text: ReactNode;
    // eslint-disable-next-line no-unused-vars
    onClick?: (params: PopupButtonOnClickParams) => boolean | void | Promise<boolean | void>;
    formRef?: React.RefObject<HTMLFormElement | null>;
    formId?: string;
    preventClose?: boolean
}
export interface PopupProps {
    className?: string;
    holderClassName?: string;
    titleClassName?: string;
    containerClassName?: string;

    title?: ReactNode | null;
    subtitle?: ReactNode;
    fixedTitleAndSubtitle?: boolean;
    content?: ReactNode;

    preventClose?: boolean;
    preventCloseOnEscapeButtonPressed?: boolean;
    preventCloseOnClickOutside?: boolean;
    // eslint-disable-next-line no-unused-vars
    onClose?: (popup: HTMLDivElement | null) => boolean | void | Promise<boolean | void>;

    okButton?: PopupButtonProps;
    cancelButton?: PopupButtonProps;
}

export interface PopupHandler {
    // eslint-disable-next-line no-unused-vars
    pop: (propsOverride?: PopupProps | null) => Promise<void>,
    close: () => Promise<void>;
    getPopup: () => HTMLDivElement | null;
}

// Create popup imperative ---
export function createPopup(initialProps?: PopupProps): PopupHandler {
    let props = initialProps;
    let container: HTMLDivElement | null = null;
    let root: Root | null = null;

    const getPopupHolder = () => container?.querySelector('.popup-holder');

    async function pop(propsOverride?: PopupProps | null): Promise<void> {
        if (propsOverride !== undefined) {
            props = propsOverride === null ? undefined : propsOverride;
        }

        container = document.createElement('div');
        container.classList.add('popup', 'hidden');
        props?.className?.split(' ').forEach(c => c && container?.classList.add(c));
        document.body.appendChild(container);

        root = createRoot(container);
        root.render(<Popup {...props} close={close} />);

        await Promise.sleep(1);
        getPopupHolder()?.classList.add('fade-in-slow');
        container?.classList.remove('hidden');
        await Promise.sleep(popAnimationDuration);
        getPopupHolder()?.classList.remove('fade-in-slow');
    }

    async function close(): Promise<void> {
        const closeBackRes = (await props?.onClose?.(container)) ?? true;

        if (closeBackRes !== false) {
            if (container) {
                getPopupHolder()?.classList.add('fade-out-fast');
                await new Promise(resolve => setTimeout(() => resolve(true), closeAnimationDuration));
                container.remove();
                container = null;
            }

            if (root) {
                try { root.unmount(); } catch { /* empty */ }
                root = null;
            }
        }
    }

    return { pop, close, getPopup: () => container };
}

// Use popup declarative ---
export function usePortalPopup(initialProps?: PopupProps): PopupPortalHandler {
    const [props, setProps] = React.useState<PopupProps | undefined>(initialProps);
    const [isPortalVisible, setIsPortalVisible] = React.useState<boolean>(false);
    const popupRef = React.useRef<HTMLDivElement | null>(null);
    const getPopupHolder = () => popupRef.current?.querySelector('.popup-holder');

    React.useEffect(() => {
        if (isPortalVisible && popupRef.current?.firstChild) {
            getPopupHolder()?.classList.add('fade-in');
            setTimeout(() => {
                getPopupHolder()?.classList.remove('fade-in');
            }, popAnimationDuration);
        }
    }, [isPortalVisible]);

    async function pop(propsOverride?: PopupProps | null): Promise<void> {
        if (propsOverride !== undefined) {
            setProps(propsOverride === null ? undefined : propsOverride);
        }
        setIsPortalVisible(true);
        await new Promise(resolve => setTimeout(resolve, popAnimationDuration));
    }

    async function close(): Promise<void> {
        const closeBackRes = (await props?.onClose?.(popupRef.current)) ?? true;
        if (closeBackRes !== false) {
            getPopupHolder()?.classList.add('fade-out-fast');
            await new Promise(resolve => setTimeout(resolve, closeAnimationDuration));
            setIsPortalVisible(false);
        }
    }

    const portalElement = isPortalVisible ? (
        <div ref={popupRef} className={clsx('popup', props?.className)}>
            <Popup {...props} close={close} />
        </div>
    ) : null;

    return [
        ReactDOM.createPortal(portalElement, document.body),
        pop,
        close,
    ];
}

function Popup(props: PopupProps & { close: () => void; }) : JSX.Element {
    const thisPopupRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!props.preventCloseOnEscapeButtonPressed){
            const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') props.close(); };
            document.addEventListener('keydown', onKey);
            return () => document.removeEventListener('keydown', onKey);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const titleAndSubtitle = <div className='title-and-subtitle'>
        {props.title !== null && <div className={clsx('title', props.titleClassName)}>{props.title ?? 'Popup'}</div>}
        {props.subtitle && <div className='subtitle'>{props.subtitle}</div>}
    </div>;

    return <div
        ref={thisPopupRef}
        className={clsx('popup-holder', props.holderClassName)}
        style={{ display: 'block' }}
        onClick={() => {
            if (props.preventClose !== true && props.preventCloseOnClickOutside !== true) {
                props.close();
            }
        }}
    >
        {/* Container */}
        <div className={clsx('popup-container', props.containerClassName)} onClick={e => e.stopPropagation()}>
            {!props.preventClose &&
                <button className='red-cross' onClick={props.close}>
                    <div className='red-cross-line-a'></div>
                    <div className='red-cross-line-b'></div>
                </button>
            }
            {props.fixedTitleAndSubtitle && titleAndSubtitle}
            <div className='inner'>
                {!props.fixedTitleAndSubtitle && titleAndSubtitle}

                {/* Content */}
                {props.content && <div className='content'>{props.content}</div>}

                {/* Ok and Cancel button */}
                {(props.okButton || props.cancelButton) &&
                    <div className='buttons'>
                        {props.cancelButton &&
                            <PopupButton
                                {...props.cancelButton}
                                className={clsx(props.cancelButton.className, 'cancel-button')}
                                popupRef={thisPopupRef}
                                close={props.close}
                            />
                        }
                        {props.okButton &&
                            <PopupButton
                                {...props.okButton}
                                className={clsx(props.okButton.className, 'ok-button')}
                                popupRef={thisPopupRef}
                                close={props.close}
                            />
                        }
                    </div>
                }
            </div>
        </div>
    </div>;
}

function PopupButton(props:
    PopupButtonProps &
    {
        popupRef: React.RefObject<HTMLDivElement | null>,
        close: () => void
    }
) : JSX.Element {
    const thisButtonRef = React.useRef<HTMLButtonElement>(null);
    const [disabled, setDisabled] = React.useState(false);
    const possibleFormId = React.useId();

    React.useEffect(() => {
        const form = props.formRef?.current;
        if (form) {
            form.onsubmit ??= (e) => e.preventDefault();
            if (!form.id) {
                form.id = possibleFormId;
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.formRef]);

    const onClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const onClickParams: PopupButtonOnClickParams = {
            event: e,
            button: thisButtonRef.current,
            popup: props.popupRef.current
        };

        const form = props.formRef?.current;
        if (form) {
            if (!form.checkValidity()) return;

            onClickParams.formData = Object.fromEntries(new FormData(form).entries());;
        }

        setDisabled(true);
        const callBackRes = await props.onClick?.(onClickParams);
        if (callBackRes !== false && props?.preventClose !== true){
            props.close();
        }
        else {
            setDisabled(false);
        }
    };

    return <button
        ref={thisButtonRef}
        className={props.className}
        disabled={disabled}
        onClick={onClick}
        form={props.formRef ? (props.formId ?? possibleFormId) : undefined}
        type={props.formRef ? 'submit' : 'button'}
    >
        {props.text}
    </button>;
}

//#endregion

//#region Toaster

export enum ToastType {
    // eslint-disable-next-line no-unused-vars
    Error = 'error',
    // eslint-disable-next-line no-unused-vars
    Warning = 'warning',
    // eslint-disable-next-line no-unused-vars
    Info = 'info',
    // eslint-disable-next-line no-unused-vars
    Success = 'success'
}
export enum ToastPosition {
    // eslint-disable-next-line no-unused-vars
    Top = 'top',
    // eslint-disable-next-line no-unused-vars
    Middle = 'middle',
    // eslint-disable-next-line no-unused-vars
    Bottom = 'bottom'
}
export const Toaster = {
    pop: (text?: ReactNode, type?: ToastType, position: ToastPosition = ToastPosition.Bottom, duration_ms: number = 3000) : HTMLDivElement => {
        const container = document.createElement('div');
        const root = createRoot(container);
        const toastElement = <p className='toast-text' onClick={destroy}>
            {text ?? (type ? type+' toast' : 'Toast')}
        </p>;

        container.classList.add('toast', 'toast-'+position);
        if (type) container.classList.add('toast-'+type);

        document.body.appendChild(container);
        root.render(toastElement);

        function destroy() {
            root?.unmount();
            container?.remove();
        }

        setTimeout(destroy, duration_ms);

        return container;
    },
    popError: Toaster_popError,
    popWarning: Toaster_popWarning,
    popInfo: Toaster_popInfo,
    popSuccess: Toaster_popSuccess
};

// eslint-disable-next-line no-unused-vars
function Toaster_popError(text?: ReactNode, position?: ToastPosition, duration_ms?: number): HTMLDivElement;
// eslint-disable-next-line no-redeclare, no-unused-vars
function Toaster_popError(text?: ReactNode, duration_ms?: number, position?: ToastPosition): HTMLDivElement;
// eslint-disable-next-line no-redeclare
function Toaster_popError(text?: ReactNode, arg1?: ToastPosition | number, arg2?: number | ToastPosition): HTMLDivElement {
    let position: ToastPosition | undefined = ToastPosition.Bottom;
    let duration_ms: number | undefined = 5000;

    [arg1, arg2].forEach(arg => {
        if (typeof arg === 'number') duration_ms = arg;
        else if (typeof arg === 'string') position = arg as ToastPosition;
    });

    return Toaster.pop(text, ToastType.Error, position, duration_ms);
}

// eslint-disable-next-line no-unused-vars
function Toaster_popWarning(text?: ReactNode, position?: ToastPosition, duration_ms?: number): HTMLDivElement;
// eslint-disable-next-line no-redeclare, no-unused-vars
function Toaster_popWarning(text?: ReactNode, duration_ms?: number, position?: ToastPosition): HTMLDivElement;
// eslint-disable-next-line no-redeclare
function Toaster_popWarning(text?: ReactNode, arg1?: ToastPosition | number, arg2?: number | ToastPosition): HTMLDivElement {
    let position: ToastPosition | undefined = ToastPosition.Bottom;
    let duration_ms: number | undefined = 4000;

    [arg1, arg2].forEach(arg => {
        if (typeof arg === 'number') duration_ms = arg;
        else if (typeof arg === 'string') position = arg as ToastPosition;
    });

    return Toaster.pop(text, ToastType.Warning, position, duration_ms);
}

// eslint-disable-next-line no-unused-vars
function Toaster_popInfo(text?: ReactNode, position?: ToastPosition, duration_ms?: number): HTMLDivElement;
// eslint-disable-next-line no-redeclare, no-unused-vars
function Toaster_popInfo(text?: ReactNode, duration_ms?: number, position?: ToastPosition): HTMLDivElement;
// eslint-disable-next-line no-redeclare
function Toaster_popInfo(text?: ReactNode, arg1?: ToastPosition | number, arg2?: number | ToastPosition): HTMLDivElement {
    let position: ToastPosition | undefined = ToastPosition.Bottom;
    let duration_ms: number | undefined = 3000;

    [arg1, arg2].forEach(arg => {
        if (typeof arg === 'number') duration_ms = arg;
        else if (typeof arg === 'string') position = arg as ToastPosition;
    });

    return Toaster.pop(text, ToastType.Info, position, duration_ms);
}

// eslint-disable-next-line no-unused-vars
function Toaster_popSuccess(text?: ReactNode, position?: ToastPosition, duration_ms?: number): HTMLDivElement;
// eslint-disable-next-line no-redeclare, no-unused-vars
function Toaster_popSuccess(text?: ReactNode, duration_ms?: number, position?: ToastPosition): HTMLDivElement;
// eslint-disable-next-line no-redeclare
function Toaster_popSuccess(text?: ReactNode, arg1?: ToastPosition | number, arg2?: number | ToastPosition): HTMLDivElement {
    let position: ToastPosition | undefined = ToastPosition.Bottom;
    let duration_ms: number | undefined = 3000;

    [arg1, arg2].forEach(arg => {
        if (typeof arg === 'number') duration_ms = arg;
        else if (typeof arg === 'string') position = arg as ToastPosition;
    });

    return Toaster.pop(text, ToastType.Success, position, duration_ms);
}

//#endregion