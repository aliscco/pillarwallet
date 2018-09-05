// @flow
import * as React from 'react';
import styled from 'styled-components/native';
import type { NavigationScreenProp } from 'react-navigation';
import { ONBOARDING_HOME } from 'constants/navigationConstants';
import { Wrapper, Container, Footer } from 'components/Layout';
import Button from 'components/Button';
import AnimatedBackground from 'components/AnimatedBackground';
import IFrameModal from 'components/Modals/IFrameModal';
import ButtonText from 'components/ButtonText';
import { CachedImage } from 'react-native-cached-image';

type Props = {
  navigation: NavigationScreenProp<*>,
}

type State = {
  shouldAnimate: boolean,
  showTermsConditionsModal: boolean
}

const pillarLogoSource = require('assets/images/landing-pillar-logo.png');

const PillarLogo = styled(CachedImage)`
  height: 60;
  width: 120;
`;

class Welcome extends React.Component<Props, State> {
  listeners: Object[];

  constructor(props: Props) {
    super(props);
    this.listeners = [];
  }

  state = {
    shouldAnimate: true,
    showTermsConditionsModal: false,
  };

  loginAction = () => {
    this.props.navigation.navigate(ONBOARDING_HOME);
  };

  toggleTermsConditionsModal = () => {
    this.setState({ showTermsConditionsModal: !this.state.showTermsConditionsModal });
  }

  componentDidMount() {
    this.listeners = [
      this.props.navigation.addListener('willFocus', () => this.setState({ shouldAnimate: true })),
      this.props.navigation.addListener('willBlur', () => this.setState({ shouldAnimate: false })),
    ];
  }

  componentWillUnmount() {
    this.listeners.forEach((listenerItem) => {
      listenerItem.remove();
    });
  }

  render() {
    const { showTermsConditionsModal } = this.state;
    return (
      <Container>
        <AnimatedBackground shouldAnimate={this.state.shouldAnimate} />
        <Wrapper fullScreen center>
          <PillarLogo source={pillarLogoSource} />
        </Wrapper>
        <Footer>
          <Button block marginBottom="20px" onPress={this.loginAction} title="Get Started" />
          <ButtonText buttonText="Terms and Conditions" onPress={this.toggleTermsConditionsModal} />
        </Footer>
        <IFrameModal
          isVisible={showTermsConditionsModal}
          modalHide={this.toggleTermsConditionsModal}
          uri="https://pillarproject.io/en/legal/terms-of-use/"
        />
      </Container>
    );
  }
}

export default Welcome;
