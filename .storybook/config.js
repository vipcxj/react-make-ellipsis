import { configure } from '@storybook/react';
import { addDecorator } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs/react';
import stories from '../stories';

addDecorator(withKnobs);

configure(() => stories, module);