import React from 'react';
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
  );