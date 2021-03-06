import React, {
    forwardRef,
    Ref,
    RefObject,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState
} from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import { getCssPixels } from './utils';

if (!Element.prototype.matches) {
    Element.prototype.matches =
        (Element.prototype as any).matchesSelector ||
        (Element.prototype as any).mozMatchesSelector ||
        (Element.prototype as any).msMatchesSelector ||
        (Element.prototype as any).oMatchesSelector ||
        Element.prototype.webkitMatchesSelector ||
        function (s: string) {
            const matches = (this.parentElement !== this && this.parentElement || this.document || this.ownerDocument).querySelectorAll(s);
            let i = matches.length;
            // tslint:disable-next-line:no-empty
            while (--i >= 0 && matches.item(i) !== this) {}
            return i > -1;
        }
}

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
    node: HTMLSpanElement;
}

interface IBaseEllipsisProps {
    text?: string;
    width?: number;
    maxWidth?: number;
    minWidth?: number;
    minFontSize?: number | string;
    minFontSizeRadio?: number;
    style?: React.CSSProperties;
    className?: string;
    ellipsis?: React.ReactNode;
    onEllipsis?: (showEllipsis: boolean, showText: string, text?: string) => void;
    flex?: boolean;
    containerNode?: Element | string;
    containerLeftSpace?: number;
}

export interface IEllipsisProps extends IBaseEllipsisProps {
    containerLeftNodes?: Element | string | Element[];
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

const ellipsisStyle: React.CSSProperties = {
    whiteSpace: 'pre',
};

const defaultEllipsis = <span>...</span>;

const checkShowEllipsis = (showText?: string, text?: string) => {
    return (showText || '') !== (text || '');
};

function getSpanWidth(span: Element, leftSpace: number = 0): number {
    const rect = span.getClientRects()[0];
    return rect ? Math.max(rect.width - leftSpace, 0) : 0;
}

function findNode(current?: Element, node?: Element | string): Element | null {
    if (!node) return null;
    if (typeof node !== 'string') return node;
    let target = current && current.parentElement || null;
    while (target && !target.matches(node)) {
        target = target.parentElement;
    }
    if (!target && current) {
        let container = current.parentNode;
        target = container && container.querySelector(node) || null;
        while (container && !target) {
            container = container.parentNode;
            target = container && container.querySelector(node) || null;
        }

    }
    return target;
 }

function findNodes(current?: Element, node?: Element | string | Element[]): Element[] {
    if (!node) return [];
    if (typeof node !== 'string') return Array.isArray(node) ? node.filter(n => n) : (node ? [node] : []);
    if (current) {
        let container = current.parentNode;
        let target = container && container.querySelectorAll(node) || null;
        while (container && target && target.length === 0) {
            container = container.parentNode;
            target = container && container.querySelectorAll(node) || null;
        }
        return target ? Array.prototype.slice.call(target) : [];
    } else {
        return [];
    }
}

const DEFAULT_FONT_SIZE = toPx('1em');

function fit(
    cRef: RefObject<HTMLSpanElement>,
    vcRef: RefObject<HTMLSpanElement>,
    vRef: RefObject<HTMLSpanElement>,
    eRef: RefObject<HTMLSpanElement>,
    sRef: RefObject<HTMLSpanElement>,
    eRef1: RefObject<HTMLSpanElement>,
    text: string | undefined,
    setShowText: React.Dispatch<React.SetStateAction<string>>,
    onEllipsis: IEllipsisProps['onEllipsis'],
    containerNode: string | Element | undefined,
    containerLeftSpace: number | undefined,
    minFontSize: number | string | undefined,
    minFontSizeRadio: number | undefined,
) {
    const cSpan = cRef.current!;
    const maxWidth = getCssPixels(cSpan, 'max-width');
    const minWidth = getCssPixels(cSpan, 'min-width');
    const eWidth = getSpanWidth(eRef.current!);
    const cNode = findNode(cSpan, containerNode) || cSpan;
    const vcSpan = vcRef.current!;
    const span = vRef.current!;
    let cw = getSpanWidth(cNode, containerLeftSpace);
    cw = (typeof maxWidth !== 'undefined' && !isNaN(maxWidth)) ? Math.min(cw, maxWidth) : cw;
    cw = (typeof minWidth !== 'undefined' && !isNaN(minWidth)) ? Math.max(cw, minWidth) : cw;
    if (minFontSizeRadio || minFontSize) {
        const baseFontSize = getCssPixels(cSpan, 'font-size') || DEFAULT_FONT_SIZE;
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
    const st1 = calcShowText(span, text || '', cw, eWidth);
    const se1 = checkShowEllipsis(st1, text);
    if (onEllipsis) {
        onEllipsis(se1, st1, text);
    }
    setShowText(st1);
}

const Base = forwardRef((
    {
        text,
        width,
        maxWidth,
        minWidth,
        minFontSize,
        minFontSizeRadio,
        style,
        onEllipsis,
        ellipsis = defaultEllipsis,
        flex = false,
        containerNode,
        containerLeftSpace = 0,
        ...rest
    }: IBaseEllipsisProps, ref: Ref<IEllipsis>) => {
    const cRef: Ref<HTMLSpanElement> = useRef<HTMLSpanElement>(null);
    const vcRef: Ref<HTMLSpanElement> = useRef<HTMLSpanElement>(null);
    const vRef: Ref<HTMLSpanElement> = useRef<HTMLSpanElement>(null);
    const eRef: Ref<HTMLSpanElement> = useRef<HTMLSpanElement>(null);
    const sRef: Ref<HTMLSpanElement> = useRef<HTMLSpanElement>(null);
    const eRef1: Ref<HTMLSpanElement> = useRef<HTMLSpanElement>(null);
    const [showText, setShowText] = useState<string>();
    const [refresh, setRefresh] = useState<boolean>(true);
    const showEllipsis = checkShowEllipsis(showText, text);
    if (width) {
        containerNode = containerLeftSpace = undefined;
    }
    // noinspection JSUnusedGlobalSymbols
    useImperativeHandle(ref, () => ({
        node: cRef.current,
        showEllipsis: checkShowEllipsis(showText, text),
        showText: showText || '',
        update: () => setRefresh(!refresh),
    }), [text, showText, refresh]);
    const containerStyle: React.CSSProperties = React.useMemo(() => style ? {
        display: flex ? 'flex' : 'inline-block',
        ...style,
        maxWidth: maxWidth || style.maxWidth,
        minWidth: minWidth || style.minWidth,
        width: width || style.width,
    } : {
        display: flex ? 'flex' : 'inline-block',
        maxWidth: maxWidth || style.maxWidth,
        minWidth: minWidth || style.minWidth,
        width: width || style.width,
    }, [style, flex, minWidth, maxWidth, width]);
    useLayoutEffect(() => {
        const observer = new ResizeObserver(() => {
            fit(cRef, vcRef, vRef, eRef, sRef, eRef1, text, setShowText, onEllipsis, containerNode, containerLeftSpace, minFontSize, minFontSizeRadio);
        });
        fit(cRef, vcRef, vRef, eRef, sRef, eRef1, text, setShowText, onEllipsis, containerNode, containerLeftSpace, minFontSize, minFontSizeRadio);
        const cSpan = cRef.current!;
        const cNode = findNode(cSpan, containerNode) || cSpan;
        observer.observe(cNode);
        return () => {
            observer.disconnect();
        }
    }, [text, refresh, ellipsis, minFontSizeRadio, minFontSize, containerNode, containerLeftSpace, containerStyle]);
    return (
        <span ref={cRef} style={containerStyle} {...rest}>
            <span key="virtualEllipsis" ref={vcRef} style={virtualBlockStyle}>
                <span ref={vRef} />
                <span ref={eRef}>{ ellipsis }</span>
            </span>
            <span key="showText" style={showTextStyle} ref={sRef}>{showText}</span>
            <span key="ellipsis" style={ellipsisStyle} ref={eRef1}>
                { showEllipsis ? ellipsis : null }
            </span>
        </span>
    )
});

function calcAllWidth(nodes: Element[]) {
    let value = 0;
    nodes.forEach(node => {
        const rects = node.getClientRects();
        for (let i = 0; i < rects.length; ++i) {
            const rect = rects.item(i);
            if (rect) {
                value += rect.width;
            }
        }
    });
    return value;
}

export default forwardRef((props: IEllipsisProps, ref: Ref<IEllipsis>) => {
    const { containerLeftNodes, ...restProps } = props;
    const bRef = useRef<IEllipsis>(null);
    const [space, setSpace] = useState<number>(0);
    useImperativeHandle(ref, () => bRef.current, []);
    useEffect(() => {
        const nodes = findNodes(bRef.current.node, containerLeftNodes);
        const observer = new ResizeObserver(() => {
            setSpace(calcAllWidth(nodes));
        });
        setSpace(calcAllWidth(nodes));
        nodes.forEach(node => observer.observe(node));
        return () => {
            observer.disconnect();
        }
    }, [containerLeftNodes]);
    return (
        <Base ref={bRef} containerLeftSpace={space || undefined} {...restProps} />
    );
});
