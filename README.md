# react-make-ellipsis &middot; ![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg) [![npm version](https://img.shields.io/npm/v/react-make-ellipsis.svg?style=flat)](https://www.npmjs.com/package/react-make-ellipsis)

Ellipsis component for [React](https://reactjs.org/).

## Installation

Using [npm](https://www.npmjs.com/):

    $ npm install --save react-make-ellipsis
    
## Demo

[storybook](https://vipcxj.github.io/react-make-ellipsis/)

## Example
    
```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import Ellipsis from 'react-make-ellipsis';

const text = 'very long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long text';

const App = (
  <div>
    <div id="provide width">
      <Ellipsis 
        style={{ width: '50%', minWidth: 100 }}
        text={text}
        minFontSizeRadio={0.6}
        flex
      />
    </div>
    <div id="provide-container-node-which-has-width" style={{ width: 300 }}>
      <span style={{ display: 'inline-block', width: 100 }}>label</span>
      <Ellipsis
        containerNode="#provide-container-node-which-has-width" // the selector of the container node. the element variable is also supported.
        containerLeftSpace={100} // 100 is the width of label
        text={text}
        minFontSizeRadio={0.6}
        flex
      />
    </div>
    <div id="provide-container-node-which-has-width" style={{ width: 300 }}>
      <span className="container-left-node" style={{ display: 'inline-block' }}>prefix</span>
      <Ellipsis
        containerNode="#provide-container-node-which-has-width" // the selector of the container node. the element variable is also supported.
        containerLeftNodes=".container-left-node"
        text={text}
        minFontSizeRadio={0.6}
        flex
      />
      <span className="container-left-node" style={{ display: 'inline-block' }}>postfix</span>
    </div>
    <div id="provide-container-node-which-has-width" style={{ width: 500 }}>
      <Ellipsis
        containerNode="#provide-container-node-which-has-width" // the selector of the container node. the element variable is also supported.
        maxWidth={300} // the show text width will not longer than 300 not 500
        text={text}
        minFontSizeRadio={0.6}
        flex
      />
    </div>
    <div style={{ display: 'inline-block', width: 200 }}>left space</div>
  </div>
);

const root = document.getElementById('root');
ReactDOM.render(<App />, root);

```

## Properties
- *text?* - **string**

  The text content.
  
- *width?* - **number**

  the component width. the width in style is also supported. this prop will override the width in style prop.
  
- *maxWidth?* - **number**

  the component max width. the maxWidth in style is also supported. this prop will override the maxWidth in style prop.
  If the given width ( the width prop or width in style prop or the width of containerNode minus containerLeftSpace ) is greater than the max width,
  the max width will be used to calculate the show text.
  
- *minWidth?* - **number**

  the component min width. the minWidth in style is also supported. this prop will override the minWidth in style prop.
  If the given width ( the width prop or width in style prop or the width of containerNode minus containerLeftSpace ) is smaller than the min width,
  the min width will be used to calculate the show text.
  
- *minFontSize?* - **number|string**

  When specify, enable the auto font size mode. If the text size is too long for the container, 
  reduce the font size until it fit the container or equal `minFontSize`. 
  Support string with unit `px`, `pt`, `%` and number means `px`
  
- *minFontSizeRadio?* - **number**

  When specify, enable the auto font size mode. If the text size is too long for the container, 
  reduce the font size until it fit the container or equal `minFontSizeRadio * initialFontSize`.
  Range from `0` to `1`.

- *style?* - **CSSProperties**

  The component style.
  
- *className?* - **string**

  The component className.
  
- *ellipsis?* - **ReactNode** - `<span> ...</span>`

  The custom ellipsis component.
  
- *onEllipsis?* - **(showEllipsis: boolean, showText: string, text?: string) => void**

  callback when show text changed.
  
- *flex?* - **boolean** - false

  The flex mode. work well when the text is in a flex container and the browser support flex feature.
  
- *containerNode?* - **Element | string**

  the container node which use to calc the content width. The selector is also supported.
  
- *containerLeftSpace?* - **number**

  the content width is ( the width of `containerNode` or the node which container the component ) - `containerLeftSpace`
  
- *containerLeftNodes?* - **string | Element | Element[]**

  the nodes used to calc the `containerLeftSpace`. will be omitted if `containerLeftSpace` has been used.
  The selector is also supported.

## Ref object

- *update* - **() => void**

  Force recalc the ellipsis.
  
- *showText* - **string**

  The text shown.
  
- *showEllipsis* - **boolean**

  whether ellipsis show or not.
  
- *node* - **HTMLNode**

  the component root node.
  
## Note

The component require its width not depend on its content. Because its real content depends on its width.
So a computed width should be provide. It can be provided by the width prop, the width in style prop or the width of containerNode prop.
If the width prop is a percent value, one ancestor of the component should has a concrete width.
The flex model is encouraged, because it support providing the width without specify concrete width.