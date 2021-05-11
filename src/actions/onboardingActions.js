/* eslint-disable no-template-curly-in-string */
/* eslint-disable i18next/no-literal-string */
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
import { ethers } from 'ethers';
import { NavigationActions } from 'react-navigation';
import Intercom from 'react-native-intercom';
import isEmpty from 'lodash.isempty';
import t from 'translations/translate';

// constants
import { SET_WALLET, UPDATE_WALLET_BACKUP_STATUS, SDK_REASON_USERNAME_FAILED } from 'constants/walletConstants';
import {
  APP_FLOW,
  NEW_WALLET,
  TUTORIAL_FLOW,
  HOME,
  REFERRAL_INCOMING_REWARD,
  NEW_PROFILE,
  RECOVERY_PORTAL_WALLET_RECOVERY_STARTED,
} from 'constants/navigationConstants';
import { SET_USER } from 'constants/userConstants';
import { UPDATE_SESSION } from 'constants/sessionConstants';
import {
  RESET_ONBOARDING,
  SET_FINISHING_ONBOARDING,
  SET_IMPORTING_WALLET,
  SET_ONBOARDING_ERROR,
  SET_ONBOARDING_PIN_CODE,
  SET_ONBOARDING_USER,
  SET_ONBOARDING_USERNAME_REGISTRATION_FAILED,
  SET_ONBOARDING_WALLET,
  SET_REGISTERING_USER,
} from 'constants/onboardingConstants';
import { DEFAULT_ACCOUNTS_ASSETS_DATA_KEY, UPDATE_ASSETS } from 'constants/assetsConstants';
import { REMOTE_CONFIG } from 'constants/remoteConfigConstants';

// components
import Toast from 'components/Toast';

// utils
import { generateMnemonicPhrase } from 'utils/wallet';
import { isCaseInsensitiveMatch, reportErrorLog, reportLog, logBreadcrumb } from 'utils/common';
import { updateOAuthTokensCB } from 'utils/oAuth';
import { transformAssetsToObject } from 'utils/assets';

// services
import { navigate } from 'services/navigation';
import { getExchangeRates } from 'services/assets';
import { firebaseMessaging, firebaseRemoteConfig } from 'services/firebase';

// actions
import { importSmartWalletAccountsAction, managePPNInitFlagAction } from 'actions/smartWalletActions';
import { saveDbAction } from 'actions/dbActions';
import { checkForWalletBackupToastAction, encryptAndSaveWalletAction } from 'actions/walletActions';
import { fetchSmartWalletTransactionsAction } from 'actions/historyActions';
import { logEventAction } from 'actions/analyticsActions';
import { fetchBadgesAction } from 'actions/badgesActions';
import { getWalletsCreationEventsAction } from 'actions/userEventsActions';
import { loadRemoteConfigWithUserPropertiesAction } from 'actions/remoteConfigActions';
import { setRatesAction } from 'actions/ratesActions';
import { resetAppServicesAction, resetAppStateAction } from 'actions/authActions';
import { fetchReferralRewardAction } from 'actions/referralsActions';
import { checkIfKeyBasedWalletHasPositiveBalanceAction } from 'actions/keyBasedAssetTransferActions';
import { checkAndFinishSmartWalletRecoveryAction } from 'actions/recoveryPortalActions';
import { getExchangeSupportedAssetsAction } from 'actions/exchangeActions';
import { importEtherspotAccountsAction, initEtherspotServiceAction } from 'actions/etherspotActions';
import { getTutorialDataAction } from 'actions/cmsActions';

// other
import { initialAssets } from 'fixtures/assets';

// types
import type { Dispatch, GetState } from 'reducers/rootReducer';
import type SDKWrapper from 'services/api';


export const setupUserAction = (username: ?string, recoveryData?: Object) => {
  return async (dispatch: Dispatch, getState: GetState, api: SDKWrapper) => {
    // eslint-disable-next-line i18next/no-literal-string
    logBreadcrumb('onboarding', 'onboardingAction.js: setupUserAction checking for username');
    if (!username) {
      reportLog('setupUserAction failed: no username', { recoveryData });
      return;
    }

    logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching action: ${SET_REGISTERING_USER}');
    dispatch({ type: SET_REGISTERING_USER, payload: true });

    logBreadcrumb(
      'onboarding',
      'onboardingAction.js: Dispatching action: ${SET_ONBOARDING_USERNAME_REGISTRATION_FAILED}',
    );
    dispatch({ type: SET_ONBOARDING_USERNAME_REGISTRATION_FAILED, payload: false }); // reset

    const {
      wallet: { data: wallet },
      session: { data: { isOnline } },
    } = getState();

    // save for future onboarding retry in case anything fails or is offline
    let userInfo = { username };
    logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching action: saveDbAction', userInfo);
    await dispatch(saveDbAction('user', { user: userInfo }, true));

    logBreadcrumb('onboarding', 'onboardingAction.js: checking for privateKey while setupUserAction');
    const privateKey = wallet?.privateKey;
    if (!privateKey) {
      reportLog('setupUserAction failed: no privateKey', { recoveryData });
      logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching action: ${SET_REGISTERING_USER}');
      dispatch({ type: SET_REGISTERING_USER, payload: false });
      return;
    }

    logBreadcrumb('onboarding', 'onboardingAction.js: checking user is online');
    if (isOnline) {
      api.init();
      logBreadcrumb('onboarding', 'onboardingAction.js: user is online, registering for FCM Remote Notifications');
      // we us FCM notifications so we must register for FCM, not regular native Push-Notifications
      await firebaseMessaging.registerForRemoteNotifications().catch((error) => {
        reportErrorLog('firebaseMessaging.registerForRemoteNotifications failed', { error });
      });
      await firebaseMessaging.requestPermission().catch(() => null);

      logBreadcrumb('onboarding', 'onboardingAction.js: user is online, getting fcmToken for firebase messaging');
      const fcmToken = await firebaseMessaging.getToken().catch((error) => {
        reportErrorLog('firebaseMessaging.getToken failed', { error });
        return null;
      });

      if (fcmToken) {
        logBreadcrumb('onboarding', 'onboardingAction.js: fcmToken recieved.. sending Token to intercom');
        await Intercom.sendTokenToIntercom(fcmToken).catch(() => null);
      }

      logBreadcrumb('onboarding', 'onboardingAction.js: setupUserAction.. registering for auth server');
      const sdkWallet: Object = await api.registerOnAuthServer(privateKey, fcmToken, username, recoveryData);

      if (!!sdkWallet?.error || !sdkWallet?.walletId) {
        logBreadcrumb('onboarding', 'onboardingAction.js: checking for sdkWallet error reason');
        const usernameFailed = sdkWallet?.reason === SDK_REASON_USERNAME_FAILED;
        const error = usernameFailed
          ? t('auth:error.registrationApiUsernameFailed')
          : t('auth:error.registrationApiFailedWithNoReason');
        reportErrorLog('setupUserAction user registration failed', { error, username, recoveryData });
        if (usernameFailed) {
          logBreadcrumb(
            'onboarding',
            'onboardingAction.js: Dispatching action: ${SET_ONBOARDING_USERNAME_REGISTRATION_FAILED}',
          );
          dispatch({ type: SET_ONBOARDING_USERNAME_REGISTRATION_FAILED, payload: true });
        }
        logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching action: ${SET_ONBOARDING_ERROR}', error);
        dispatch({ type: SET_ONBOARDING_ERROR, payload: error });
        return;
      }

      const { walletId } = sdkWallet;
      userInfo = { ...userInfo, walletId };

      const oAuthTokens = {
        refreshToken: sdkWallet.refreshToken,
        accessToken: sdkWallet.accessToken,
      };

      logBreadcrumb('onboarding', 'onboardingAction.js: updating Auth Tokens');
      const updateOAuth = updateOAuthTokensCB(dispatch);
      api.init(updateOAuth, oAuthTokens);
      await updateOAuth(oAuthTokens);

      logBreadcrumb('onboarding', 'onboardingAction.js: recieving updated user info');
      const updatedUserInfo = await api.userInfo(walletId);
      if (!isEmpty(updatedUserInfo)) {
        userInfo = { ...userInfo, ...updatedUserInfo };
      }

      logBreadcrumb('onboarding', 'onboardingAction.js: setting username');
      api.setUsername(userInfo.username);

      logBreadcrumb('onboarding', 'onboardingAction.js: saving updated user info in DB');
      // save updated
      dispatch(saveDbAction('user', { user: userInfo }, true));

      logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching action: ${UPDATE_SESSION}');
      dispatch({ type: UPDATE_SESSION, payload: { fcmToken } });

      logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching action: logEventAction: wallet created');
      dispatch(logEventAction('wallet_created'));
    }

    logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching action: ${SET_USER}');
    dispatch({ type: SET_USER, payload: userInfo });

    logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching action: ${SET_REGISTERING_USER}');
    dispatch({ type: SET_REGISTERING_USER, payload: false });
  };
};

export const setupWalletAction = (enableBiometrics?: boolean) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    const {
      onboarding: {
        pinCode,
        wallet: importedWallet, // wallet was already added in import step
        isPortalRecovery,
      },
    } = getState();

    logBreadcrumb('onboarding', 'onboardingAction.js: setupWalletAction checking for pinCode');
    if (!pinCode) {
      reportLog('setupWalletAction failed: no pinCode');
      return;
    }

    const isImported = !!importedWallet;

    logBreadcrumb('onboarding', 'onboardingAction.js: creating new mnemonic if importedWallet is not present');
    // will return new mnemonic if importedWallet is not present
    const mnemonic = importedWallet?.mnemonic || generateMnemonicPhrase();

    // create wallet object
    const ethersWallet = ethers.Wallet.fromMnemonic(mnemonic);

    // raw private key will be removed from reducer once registration finishes
    const { address, privateKey } = ethersWallet;

    logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching action: ${SET_WALLET}');
    dispatch({ type: SET_WALLET, payload: { address, privateKey } });

    logBreadcrumb('onboarding', 'onboardingAction.js: Checking for recovery pending and backup status');
    const isRecoveryPending = !!isPortalRecovery;
    const backupStatus = { isImported, isBackedUp: !!isImported, isRecoveryPending };

    // dispatch to reducer only, will be stored with encryptAndSaveWalletAction
    logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching action: ${UPDATE_WALLET_BACKUP_STATUS}');
    dispatch({ type: UPDATE_WALLET_BACKUP_STATUS, payload: backupStatus });

    // encrypt and store
    logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching wallet action: encryptAndSaveWalletAction');
    await dispatch(encryptAndSaveWalletAction(pinCode, ethersWallet, backupStatus, enableBiometrics));

    logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching Db action: saveDbAction for saving app settings');
    dispatch(saveDbAction('app_settings', { appSettings: { wallet: +new Date() } }));
  };
};

export const setupAppServicesAction = (privateKey: ?string) => {
  return async (dispatch: Dispatch, getState: GetState, api: SDKWrapper) => {
    const {
      wallet: { backupStatus },
      user: { data: { walletId } },
      session: { data: { isOnline } },
    } = getState();

    logBreadcrumb('onboarding', 'onboardingAction.js: setupAppServicesAction.. checking for private key');
    if (!privateKey) {
      reportLog('setupAppServicesAction failed: no privateKey');
      return;
    }

    // set default in case account cannot be created offline
    const defaultInitialAssets = isOnline && walletId ?
      await api.fetchInitialAssets(walletId)
      : transformAssetsToObject(initialAssets);

    const defaultAssets = { [DEFAULT_ACCOUNTS_ASSETS_DATA_KEY]: defaultInitialAssets };

    logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching action: ${UPDATE_ASSETS}');
    dispatch({ type: UPDATE_ASSETS, payload: defaultAssets });

    logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching Db action: saveDbAction for saving assets');
    dispatch(saveDbAction('assets', { assets: defaultAssets }, true));

    logBreadcrumb('onboarding', 'onboardingAction.js: checking user is online or not');
    // all the calls below require user to be online
    if (!isOnline) return;

    // user might not be registered at this point
    if (walletId) {
      const rates = await getExchangeRates(defaultInitialAssets);

      logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching rates action: setRatesAction');
      dispatch(setRatesAction(rates));

      logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching badges action: fetchBadgesAction');
      dispatch(fetchBadgesAction(false));

      logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching referrals action: fetchReferralRewardAction');
      dispatch(fetchReferralRewardAction());

      // create smart wallet account only for new wallets
      logBreadcrumb(
        'onboarding',
        'onboardingAction.js: Dispatching smart wallet action: importSmartWalletAccountsAction',
      );
      await dispatch(importSmartWalletAccountsAction(privateKey));

      logBreadcrumb(
        'onboarding',
        'onboardingAction.js: Dispatching history action: fetchSmartWalletTransactionsAction',
      );
      await dispatch(fetchSmartWalletTransactionsAction());

      logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching smart wallet action: managePPNInitFlagAction');
      dispatch(managePPNInitFlagAction());

      // add wallet created / imported events
      logBreadcrumb(
        'onboarding',
        'onboardingAction.js: Dispatching user event action: getWalletsCreationEventsAction',
      );
      dispatch(getWalletsCreationEventsAction());

      // Etherspot smart wallet silent account creation
      logBreadcrumb(
        'onboarding',
        'onboardingAction.js: Dispatching etherspotActions action: initEtherspotServiceAction',
      );
      await dispatch(initEtherspotServiceAction(privateKey));

      logBreadcrumb(
        'onboarding',
        'onboardingAction.js: Dispatching etherspotActions action: importEtherspotAccountsAction',
      );
      dispatch(importEtherspotAccountsAction());
    }

    // if wallet was imported let's check its balance for key based assets migration
    if (backupStatus.isImported) {
      logBreadcrumb('onboarding', 'onboardingAction.js: wallet was imported Dispatching keyBasedAssetTransferActions');
      dispatch(checkIfKeyBasedWalletHasPositiveBalanceAction());
    }

    // check if wallet backup warning toast needed, balance can only be retrieved online
    logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching wallet action: checkForWalletBackupToastAction');
    dispatch(checkForWalletBackupToastAction());

    logBreadcrumb(
      'onboarding',
      'onboardingAction.js: Dispatching remoteConfig action: loadRemoteConfigWithUserPropertiesAction',
    );
    dispatch(loadRemoteConfigWithUserPropertiesAction());
  };
};

export const finishOnboardingAction = (retry?: boolean, recoveryData?: Object) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching action: ${SET_FINISHING_ONBOARDING}');
    dispatch({ type: SET_FINISHING_ONBOARDING, payload: true });

    // reset on retry
    if (retry) {
      logBreadcrumb('onboarding', 'onboardingAction.js: reset on retry Dispatching action: ${SET_ONBOARDING_ERROR}');
      dispatch({ type: SET_ONBOARDING_ERROR, payload: null });
    }

    const {
      onboarding: { user: onboardingUser },
      user: { data: user },
      wallet: { backupStatus: { isRecoveryPending }, data: walletData },
    } = getState();

    // either retry during onboarding or previously stored username during onboarding
    if (!user?.walletId) {
      logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching action: setupUserAction');
      await dispatch(setupUserAction(onboardingUser?.username || user?.username, recoveryData));
    }

    logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching action: setupAppServicesAction');
    await dispatch(setupAppServicesAction(walletData?.privateKey));

    logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching exchange action: getExchangeSupportedAssetsAction');
    dispatch(getExchangeSupportedAssetsAction());

    logBreadcrumb('onboarding', 'onboardingAction.js: checking if there were error at the time of onboarding ');
    const { errorMessage, usernameRegistrationFailed } = getState().onboarding;

    // do not reset onboarding in case there were errors as retry will happen in app flow
    if (!errorMessage && !usernameRegistrationFailed) {
      logBreadcrumb('onboarding', 'onboardingAction.js: no errors recieved, Dispatching action ${RESET_ONBOARDING}');
      dispatch({ type: RESET_ONBOARDING });
    } else {
      reportErrorLog('onboardingAction.js: errors recieved retry will happen in application', errorMessage);
    }

    // reset if recovery was pending as it's successful recover by this step
    if (isRecoveryPending) {
      logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching action: ${UPDATE_WALLET_BACKUP_STATUS}');
      dispatch({ type: UPDATE_WALLET_BACKUP_STATUS, payload: { isRecoveryPending: false } });

      logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching Db action: saveDbAction');
      dispatch(saveDbAction('wallet', { wallet: { backupStatus: { isRecoveryPending: false } } }));
    }

    logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching cms action: getTutorialDataAction');
    await dispatch(getTutorialDataAction());

    logBreadcrumb('onboarding', 'checking for FEATURE_ONBOARDING flag for enable onboarding');
    const enableOnboarding = firebaseRemoteConfig.getString(REMOTE_CONFIG.FEATURE_ONBOARDING);

    const { onboarding: { tutorialData }, referrals: { referralToken } } = getState();
    const BASIC_FLOW = tutorialData && enableOnboarding ? TUTORIAL_FLOW : HOME;

    if (tutorialData && referralToken) {
      // show Tutorial first, then navigate to Referral flow when it's finished/skipped
      logBreadcrumb(
        'onboarding',
        'tutorial data and referal token exist application will show tutorial first and then referral flow',
      );
      navigate(NavigationActions.navigate({
        routeName: APP_FLOW,
        params: { nextNavigationRouteName: REFERRAL_INCOMING_REWARD },
        action: NavigationActions.navigate({ routeName: TUTORIAL_FLOW }),
      }));
    } else {
      // check if user was referred to install the app and navigate accordingly
      logBreadcrumb(
        'onboarding',
        'checking if user was referred to install the app and application will navigate accoridngly',
      );
      const routeName = referralToken ? REFERRAL_INCOMING_REWARD : BASIC_FLOW;
      navigate(NavigationActions.navigate({
        routeName: APP_FLOW,
        params: {},
        action: NavigationActions.navigate({ routeName }),
      }));
    }

    logBreadcrumb(
      'onboarding',
      'onboardingAction.js: finishOnboardingAction completed, Dispatching action: ${SET_FINISHING_ONBOARDING}',
    );
    dispatch({ type: SET_FINISHING_ONBOARDING, payload: false });
  };
};

export const beginOnboardingAction = (enableBiometrics?: boolean) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    // pass current onboarding, referrals and some session values to keep after redux state reset
    const {
      onboarding,
      referrals,
      session: {
        data: {
          isOnline,
          translationsInitialised,
          fallbackLanguageVersion,
          sessionLanguageCode,
          sessionLanguageVersion,
        },
      },
    } = getState();

    logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching auth action: resetAppStateAction');
    dispatch(resetAppStateAction({
      onboarding,
      referrals,
      session: {
        data: {
          isOnline,
          translationsInitialised,
          fallbackLanguageVersion,
          sessionLanguageCode,
          sessionLanguageVersion,
        },
      },
    }));

    navigate(NavigationActions.navigate({ routeName: NEW_WALLET }));

    logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching auth action: resetAppServicesAction');
    await dispatch(resetAppServicesAction());

    logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching action: setupWalletAction');
    await dispatch(setupWalletAction(enableBiometrics));

    logBreadcrumb('onboarding', 'onboardingAction.js: Checking if wallet import is pending');
    // checks if wallet import is pending and in this state we don't want to auth any users yet
    if (onboarding.isPortalRecovery) {
      navigate(NavigationActions.navigate({
        routeName: APP_FLOW,
        params: {},
        action: NavigationActions.navigate({ routeName: RECOVERY_PORTAL_WALLET_RECOVERY_STARTED }),
      }));

      logBreadcrumb(
        'onboarding',
        'onboardingAction.js: wallet import is pending.. Dispatching action: checkAndFinishSmartWalletRecoveryAction',
      );
      dispatch(checkAndFinishSmartWalletRecoveryAction());
      return;
    }

    logBreadcrumb(
      'onboarding',
      'onboardingAction.js: beginOnboarding Action completed.. Dispatching action: finishOnboarding',
    );
    dispatch(finishOnboardingAction());
  };
};

export const importWalletFromMnemonicAction = (mnemonicInput: string) => {
  return async (dispatch: Dispatch, getState: GetState, api: SDKWrapper) => {
    logBreadcrumb(
      'onboarding',
      'onboardingAction.js: Dispatching action: importWalletFromMnemonicAction ${SET_IMPORTING_WALLET}',
    );
    dispatch({ type: SET_IMPORTING_WALLET });

    let importedWallet;
    try {
      importedWallet = ethers.Wallet.fromMnemonic(mnemonicInput);
    } catch (e) {
      // keep error unsent in case it contains mnemonic phrase
    }

    if (!importedWallet) {
      logBreadcrumb(
        'onboarding',
        'onboardingAction.js: Dispatching action: ${SET_ONBOARDING_ERROR}',
        t('auth:error.incorrectBackupPhrase.default'),
      );
      dispatch({ type: SET_ONBOARDING_ERROR, payload: t('auth:error.incorrectBackupPhrase.default') });
      return;
    }

    logBreadcrumb('onboarding', 'onboardingAction.js: Trying to validate address of registered wallet user');
    api.init();
    const registeredWalletUser = await api.validateAddress(importedWallet.address);
    if (registeredWalletUser?.walletId) {
      const {
        walletId,
        username,
        profileImage,
      } = registeredWalletUser;

      logBreadcrumb(
        'onboarding',
        'onboardingAction.js: registered wallet user dispatching action: ${SET_ONBOARDING_USER}',
        { username },
      );
      dispatch({ type: SET_ONBOARDING_USER, payload: { walletId, username, profileImage } });
    }

    const {
      mnemonic: { phrase: mnemonic },
      address,
      privateKey,
    } = importedWallet;

    logBreadcrumb('onboarding', 'onboardingAction.js:  Dispatching action: ${SET_ONBOARDING_WALLET}');
    dispatch({ type: SET_ONBOARDING_WALLET, payload: { mnemonic, address, privateKey } });

    logBreadcrumb('onboarding', 'onboardingAction.js: wallet imported from Mnemonic Action');
    dispatch(logEventAction('wallet_imported', { method: 'Words Phrase' }));

    navigate(NavigationActions.navigate({ routeName: NEW_PROFILE }));
  };
};

let usernameCheckOfflineToastShown = false;

export const resetUsernameCheckAction = (resetOfflineToast?: boolean) => {
  return (dispatch: Dispatch) => {
    if (resetOfflineToast) usernameCheckOfflineToastShown = false;

    logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching action: ${SET_ONBOARDING_USER}');
    dispatch({ type: SET_ONBOARDING_USER, payload: null });

    logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching action: ${SET_ONBOARDING_ERROR}');
    dispatch({ type: SET_ONBOARDING_ERROR, payload: null });
  };
};

export const resetOnboardingAction = () => ({ type: RESET_ONBOARDING });

export const resetOnboardingAndNavigateAction = (routeName: string) => {
  return (dispatch: Dispatch) => {
    logBreadcrumb('onboarding', 'onboardingAction.js: Dispatched action: resetOnboardingAction ${RESET_ONBOARDING}');
    dispatch(resetOnboardingAction());
    navigate(NavigationActions.navigate({ routeName }));
  };
};

export const checkUsernameAvailabilityAction = (username: string) => {
  return async (dispatch: Dispatch, getState: GetState, api: SDKWrapper) => {
    logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching action: resetUsernameCheckAction');
    dispatch(resetUsernameCheckAction());

    logBreadcrumb(
      'onboarding',
      'onboardingAction.js: checking user state, if offline proceeding with local registeration',
    );
    // if user is offline then proceed with local registration
    if (!getState()?.session?.data?.isOnline) {
      if (!usernameCheckOfflineToastShown) {
        logBreadcrumb('onboarding', 'onboardingAction.js: showing Toast message user is offline');
        Toast.closeAll(); // just in case another offline toast is showing from welcome screen
        Toast.show({
          message: t('auth:toast.userIsOffline'),
          emoji: 'satellite_antenna',
        });
        usernameCheckOfflineToastShown = true;
      }

      logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching action: ${SET_ONBOARDING_USER}');
      dispatch({
        type: SET_ONBOARDING_USER,
        payload: { username },
      });
      return;
    }

    logBreadcrumb('onboarding', 'onboardingAction.js: searching for username}');
    api.init();
    const result: {
      status?: number,
      username?: string,
      message?: string,
    } = await api.usernameSearch(username);

    const usernameTaken = isCaseInsensitiveMatch(result?.username, username);

    if (result?.status === 400 || usernameTaken) {
      const errorMessage = result?.message || t('auth:error.invalidUsername.default');
      reportLog(
        'onboardingAction.js checkUsernameAvailability action failed',
        usernameTaken ? t('auth:error.invalidUsername.taken') : errorMessage,
      );
      logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching action: ${SET_ONBOARDING_ERROR}');
      dispatch({
        type: SET_ONBOARDING_ERROR,
        payload: usernameTaken ? t('auth:error.invalidUsername.taken') : errorMessage,
      });
      return;
    }

    logBreadcrumb(
      'onboarding',
      'onboardingAction.js: checkUsernameAvailabilityAction done...Dispatching action: ${SET_ONBOARDING_USER}',
      username,
    );
    dispatch({
      type: SET_ONBOARDING_USER,
      payload: { username },
    });
  };
};

export const setOnboardingPinCodeAction = (pinCode: string) => {
  return async (dispatch: Dispatch) => {
    logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching action: ${SET_ONBOARDING_PIN_CODE}');
    dispatch({
      type: SET_ONBOARDING_PIN_CODE,
      payload: pinCode,
    });
  };
};

export const resetWalletImportErrorAction = () => {
  return async (dispatch: Dispatch) => {
    logBreadcrumb('onboarding', 'onboardingAction.js: Dispatching action: ${SET_ONBOARDING_ERROR}');
    dispatch({
      type: SET_ONBOARDING_ERROR,
      payload: null,
    });
  };
};
