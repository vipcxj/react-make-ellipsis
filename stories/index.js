import React, {useEffect, useMemo, useRef, useState} from 'react';
import { storiesOf } from '@storybook/react';
import { number, text, radios, boolean } from '@storybook/addon-knobs';
import Ellipsis from '../src';

const createWidthType = (label, group) => {
  return radios(label, { Pixel: 'pixel', Percent: 'percent' }, 'pixel', group);
};

const createWidth = (label, group, widthType, value) => {
  switch (widthType) {
    case 'pixel':
      return number(label, value, {}, group);
    case 'percent':
      return `${number(label, 100, { range: true, min: 0, max: 100, step: 1 }, group)}%`;
    default:
      return 300;
  }
};

const createMinFontSizeType = (label, group) => {
  return radios(label, { Size: 'size', Radio: 'radio', None: 'none' }, 'none', group);
};

const createMinFontSize = (label, group, type) => {
  switch (type) {
    case 'size':
      return {
        minFontSize: text(label, undefined, group),
      };
    case 'radio':
      return {
        minFontSizeRadio: number(label, 1, { range: true, min: 0, max: 1, step: 0.1 }, group),
      };
    default:
      return  {};
  }
};

const WithCustomContainerNode = (props) => {
  const { labels = [], width, useSelector = false, ...rest } = props;
  labels.length = Math.min(labels.length, 3);
  const ref0 = useRef(null);
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const refs = useMemo(() => {
    const value = [ref1, ref2, ref3];
    value.length = labels.length;
    return value;
  }, [labels.length]);
  const [nodes, setNodes] = useState([]);
  useEffect(() => {
    setNodes(refs.map(ref => ref.current));
  }, [refs]);
  if (useSelector) {
    return (
      <div className="container-for-test" style={{ width }}>
        { labels.map((label, i) => (
          <span key={i} className="label-for-test" style={{ display: 'inline-block' }}>{ label }</span>
        )) }
        <Ellipsis {...rest} containerNode=".container-for-test" containerLeftNodes=".label-for-test" />
      </div>
    )
  } else {
    return (
      <div ref={ref0} style={{ width }}>
        { labels.map((label, i) => (
          <span key={i} ref={refs[i]} style={{ display: 'inline-block' }}>{ label }</span>
        )) }
        <Ellipsis {...rest} containerNode={ref0.current} containerLeftNodes={nodes} />
      </div>
    )
  }
};

storiesOf('ellipsis', module)
  .add(
    'base',
    () => {
      const widthType = createWidthType('Width Type', 'Width');
      const minWidthType = createWidthType('Min Width Type', 'Min Width');
      const minFontSizeType = createMinFontSizeType('Min Font Size Type', 'Text');
      return (
        <Ellipsis
          style={{ width: createWidth('Width', 'Width', widthType, 300), minWidth: createWidth('Min Width', 'Min Width', minWidthType, 50) }}
          text={text('Text', 'gdlgjj;l 尽量少干 根 kjlsjg g 00 -s9 0 -- ds-g-sdg-sg-', 'Text')}
          flex={boolean('flex', false, 'Base')}
          { ...createMinFontSize('Min Font Size', 'Text', minFontSizeType) }
        />
      );
    },
  )
  .add(
    'custom ellipsis',
    () => {
      const widthType = createWidthType('Width Type', 'Width');
      const minWidthType = createWidthType('Min Width Type', 'Min Width');
      const minFontSizeType = createMinFontSizeType('Min Font Size Type', 'Text');
      return (
        <Ellipsis
          style={{ width: createWidth('Width', 'Width', widthType, 300), minWidth: createWidth('Min Width', 'Min Width', minWidthType, 50) }}
          text={text('Text', 'gdlgjj;l 尽量少干 根 kjlsjg g 00 -s9 0 -- ds-g-sdg-sg-', 'Text')}
          ellipsis=" More"
          flex={boolean('flex', false, 'Base')}
          { ...createMinFontSize('Min Font Size', 'Text', minFontSizeType) }
        />
      );
    },
  )
  .add(
    'with custom container node',
    () => {
      const minFontSizeType = createMinFontSizeType('Min Font Size Type', 'Text');
      const width = number('width', 600, { range: true, min: 0, max: 1000, step: 10 }, 'Container');
      const useSelector = boolean('use selector', false, 'Container');
      const labelNum = number('label num', 1, { range: true, min: 1, max: 3, step: 1 }, 'Container');
      const labels = [];
      for (let i = 0; i < labelNum; ++i) {
        labels.push(
          text(`label${i}`, 'label', 'Container')
        );
      }
      return (
        <WithCustomContainerNode
          labels={labels}
          width={width}
          useSelector={useSelector}
          text={text('Text', 'gdlgjj;l 尽量少干 根 kjlsjg g 00 -s9 0 -- ds-g-sdg-sg-', 'Text')}
          { ...createMinFontSize('Min Font Size', 'Text', minFontSizeType) }
        />
      );
    }
  )
  .add(
  'max width mode',
  () => {
    const minFontSizeType = createMinFontSizeType('Min Font Size Type', 'Text');
    const maxWidthType = createWidthType('Max Width Type', 'Width');
    return (
      <div id="container" style={{ width: 800, border: '1px solid black' }}>
        <Ellipsis
          style={{ maxWidth: createWidth('Max Width', 'Width', maxWidthType, 250) }}
          containerNode="#container"
          text={text('Text', 'gdlgjj;l 尽量少干 根 kjlsjg g 00 -s9 0 -- ds-g-sdg-sg-', 'Text')}
          flex={boolean('flex', false, 'Base')}
          { ...createMinFontSize('Min Font Size', 'Text', minFontSizeType) }
        />
      </div>
    );
  }
);