import React from 'react';
import clsx from 'clsx';
import * as icons from './icons';

export function EditableDateInput(props: {
    defaultDate?: Date;
    className?: string;
    style?: React.CSSProperties;
    buttonContent: React.ReactNode;
    buttonClassName?: string;
    buttonStyle?: React.CSSProperties;
    inputTitle?: React.ReactNode;
    // eslint-disable-next-line no-unused-vars
    onSave: (date: Date) => Promise<boolean | void> | boolean | void;
}): React.JSX.Element {
    const [showInput, setShowInput] = React.useState<boolean>(false);
    const [date, setDate] = React.useState<Date>(props.defaultDate ?? new Date());

    async function onSave() {
        const res = await props.onSave(date);
        if (res !== false) {
            setShowInput(false);
        }
    }
    function onClose() {
        setShowInput(false);
        setDate(props.defaultDate ?? new Date());
    }

    return <div style={props.style} className={clsx('editable-date-input', props.className)}>
        {!showInput
            ? <button onClick={() => setShowInput(true)} style={props.buttonStyle} className={props.buttonClassName}>
                {props.buttonContent}
            </button>
            : <div className='bg-color-lightgray p-5 br-10'>
                {props.inputTitle}
                <input
                    className='w-100 fs-20 mt-3'
                    type='date'
                    value={date.toInputDateValue()}
                    onChange={e => setDate(new Date(e.currentTarget.value))}
                />
                <div className='d-flex'>
                    <button
                        onClick={onClose}
                        className='flex-center center-v w-50 mr-3 bg-color-red'
                        style={{padding: '2px 0'}}
                    >
                        <icons.Cross color='white'/>
                    </button>
                    <button
                        onClick={onSave}
                        className='flex-center center-v w-50 ml-3 bg-color-limegreen'
                        style={{padding: '2px 0'}}
                    >
                        <icons.Check color='white'/>
                    </button>
                </div>
            </div>
        }
    </div>;
}