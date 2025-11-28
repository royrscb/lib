import React from 'react';
import clsx from 'clsx';
import * as icons from './icons';
import { generateUuid } from './uuid';

export interface BaseEditableInputProps<T> {
    className?: string;
    style?: React.CSSProperties;
    button: EditableInputButtonProps;
    value: T | null;
    // eslint-disable-next-line no-unused-vars
    onSave: (value: T | null) => Promise<boolean | void> | boolean | void;
    inputTitle?: React.ReactNode;
    showEditor?: boolean;
    nullable?: boolean;
    requireValue?: boolean;
}
export interface EditableInputButtonProps {
    className?: string;
    style?: React.CSSProperties;
    content: React.ReactNode;
}

export function TextInput(props: BaseEditableInputProps<string> & {
    placeHolder?: string;
}): React.JSX.Element {
    return <EditableInputWrapper<string>
        {...props}
        renderInput={(value, setValue) =>
            <input
                required={props.requireValue}
                autoFocus
                className='w-100 fs-20 mt-3'
                type='text'
                value={value ?? ''}
                onChange={e => setValue(e.currentTarget.value)}
                placeholder={props.placeHolder}
            />
        }
    />;
}

export function TextAreaInput(props: BaseEditableInputProps<string> & {
    rows?: number;
    placeHolder?: string;
}): React.JSX.Element {
    return <EditableInputWrapper<string>
        {...props}
        renderInput={(value, setValue) =>
            <textarea
                required={props.requireValue}
                autoFocus
                className='w-100 fs-20 mt-3'
                value={value ?? ''}
                onChange={e => setValue(e.currentTarget.value)}
                rows={props.rows ?? 3}
                placeholder={props.placeHolder}
            />
        }
    />;
}

export function DateInput(props: BaseEditableInputProps<Date> & {
    min?: Date;
    max?: Date;
}): React.JSX.Element {
    return <EditableInputWrapper<Date>
        {...props}
        renderInput={(value, setValue) =>
            <input
                className='w-100 fs-20 mt-3'
                type='date'
                value={value?.toInputDateValue()}
                min={props.min?.toInputDateValue()}
                max={props.max?.toInputDateValue()}
                onChange={e => setValue(new Date(e.currentTarget.value))}
            />
        }
    />;
}

function EditableInputWrapper<T>(props: BaseEditableInputProps<T> & {
    // eslint-disable-next-line no-unused-vars
    renderInput: (value: T | null, setValue: React.Dispatch<React.SetStateAction<T | null>>) => React.ReactNode;
}): React.JSX.Element {
    const formRef = React.useRef<HTMLFormElement | null>(null);

    const [showEditor, setShowEditor] = React.useState<boolean>(
        props.showEditor || !!props.requireValue && !props.value
    );
    const [value, setValue] = React.useState<T | null>(
        !props.nullable && props.value === null ? ('' as T) : props.value
    );
    const showForm = value !== null || !props.nullable || props.requireValue;

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const res = await props.onSave(value);
        if (res !== false) {
            setShowEditor(false);
        }
    }
    function onClose() {
        setShowEditor(false);
        setValue(props.value);
    }

    React.useEffect(() => console.log(value), [value]);

    return <div style={props.style} className={clsx('editable-input', props.className)}>
        {!showEditor
            ? <PreviewButton {...props.button} showInput={() => setShowEditor(true)}/>
            : <div className='bg-color-lightgray p-5 br-10'>
                {props.inputTitle}
                <form hidden={!showForm} ref={formRef} onSubmit={onSubmit}>
                    {props.renderInput(value, setValue)}
                </form>
                <SetNullInput<T> {...props} value={value} setValue={setValue} />
                <CloseSaveButtons
                    onClose={props.requireValue && !props.value ? undefined : onClose}
                    formRef={formRef}
                />
            </div>
        }
    </div>;
}

function SetNullInput<T>(props: BaseEditableInputProps<T> & {
    value: T | null;
    setValue: React.Dispatch<React.SetStateAction<T | null>>;
}): React.JSX.Element | undefined {
    if (!props.nullable || props.requireValue)
        return;

    const setNullInputId = `setNull-${generateUuid()}`;

    return <div className='mt-3 mb-3'>
        <input
            id={setNullInputId}
            type='checkbox'
            className='mr-5'
            checked={props.value === null}
            onChange={e => {
                const checked = e.currentTarget.checked;
                props.setValue(checked ? null : props.value ?? ('' as T));
            }}
        />
        <label htmlFor={setNullInputId} className='fs-smaller-2 no-select'>null</label>
    </div>;
}

function PreviewButton(props: EditableInputButtonProps & {
    showInput: () => void;
}): React.JSX.Element {
    return <button
        onClick={() => props.showInput()}
        style={props.style}
        className={props.className}
    >
        {props.content}
    </button>;
}

function CloseSaveButtons(props: {
    onClose?: () => void;
    formRef: React.RefObject<HTMLFormElement | null>;
}): React.JSX.Element {
    return <div className='d-flex mt-5'>
        <button
            disabled={!props.onClose}
            onClick={props.onClose}
            className='flex-center center-v w-50 mr-3 bg-color-red'
            style={{padding: '2px 0', marginBottom: 0}}
        >
            <icons.Cross color='white'/>
        </button>
        <button
            onClick={() => props.formRef.current?.requestSubmit()}
            type='submit'
            className='flex-center center-v w-50 ml-3 bg-color-limegreen'
            style={{padding: '2px 0', marginBottom: 0}}
        >
            <icons.Check color='white'/>
        </button>
    </div>;
}