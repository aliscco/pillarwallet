// @flow
/*
    Pillar Wallet: the personal data locker
    Copyright (C) 2019 Stiftung Pillar Project
    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/
import * as React from 'react';
import { WebView } from 'react-native-webview';
import { useBackHandler } from '@react-native-community/hooks';
import type { NavigationScreenProp } from 'react-navigation';
import { getEnv } from 'configs/envConfig';
import t from 'translations/translate';

// components
import { Wrapper } from 'components/Layout';
import ContainerWithHeader from 'components/Layout/ContainerWithHeader';
import Spinner from 'components/Spinner';

// services
import { firebaseRemoteConfig } from 'services/firebase';

// constants
import { REMOTE_CONFIG } from 'constants/remoteConfigConstants';


type Props = {
  onWebViewMessage?: Function,
  navigation: NavigationScreenProp<mixed>,
  onWebViewNavigate?: Function,
  onRef?: Function,
  title?: string,
  isVisible?: boolean,
  webViewRef?: WebView,
  urlPath?: string,
  goBackDismiss?: boolean,
  isKnowledgeBaseUrl?: boolean,
};

const renderLoading = () => <Spinner style={{ alignSelf: 'center', position: 'absolute', top: '50%' }} />;

const RecoveryPortalWebView = ({
  onWebViewMessage,
  title,
  onWebViewNavigate,
  isVisible = true,
  navigation,
  onRef,
  urlPath = '',
  goBackDismiss,
  isKnowledgeBaseUrl,
}: Props) => {
  let webViewRef;
  let canWebViewNavigateBack = false;
  // eslint-disable-next-line i18next/no-literal-string
  const knowledgeBaseUrl = firebaseRemoteConfig.getString(REMOTE_CONFIG.KNOWLEDGE_BASE_URL);
  const uri = isKnowledgeBaseUrl ? knowledgeBaseUrl : `${getEnv().RECOVERY_PORTAL_URL}/${urlPath}`;

  const handleNavigationBack = () => {
    if (!webViewRef || !canWebViewNavigateBack) {
      if (goBackDismiss) {
        navigation.dismiss();
        return;
      }
      navigation.goBack();
      return;
    }
    webViewRef.goBack();
  };

  useBackHandler(() => {
    handleNavigationBack();
    return true;
  });

  const onNavigationStateChange = (webViewNavigationState) => {
    canWebViewNavigateBack = !!webViewNavigationState.canGoBack;
    if (onWebViewNavigate) onWebViewNavigate(webViewNavigationState);
  };

  return (
    <ContainerWithHeader
      headerProps={{
        centerItems: [{ title: title || t('auth:recoveryPortal.title.recoveryPortal') }],
        customOnBack: handleNavigationBack,
      }}
    >
      <Wrapper style={{ flex: 1 }}>
        {!isVisible && renderLoading()}
        {isVisible &&
          <WebView
            ref={(ref) => { webViewRef = ref; if (onRef) onRef(webViewRef); }}
            source={{ uri }}
            onNavigationStateChange={onNavigationStateChange}
            allowsBackForwardNavigationGestures={false}
            onMessage={onWebViewMessage}
            renderLoading={renderLoading}
            originWhitelist={['*']}
            cacheEnabled={false}
            thirdPartyCookiesEnabled={false}
            hideKeyboardAccessoryView
            startInLoadingState
            incognito
          />
        }
      </Wrapper>
    </ContainerWithHeader>
  );
};

export default RecoveryPortalWebView;
