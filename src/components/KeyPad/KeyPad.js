// @flow
import * as React from 'react';
import { Button, StyleSheet } from 'react-native';
import styled from 'styled-components/native';
import keyPadTypes from './keyPadTypes';

const KeyInput = styled.View`
  justify-content: center;
  width: 120;
  height: 55;
`;

const Wrapper = styled.View`
  flex-wrap: wrap;
  flex-direction: row;
  align-self: center;
  width: 360;
  justify-content: flex-end;
`;

type KeyPadButton = {
  label: string,
  value: string,
}

type Props = {
  customButtons?: KeyPadButton[],
  type: string,
  options?: Object,
  onKeyPress: Function,
  style?: StyleSheet.Styles,
  inputColor?: string
}

export default class KeyPad extends React.Component<Props> {
  static defaultProps = {
    type: 'numeric',
  }

  handleKeyPress = (pressedKey: any) => () => {
    this.props.onKeyPress(pressedKey);
  };

  render() {
    const {
      style,
      inputColor,
      type,
      customButtons,
      options,
    } = this.props;
    const buttons = customButtons || (keyPadTypes[type] ? keyPadTypes[type](options) : keyPadTypes.numeric());

    return (
      <Wrapper style={style}>
        {buttons.map(({ label, value }: KeyPadButton) => (
          <KeyInput key={value}>
            <Button color={inputColor} title={label} onPress={this.handleKeyPress(value)} />
          </KeyInput>
        ))}
      </Wrapper>
    );
  }
}
