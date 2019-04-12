const { EOL } = require('os');
const path = require('path');
const TSDocgenPlugin = require('react-docgen-typescript-webpack-plugin');

const { relative, join } = path;

module.exports = ({ config }) => {
  config.resolve.extensions.push('.ts', '.tsx');
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    exclude: /node_modules/,
    enforce: 'pre',
    loader: 'tslint-loader',
    options: {
      emitErrors: true,
    },
  });
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    exclude: /node_modules/,
    use: [
      {
        loader: 'babel-loader',
        options: {
          plugins: ['babel-plugin-typescript-to-proptypes'],
        }
      },
      {
        loader: 'ts-loader',
        options: {
          configFile: path.resolve(__dirname, '../tsconfig.json'),
          transpileOnly: true,
          errorFormatter(error, colors) {
            const messageColor = error.severity === 'warning' ? colors.bold.yellow : colors.bold.red;
            return (
              colors.grey('[ts1] ')
              + messageColor(error.severity.toUpperCase())
              + (error.file === ''
                ? ''
                : messageColor(' in ')
                + colors.bold.cyan(
                  `${relative(__dirname, join(error.context, error.file))}(${error.line},${error.character})`,

                ))
              + EOL
              + messageColor(`      TS${error.code}: ${error.content}`)
            );
          },
        },
      },
    ],
  });
  config.plugins.push(new TSDocgenPlugin());
  return config;
};