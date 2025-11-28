import React from 'react';
import clsx from 'clsx';
import * as icons from './icons';
import { generateUuid } from './uuid';

export interface BaseEditableInputProps<T> {
    className?: string;
    style?: React.CSSProperties;
    button: EditableInputButtonProps;
    initialValue: T | null;
    // eslint-disable-next-line no-unused-vars
    onSave: (value: T | null) => Promise<boolean | void> | boolean | void;
    inputName?: string;
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

// Inputs ---------------------------------------

export function TextInput(props: BaseEditableInputProps<string> & {
    placeHolder?: string;
}): React.JSX.Element {
    return <EditableInputWrapper<string>
        {...props}
        renderInput={(text, setText) =>
            <input
                name={props.inputName ?? 'editableText'}
                required={props.requireValue}
                autoFocus
                className='w-100'
                type='text'
                value={text ?? ''}
                onChange={e => setText(e.currentTarget.value)}
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
        renderInput={(text, setText) =>
            <textarea
                name={props.inputName ?? 'editableTextarea'}
                required={props.requireValue}
                autoFocus
                className='w-100'
                value={text ?? ''}
                onChange={e => setText(e.currentTarget.value)}
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
    function getValidInputDateValueOrEmpty(date: Date | undefined | null): string {
        return date && !isNaN(date.getTime())
            ? date.toInputDateValue() : '';
    }

    return <EditableInputWrapper<Date>
        {...props}
        renderInput={(date, setDate) =>
            <input
                name={props.inputName ?? 'editableDate'}
                required={props.requireValue}
                className='w-100'
                type='date'
                value={getValidInputDateValueOrEmpty(date)}
                min={getValidInputDateValueOrEmpty(props.min)}
                max={getValidInputDateValueOrEmpty(props.max)}
                onChange={e => setDate(new Date(e.currentTarget.value))}
            />
        }
    />;
}

// Private --------------------------------------

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

function EditableInputWrapper<T>(props: BaseEditableInputProps<T> & {
    // eslint-disable-next-line no-unused-vars
    renderInput: (value: T | null, setValue: React.Dispatch<React.SetStateAction<T | null>>) => React.ReactNode;
}): React.JSX.Element {
    const formRef = React.useRef<HTMLFormElement | null>(null);

    const needUrgentValue = !props.initialValue && !!props.requireValue;
    const [showEditor, setShowEditor] = React.useState<boolean>(props.showEditor || needUrgentValue);
    const [value, setValue] = React.useState<T | null>(props.initialValue);
    const [isNullChecked, setIsNullChecked] = React.useState<boolean>(props.initialValue === null);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const res = await props.onSave(value);
        if (res !== false) {
            setShowEditor(false);
        }
    }
    function onClose() {
        setShowEditor(false);
        setValue(props.initialValue);
    }

    return <div style={props.style} className={clsx('editable-input', props.className)}>
        {!showEditor
            ? <PreviewButton {...props.button} showInput={() => setShowEditor(true)}/>
            : <div className='bg-color-lightgray p-5 br-10'>
                {props.inputTitle}
                <form
                    hidden={isNullChecked && !props.requireValue && props.nullable}
                    ref={formRef}
                    onSubmit={onSubmit}
                    className='mt-3'
                >
                    {props.renderInput(value, setValue)}
                </form>
                <SetNullInput<T>
                    {...props}
                    isChecked={isNullChecked} setIsChecked={setIsNullChecked}
                    setValue={setValue}
                />
                <CloseSaveButtons
                    onClose={needUrgentValue ? undefined : onClose}
                    onSave={() => formRef.current!.requestSubmit()}
                />
            </div>
        }
    </div>;
}

function SetNullInput<T>(props: BaseEditableInputProps<T> & {
    isChecked: boolean;
    setIsChecked: React.Dispatch<React.SetStateAction<boolean>>;
    setValue: React.Dispatch<React.SetStateAction<T | null>>;
}): React.JSX.Element | undefined {
    if (props.requireValue || !props.nullable)
        return;

    const setNullInputId = `setNull-${generateUuid()}`;

    return <div className='mt-3 mb-3'>
        <input
            id={setNullInputId}
            type='checkbox'
            className='mr-5'
            checked={props.isChecked}
            onChange={e => {
                const checked = e.currentTarget.checked;

                props.setIsChecked(checked);
                props.setValue(checked ? null : props.initialValue);
            }}
        />
        <label htmlFor={setNullInputId} className='fs-smaller-2 no-select'>null</label>
    </div>;
}

function CloseSaveButtons(props: {
    onClose?: () => void;
    onSave: () => void;
}): React.JSX.Element {
    return <div className='close-save-buttons d-flex mt-5'>
        <button
            disabled={!props.onClose}
            onClick={props.onClose}
            className='flex-center center-v w-50 mr-3 bg-color-red'
            style={{padding: '2px 0', marginBottom: 0}}
        >
            <icons.Cross color='white'/>
        </button>
        <button
            onClick={props.onSave}
            type='submit'
            className='flex-center center-v w-50 ml-3 bg-color-limegreen'
            style={{padding: '2px 0', marginBottom: 0}}
        >
            <icons.Check color='white'/>
        </button>
    </div>;
}
