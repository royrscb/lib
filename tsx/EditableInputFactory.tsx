import React from 'react';
import clsx from 'clsx';
import * as icons from './icons';

export interface BaseEditableInputProps {
    className?: string;
    style?: React.CSSProperties;
    button: EditableInputButtonProps;
    inputTitle?: React.ReactNode;
}
export interface EditableInputButtonProps {
    className?: string;
    style?: React.CSSProperties;
    content: React.ReactNode;
}

export function TextInput(props: BaseEditableInputProps & {
    defaultValue?: string;
    placeHolder?: string;
    // eslint-disable-next-line no-unused-vars
    onSave: (text: string) => Promise<boolean | void> | boolean | void;
}): React.JSX.Element {
    const [showInput, setShowInput] = React.useState<boolean>(false);
    const [text, setText] = React.useState<string>(props.defaultValue ?? '');

    return <div style={props.style} className={clsx('editable-date-input', props.className)}>
        {!showInput
            ? <PreviewButton {...props.button} showInput={() => setShowInput(true)}/>
            : <EditableInputWrapper
                inputTitle={props.inputTitle}
                onSave={() => props.onSave(text)}
                hideInput={() => setShowInput(false)}
                resetDefault={() => setText(props.defaultValue ?? '')}
            >
                <input
                    autoFocus
                    className='w-100 fs-20 mt-3'
                    type='text'
                    value={text}
                    onChange={e => setText(e.currentTarget.value)}
                    placeholder={props.placeHolder}
                />
            </EditableInputWrapper>
        }
    </div>;
}

export function TextAreaInput(props: BaseEditableInputProps & {
    defaultValue?: string;
    rows?: number;
    placeHolder?: string;
    // eslint-disable-next-line no-unused-vars
    onSave: (text: string) => Promise<boolean | void> | boolean | void;
}): React.JSX.Element {
    const [showInput, setShowInput] = React.useState<boolean>(false);
    const [text, setText] = React.useState<string>(props.defaultValue ?? '');

    return <div style={props.style} className={clsx('editable-date-input', props.className)}>
        {!showInput
            ? <PreviewButton {...props.button} showInput={() => setShowInput(true)}/>
            : <EditableInputWrapper
                inputTitle={props.inputTitle}
                onSave={() => props.onSave(text)}
                hideInput={() => setShowInput(false)}
                resetDefault={() => setText(props.defaultValue ?? '')}
            >
                <textarea
                    autoFocus
                    className='w-100 fs-20 mt-3'
                    value={text}
                    onChange={e => setText(e.currentTarget.value)}
                    rows={props.rows ?? 3}
                    placeholder={props.placeHolder}
                />
            </EditableInputWrapper>
        }
    </div>;
}

export function DateInput(props: BaseEditableInputProps & {
    defaultValue?: Date;
    min?: Date;
    max?: Date;
    // eslint-disable-next-line no-unused-vars
    onSave: (date: Date) => Promise<boolean | void> | boolean | void;
}): React.JSX.Element {
    const [showInput, setShowInput] = React.useState<boolean>(false);
    const [date, setDate] = React.useState<Date>(props.defaultValue ?? new Date());

    return <div style={props.style} className={clsx('editable-date-input', props.className)}>
        {!showInput
            ? <PreviewButton {...props.button} showInput={() => setShowInput(true)}/>
            : <EditableInputWrapper
                inputTitle={props.inputTitle}
                onSave={() => props.onSave(date)}
                hideInput={() => setShowInput(false)}
                resetDefault={() => setDate(props.defaultValue ?? new Date())}
            >
                <input
                    className='w-100 fs-20 mt-3'
                    type='date'
                    value={date.toInputDateValue()}
                    min={props.min?.toInputDateValue()}
                    max={props.max?.toInputDateValue()}
                    onChange={e => setDate(new Date(e.currentTarget.value))}
                />
            </EditableInputWrapper>
        }
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

// TODO: this must be nullable:
// <div>
//     <input
//         id='setNull'
//         type='checkbox'
//         checked={isNull}
//         onChange={e => setIsNull(e.currentTarget.checked)}
//     />
//     <label htmlFor='setNull' className='fs-smaller-2'>
//         null
//     </label>
// </div>
function EditableInputWrapper(props: {
    inputTitle?: React.ReactNode;
    onSave: () => Promise<boolean | void> | boolean | void;
    hideInput: () => void;
    resetDefault: () => void;
    children?: React.ReactNode;
}): React.JSX.Element {
    async function onSave() {
        const res = await props.onSave();
        if (res !== false) {
            props.hideInput();
        }
    }
    function onClose() {
        props.hideInput();
        props.resetDefault();
    }

    return <div className='bg-color-lightgray p-5 br-10'>
        {props.inputTitle}
        {props.children}
        <div className='d-flex mt-5'>
            <button
                onClick={onClose}
                className='flex-center center-v w-50 mr-3 bg-color-red'
                style={{padding: '2px 0', marginBottom: 0}}
            >
                <icons.Cross color='white'/>
            </button>
            <button
                onClick={onSave}
                className='flex-center center-v w-50 ml-3 bg-color-limegreen'
                style={{padding: '2px 0', marginBottom: 0}}
            >
                <icons.Check color='white'/>
            </button>
        </div>
    </div>;
}