import React, {forwardRef, Ref, useImperativeHandle, useLayoutEffect, useRef, useState} from 'react';
import ResizeObserver from 'resize-observer-polyfill';

const PIXELS_PER_INCH = 96;
const EL_FOR_TEST_DEFAULT_FONTSIZE = 'el-for-test-default-font-size';
function getDefaultFontSize(){
    let test = document.getElementById(EL_FOR_TEST_DEFAULT_FONTSIZE);
    if (!test) {
        test = document.createElement('div');
        test.id = EL_FOR_TEST_DEFAULT_FONTSIZE;
        test.style.cssText = 'display:inline-block; padding:0; line-height:1; position:absolute; visibility:hidden; font-size:1em';
        test.appendChild(document.createTextNode('M'));
        document.body.appendChild(test);
    }
    return Number.parseFloat(getComputedStyle(test).fontSize);
}

function toPx(value: string | number): number {
    if (typeof value === 'number') {
        return value;
    }
    if (value.endsWith('px')) {
        return Number.parseFloat(value);
    } else if (value.endsWith('pt')) {
        return Number.parseFloat(value) * PIXELS_PER_INCH / 72;
    } else if (value.endsWith('in')) {
        return Number.parseFloat(value) * PIXELS_PER_INCH;
    } else if (value.endsWith('cm')) {
        return Number.parseFloat(value) * PIXELS_PER_INCH / 2.54;
    } else if (value.endsWith('mm')) {
        return Number.parseFloat(value) * PIXELS_PER_INCH / 25.4;
    } else if (value.endsWith('pc')) {
        return Number.parseFloat(value) * PIXELS_PER_INCH / 6;
    } else if (value.endsWith('em') || value.endsWith('rem') || value.endsWith('%')) {
        const em = getDefaultFontSize();
        if (value.endsWith('em') || value.endsWith('rem')) {
            return Number.parseFloat(value) * em;
        } else {
            return Number.parseFloat(value) * em / 100;
        }
    } else {
        return Number.NaN;
    }
}

const setSpanText = (span: HTMLSpanElement, text: string) => {
    span.innerText = text;
};

const adjustFontSize = (vcSpan: HTMLSpanElement, baseFontSize: number, minFontSize: number, cWidth: number) => {
    let vcWidth = getSpanWidth(vcSpan);
    if (vcWidth !== cWidth) {
        let fontSize = Number.parseFloat(getComputedStyle(vcSpan).fontSize);
        if (vcWidth > cWidth) {
            while (vcWidth > cWidth && fontSize > minFontSize) {
                fontSize = Math.max(fontSize * 0.95, minFontSize);
                vcSpan.style.fontSize = `${fontSize}px`;
                vcWidth = getSpanWidth(vcSpan);
            }
        } else {
            let lstFontSize;
            while (vcWidth < cWidth && fontSize < baseFontSize) {
                lstFontSize = fontSize;
                fontSize = Math.min(fontSize * 1.05, baseFontSize);
                vcSpan.style.fontSize = `${fontSize}px`;
                vcWidth = getSpanWidth(vcSpan);
            }
            if (vcWidth > cWidth) {
                fontSize = lstFontSize;
                vcSpan.style.fontSize = `${fontSize}px`;
            }
        }
        return fontSize;
    } else {
        return undefined;
    }
};

const calcShowText = (span: HTMLSpanElement, text: string, cWidth: number, eWidth: number) => {
    const lstShowText: string | null = span.innerText;
    const cWidth2 = Math.max(cWidth - eWidth, 0);
    let end: number = (lstShowText && lstShowText.length) || text.length;
    let showText: string = lstShowText || text;
    setSpanText(span, showText);
    let sWidth: number = getSpanWidth(span);
    if (sWidth > cWidth) {
        end = Math.floor(cWidth2 / sWidth * end);
        showText = text.substring(0, end);
        setSpanText(span, showText);
        sWidth = getSpanWidth(span);
    } else if (sWidth < cWidth) {
        end = Math.max(Math.min(Math.ceil(cWidth2 / sWidth * end), text.length), end + 1);
        showText = text.substring(0, end);
        setSpanText(span, showText);
        sWidth = getSpanWidth(span);
    }
    while (end > 0 && ((end === text.length && sWidth > cWidth) || (end !== text.length && sWidth > cWidth2))) {
        --end;
        showText = text.substring(0, end);
        setSpanText(span, showText);
        sWidth = getSpanWidth(span);
    }
    while (end < text.length && sWidth < cWidth2) {
        ++end;
        showText = text.substring(0, end);
        setSpanText(span, showText);
        sWidth = getSpanWidth(span);
    }
    if (end > 0 && ((end === text.length && sWidth > cWidth) || (end !== text.length && sWidth > cWidth2))) {
        --end;
        showText = text.substring(0, end);
        setSpanText(span, showText);
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
    minFontSize?: number | string;
    minFontSizeRadio?: number;
    style?: React.CSSProperties;
    className?: string;
    ellipsis?: React.ReactNode;
    onEllipsis?: (showEllipsis: boolean, showText: string, text?: string) => void;
    flex?: boolean;
}

const virtualBlockStyle: React.CSSProperties = {
    display: 'block',
    overflow: 'hidden',
    position: 'fixed',
    top: '-9999px',
    whiteSpace: 'pre',
};

const showTextStyle: React.CSSProperties = {
    whiteSpace: 'pre',
};

const defaultEllipsis = <span>...</span>;

const checkShowEllipsis = (showText?: string, text?: string) => {
    return (showText || '') !== (text || '');
};

function getSpanWidth(span: HTMLSpanElement): number {
    const rect = span.getClientRects()[0];
    return rect ? rect.width : 0;
}

export default forwardRef(({text, minFontSize, minFontSizeRadio, style, onEllipsis, ellipsis = defaultEllipsis, flex = false, ...rest}: IEllipsisProps, ref: Ref<IEllipsis>) => {
    const cRef: Ref<HTMLSpanElement> = useRef<HTMLSpanElement>(null);
    const vcRef: Ref<HTMLSpanElement> = useRef<HTMLSpanElement>(null);
    const vRef: Ref<HTMLSpanElement> = useRef<HTMLSpanElement>(null);
    const eRef: Ref<HTMLSpanElement> = useRef<HTMLSpanElement>(null);
    const sRef: Ref<HTMLSpanElement> = useRef<HTMLSpanElement>(null);
    const eRef1: Ref<HTMLSpanElement> = useRef<HTMLSpanElement>(null);
    const [showText, setShowText] = useState<string>();
    const [refresh, setRefresh] = useState<boolean>(true);
    const showEllipsis = checkShowEllipsis(showText, text);
    useImperativeHandle(ref, () => ({
        get showText() { return showText || ''; },
        get showEllipsis() { return checkShowEllipsis(showText, text); },
        update: () => setRefresh(!refresh),
    }), [text, showText, refresh]);
    useLayoutEffect(() => {
        const cSpan = cRef.current!;
        const vcSpan = vcRef.current!;
        const cWidth = getSpanWidth(cSpan);
        const span = vRef.current!;
        const eWidth = getSpanWidth(eRef.current!);
        const observer = new ResizeObserver(() => {
            const rect = cSpan.getClientRects()[0];
            if (rect) {
                const cw = rect.width;
                if (minFontSizeRadio || minFontSize) {
                    const baseFontSize = Number.parseFloat(getComputedStyle(cSpan).fontSize);
                    const minFontSizePx = Math.max(minFontSize && toPx(minFontSize) || baseFontSize * Math.max(Math.min(minFontSizeRadio || 1, 1), 0), 1);
                    const fs = adjustFontSize(vcSpan, baseFontSize, minFontSizePx, cw);
                    if (fs !== undefined) {
                        sRef.current!.style.fontSize = `${fs}px`;
                        eRef1.current!.style.fontSize = `${fs}px`;
                    }
                } else {
                    vcSpan.style.fontSize = undefined;
                    sRef.current!.style.fontSize = undefined;
                    eRef1.current!.style.fontSize = undefined;
                }
                const st1 = calcShowText(span, text || '', cw, getSpanWidth(eRef.current!));
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
    }, [text, refresh, ellipsis, minFontSizeRadio, minFontSize]);
    const containerStyle = style ? {
        display: flex ? 'flex' : 'inline-block',
        ...style,
    } : {
        display: flex ? 'flex' : 'inline-block',
    };
    return (
        <span ref={cRef} style={containerStyle} {...rest}>
            <span key="virtualEllipsis" ref={vcRef} style={virtualBlockStyle}>
                <span ref={vRef} />
                <span ref={eRef}>{ ellipsis }</span>
            </span>
            <span key="showText" style={showTextStyle} ref={sRef}>{showText}</span>
            <span key="ellipsis" ref={eRef1}>
                {showEllipsis ? ellipsis : null}
            </span>
        </span>
    )
})
