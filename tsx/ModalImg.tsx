import React, { type JSX } from 'react';
import clsx from 'clsx';
import { createRoot, type Root } from 'react-dom/client';

export interface ModalImgProps {
    src: string;
    alt?: string;
    imgClassName?: string;
    popupClassName?: string;
    holderClassName?: string;
    modalImgClassName?: string;
}

export function ModalImg(props: ModalImgProps): JSX.Element {
    let container: HTMLDivElement | null = null;
    let root: Root | null;
    let popupImgElement: JSX.Element | null;

    function onClick(): void {
        container = document.createElement('div');

        // Classes
        container.classList.add('popup', 'modal-img');
        props?.popupClassName?.split(' ').forEach(c => container?.classList.add(c));

        // Render
        document.body.appendChild(container);
        root = createRoot(container);
        popupImgElement = <PopupImg {...props} close={close}/>;
        root.render(popupImgElement);
    }

    function close() {
        if (root && container) {
            root?.unmount();
            container?.remove();
            root = null;
            container = null;
            popupImgElement = null;
        }
    };

    return <img
        className={clsx(props.imgClassName)}
        src={props.src}
        onClick={onClick}
        alt={props.alt}
    />;
}

function PopupImg(props: ModalImgProps & {close: () => void}): JSX.Element {
    const imgRef = React.useRef<HTMLImageElement>(null);

    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') props.close(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        const img = imgRef.current;
        if (!img) return;

        function resize() {
            if (!img) return;

            const screenRatio = window.innerWidth / window.innerHeight;
            const imgRatio = img.naturalWidth / img.naturalHeight;
            const isHorizontal = imgRatio > screenRatio;

            if (isHorizontal) {
                img.style.width = '100%';
                img.style.height = 'auto';
            }
            else {
                img.style.width = 'auto';
                img.style.height = '100%';
            }
        }

        if (img.complete) resize();
        else img.onload = resize;

        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, [props.src]);

    return <div
        className={clsx('popup-holder', 'modal-img-holder', 'center-text', props.holderClassName)}
        style={{ display: 'block' }}
        onClick={() => props.close()}
    >
        <button className="red-cross" style={{position: 'absolute', top: 5, right: 5}}>
            <div className='red-cross-line-a'></div>
            <div className='red-cross-line-b'></div>
        </button>
        <img
            ref={imgRef}
            className={clsx('p-10 br-25 border-box', props.modalImgClassName)}
            src={props.src}
            alt={props.alt}
        />
    </div>;
}