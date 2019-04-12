import React, {forwardRef, Ref, useImperativeHandle, useLayoutEffect, useRef, useState} from 'react';
import ResizeObserver from 'resize-observer-polyfill';

const calcShowText = (span: HTMLSpanElement, text: string, cWidth: number, eWidth: number) => {
    const lstShowText: string | null = span.textContent;
    const cWidth2 = Math.max(cWidth - eWidth, 0);
    let end: number = (lstShowText && lstShowText.length) || text.length;
    let showText: string = lstShowText || text;
    span.textContent = showText;
    let sWidth: number = span.getClientRects()[0].width;
    if (end > 0 && sWidth > cWidth) {
        end = Math.floor(cWidth2 / sWidth * end);
        showText = text.substring(0, end);
        span.textContent = showText;
        sWidth = span.getClientRects()[0].width;
        if (end > 0 && ((end === text.length && sWidth > cWidth) || (end !== text.length && sWidth > cWidth2))) {
            while (end > 0 && ((end === text.length && sWidth > cWidth) || (end !== text.length && sWidth > cWidth2))) {
                --end;
                showText = text.substring(0, end);
                span.textContent = showText;
                sWidth = span.getClientRects()[0].width;
            }
        } else if (end < text.length && sWidth < cWidth2) {
            while (end < text.length && sWidth < cWidth2) {
                ++end;
                showText = text.substring(0, end);
                span.textContent = showText;
                sWidth = span.getClientRects()[0].width;
            }
            if (end > 0 && ((end === text.length && sWidth > cWidth) || (end !== text.length && sWidth > cWidth2))) {
                --end;
                showText = text.substring(0, end);
                span.textContent = showText;
            }
        }
    } else if (end < text.length && sWidth < cWidth) {
        end = Math.max(Math.min(Math.ceil(cWidth2 / sWidth * end), text.length), end + 1);
        showText = text.substring(0, end);
        span.textContent = showText;
        sWidth = span.getClientRects()[0].width;
        if (end < text.length && sWidth < cWidth2) {
            while (end < text.length && sWidth < cWidth2) {
                ++end;
                showText = text.substring(0, end);
                span.textContent = showText;
                sWidth = span.getClientRects()[0].width;
            }
            if (end > 0 && ((end === text.length && sWidth > cWidth) || (end !== text.length && sWidth > cWidth2))) {
                --end;
                showText = text.substring(0, end);
                span.textContent = showText;
            }
        } else if (end > 0) {
            while (end > 0 && ((end === text.length && sWidth > cWidth) || (end !== text.length && sWidth > cWidth2))) {
                --end;
                showText = text.substring(0, end);
                span.textContent = showText;
                sWidth = span.getClientRects()[0].width;
            }
        }
    }
    return showText;
};

export interface IEllipsis {
    update: () => void;
    readonly showText: string;
    readonly showEllipsis: boolean;
}

export interface IEllipsisProps {
    text?: string;
    style?: React.CSSProperties;
    className?: string;
    ellipsis?: React.ReactNode;
    onEllipsis?: (showEllipsis: boolean, showText: string, text?: string) => void;
}

const virtualBlockStyle: React.CSSProperties = {
    display: 'block',
    overflow: 'hidden',
    position: 'fixed',
    top: '-9999px',
    whiteSpace: 'nowrap',
};

const defaultEllipsis = <span> ...</span>;

const checkShowEllipsis = (showText?: string, text?: string) => {
    return (showText || '') !== (text || '');
};

export default forwardRef(({text, style, onEllipsis, ellipsis = defaultEllipsis, ...rest}: IEllipsisProps, ref: Ref<IEllipsis>) => {
    const cRef: Ref<HTMLSpanElement> = useRef<HTMLSpanElement>(null);
    const vRef: Ref<HTMLSpanElement> = useRef<HTMLSpanElement>(null);
    const eRef: Ref<HTMLSpanElement> = useRef<HTMLSpanElement>(null);
    const [showText, setShowText] = useState();
    const [refresh, setRefresh] = useState(true);
    const showEllipsis = checkShowEllipsis(showText, text);
    useImperativeHandle(ref, () => ({
        get showText() { return showText || ''; },
        get showEllipsis() { return checkShowEllipsis(showText, text); },
        update: () => setRefresh(!refresh),
    }), [text, showText, refresh]);
    useLayoutEffect(() => {
        const cWidth = cRef.current!.getClientRects()[0].width;
        const span = vRef.current!;
        const eWidth = eRef.current!.getClientRects()[0].width;
        const observer = new ResizeObserver(() => {
            const rect = cRef.current!.getClientRects()[0];
            if (rect) {
                const cw = rect.width;
                const st1 = calcShowText(span, text || '', cw, eWidth);
                const se1 = checkShowEllipsis(st1, text);
                if (onEllipsis) {
                    onEllipsis(se1, st1, text);
                }
                setShowText(st1);
            }
        });
        observer.observe(cRef.current!);
        const st = calcShowText(span, text || '', cWidth, eWidth);
        const se = checkShowEllipsis(st, text);
        if (onEllipsis) {
            onEllipsis(se, st, text);
        }
        setShowText(st);
        return () => {
            observer.disconnect();
        }
    }, [text, refresh, ellipsis]);
    return (
        <span ref={cRef} style={style ? {display: 'inline-block', ...style} : {display: 'inline-block'}} {...rest}>
            <span key="virtualShowText" ref={vRef} style={virtualBlockStyle} />
            <span key="virtualEllipsis" style={virtualBlockStyle}>
                test
                <span ref={eRef}>{ ellipsis }</span>
            </span>
            <span key="showText">{showText}</span>
            <span key="ellipsis">
                {showEllipsis ? ellipsis : null}
            </span>
        </span>
    )
})
