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
import { createStackNavigator, CardStyleInterpolators } from 'react-navigation-stack';
import type { NavigationScreenProp } from 'react-navigation';
import BackgroundTimer from 'react-native-background-timer';
import { connect } from 'react-redux';
import { AppState } from 'react-native';
import { withTheme } from 'styled-components/native';
import { withTranslation } from 'react-i18next';

// screens
import AssetsScreen from 'screens/Assets';
import AssetScreen from 'screens/Asset';
import AssetSearchScreen from 'screens/AssetSearch/AssetSearch';
import ExchangeScreen from 'screens/Exchange';
import ExchangeConfirmScreen from 'screens/Exchange/ExchangeConfirm';
import ExchangeInfoScreen from 'screens/Exchange/ExchangeInfo';
import ChangePinCurrentPinScreen from 'screens/ChangePin/CurrentPin';
import ChangePinNewPinScreen from 'screens/ChangePin/NewPin';
import ChangePinConfirmNewPinScreen from 'screens/ChangePin/ConfirmNewPin';
import RevealBackupPhraseScreen from 'screens/RevealBackupPhrase';
import SendTokenAmountScreen from 'screens/SendToken/SendTokenAmount';
import SendTokenPinConfirmScreen from 'screens/SendToken/SendTokenPinConfirmScreen';
import SendTokenConfirmScreen from 'screens/SendToken/SendTokenConfirm';
import SendTokenTransactionScreen from 'screens/SendToken/SendTokenTransaction';
import SendCollectibleConfirmScreen from 'screens/SendCollectible/SendCollectibleConfirm';
import PPNSendTokenAmountScreen from 'screens/Tank/SendToken/PPNSendTokenAmount';
import HistoryScreen from 'screens/History';
import HomeScreen from 'screens/Home';
import BackupPhraseScreen from 'screens/BackupPhrase';
import BackupPhraseValidateScreen from 'screens/BackupPhraseValidate';
import CollectibleScreen from 'screens/Collectible';
import WalletConnectHomeScreen from 'screens/WalletConnect/Home';
import WalletConnectConnectedAppsScreen from 'screens/WalletConnect/ConnectedApps';
import WalletConnectConnectorRequestScreen from 'screens/WalletConnect/WalletConnectConnectorRequest';
import WalletConnectCallRequestScreen from 'screens/WalletConnect/CallRequest/WalletConnectCallRequestScreen';
import WalletConnectPinConfirm from 'screens/WalletConnect/WalletConnectPinConfirm';
import EtherspotDeploymentInterjection from 'screens/EtherspotDeploymentInterjection';
import BadgeScreen from 'screens/Badge';
import FundTankScreen from 'screens/Tank/FundTank';
import FundConfirmScreen from 'screens/Tank/FundConfirm';
import SettleBalanceScreen from 'screens/Tank/SettleBalance';
import SettleBalanceConfirmScreen from 'screens/Tank/SettleBalanceConfirm';
import TankWithdrawalScreen from 'screens/Tank/TankWithdrawal';
import TankWithdrawalConfirmScreen from 'screens/Tank/TankWithdrawalConfirm';
import AccountsScreen from 'screens/Accounts';
import PillarNetworkIntro from 'screens/PillarNetwork/PillarNetworkIntro';
import UnsettledAssetsScreen from 'screens/UnsettledAssets';
import SendSyntheticAmountScreen from 'screens/SendSynthetic/SendSyntheticAmount';
import LogoutPendingScreen from 'screens/LogoutPending';
import PPNHomeScreen from 'screens/PPNHome/PPNHome';
import ServicesScreen from 'screens/Services';
import StorybookScreen from 'screens/Storybook';
import MenuScreen from 'screens/Menu';
import AppSettingsScreen from 'screens/Menu/AppSettings';
import CommunitySettingsScreen from 'screens/Menu/CommunitySettings';
import WebViewScreen from 'screens/WebView/WebViewScreen';
import WalletSettingsScreen from 'screens/Menu/WalletSettings';
import PinCodeUnlockScreen from 'screens/PinCodeUnlock';
import WalletActivatedScreen from 'screens/WalletActivated';
import PoolTogetherDashboardScreen from 'screens/PoolTogether/PoolTogetherDashboard';
import PoolTogetherPurchaseScreen from 'screens/PoolTogether/PoolTogetherPurchase';
import PoolTogetherPurchaseConfirmScreen from 'screens/PoolTogether/PoolTogetherPurchaseConfirm';
import PoolTogetherWithdrawScreen from 'screens/PoolTogether/PoolTogetherWithdraw';
import PoolTogetherWithdrawConfirmScreen from 'screens/PoolTogether/PoolTogetherWithdrawConfirm';
import ChooseAssetDepositScreen from 'screens/Lending/ChooseAssetDeposit';
import DepositedAssetsListScreen from 'screens/Lending/DepositedAssetsList';
import ViewDepositedAssetScreen from 'screens/Lending/ViewDepositedAsset';
import EnterDepositAmountScreen from 'screens/Lending/EnterDepositAmount';
import EnterWithdrawAmountScreen from 'screens/Lending/EnterWithdrawAmount';
import DepositTransactionConfirmScreen from 'screens/Lending/DepositTransactionConfirm';
import WithdrawTransactionConfirmScreen from 'screens/Lending/WithdrawTransactionConfirm';
import KeyBasedAssetTransferIntroScreen from 'screens/KeyBasedAssetTransfer/KeyBasedAssetTransferIntro';
import KeyBasedAssetTransferChooseScreen from 'screens/KeyBasedAssetTransfer/KeyBasedAssetTransferChoose';
import KeyBasedAssetTransferEditAmountScreen from 'screens/KeyBasedAssetTransfer/KeyBasedAssetTransferEditAmount';
import KeyBasedAssetTransferConfirmScreen from 'screens/KeyBasedAssetTransfer/KeyBasedAssetTransferConfirm';
import KeyBasedAssetTransferUnlockScreen from 'screens/KeyBasedAssetTransfer/KeyBasedAssetTransferUnlock';
import KeyBasedAssetTransferStatusScreen from 'screens/KeyBasedAssetTransfer/KeyBasedAssetTransferStatus';
import ContactsListScreen from 'screens/Contacts/ContactsList';
import SablierStreamsScreen from 'screens/Sablier/SablierStreams';
import SablierNewStreamScreen from 'screens/Sablier/NewStream';
import SablierNewStreamReviewScreen from 'screens/Sablier/NewStreamReview';
import SablierIncomingStreamScreen from 'screens/Sablier/IncomingStream';
import SablierOutgoingStreamScreen from 'screens/Sablier/OutgoingStream';
import SablierWithdrawScreen from 'screens/Sablier/Withdraw';
import SablierWithdrawReviewScreen from 'screens/Sablier/WithdrawReview';
import RariDepositScreen from 'screens/Rari/RariDeposit';
import RariInfoScreen from 'screens/Rari/RariInfo';
import RariAddDepositScreen from 'screens/Rari/RariAddDeposit';
import RariAddDepositReviewScreen from 'screens/Rari/RariAddDepositReview';
import RariWithdrawScreen from 'screens/Rari/RariWithdraw';
import RariWithdrawReviewScreen from 'screens/Rari/RariWithdrawReview';
import RariTransferScreen from 'screens/Rari/RariTransfer';
import RariTransferReviewScreen from 'screens/Rari/RariTransferReview';
import RariClaimRgtScreen from 'screens/Rari/RariClaimRgt';
import RariClaimRgtReviewScreen from 'screens/Rari/RariClaimRgtReview';
import LiquidityPoolDashboardScreen from 'screens/LiquidityPools/LiquidityPoolDashboard';
import LiquidityPoolsAddLiquidityScreen from 'screens/LiquidityPools/AddLiquidity';
import LiquidityPoolsAddLiquidityReviewScreen from 'screens/LiquidityPools/AddLiquidityReview';
import LiquidityPoolsStakeTokensScreen from 'screens/LiquidityPools/StakeTokens';
import LiquidityPoolsStakeTokensReviewScreen from 'screens/LiquidityPools/StakeTokensReview';
import LiquidityPoolsUnstakeTokensScreen from 'screens/LiquidityPools/UnstakeTokens';
import LiquidityPoolsUnstakeTokensReviewScreen from 'screens/LiquidityPools/UnstakeTokensReview';
import LiquidityPoolsRemoveLiquidityScreen from 'screens/LiquidityPools/RemoveLiquidity';
import LiquidityPoolsRemoveLiquidityReviewScreen from 'screens/LiquidityPools/RemoveLiquidityReview';
import LiquidityPoolsClaimRewardsReviewScreen from 'screens/LiquidityPools/ClaimRewardsReview';
import LiquidityPoolsScreen from 'screens/LiquidityPools/LiquidityPools';
import LiquidityPoolsInfoScreen from 'screens/LiquidityPools/LiquidityPoolsInfo';
import TutorialScreen from 'screens/Tutorial';
import EnsMigrationConfirmScreen from 'screens/EnsMigrationConfirm';
import AddCashScreen from 'screens/AddCash/AddCash';

// components
import Toast from 'components/Toast';
import UsernameFailed from 'components/UsernameFailed';

// actions
import {
  stopListeningNotificationsAction,
  startListeningNotificationsAction,
} from 'actions/notificationsActions';
import { checkForMissedAssetsAction, fetchAllAccountsAssetsBalancesAction } from 'actions/assetsActions';
import { fetchAllCollectiblesDataAction } from 'actions/collectiblesActions';
import { removePrivateKeyFromMemoryAction } from 'actions/walletActions';
import { endWalkthroughAction } from 'actions/walkthroughsActions';
import { handleSystemDefaultThemeChangeAction } from 'actions/appSettingsActions';
import { handleSystemLanguageChangeAction } from 'actions/sessionActions';
import { checkArchanovaSessionIfNeededAction } from 'actions/smartWalletActions';
import { initWalletConnectSessionsAction } from 'actions/walletConnectSessionsActions';

// constants
import {
  MAIN_FLOW,
  ASSETS,
  ASSET,
  ASSET_SEARCH,
  SERVICES_FLOW,
  EXCHANGE,
  EXCHANGE_CONFIRM,
  EXCHANGE_INFO,
  HOME,
  HOME_FLOW,
  HOME_HISTORY,
  ETHERSPOT_DEPLOYMENT_INTERJECTION,
  CHANGE_PIN_FLOW,
  CHANGE_PIN_CURRENT_PIN,
  CHANGE_PIN_NEW_PIN,
  CHANGE_PIN_CONFIRM_NEW_PIN,
  SEND_TOKEN_AMOUNT,
  SEND_TOKEN_CONFIRM,
  SEND_TOKEN_TRANSACTION,
  SEND_TOKEN_FROM_ASSET_FLOW,
  SEND_TOKEN_FROM_CONTACT_FLOW,
  SEND_TOKEN_PIN_CONFIRM,
  REVEAL_BACKUP_PHRASE,
  BACKUP_PHRASE,
  BACKUP_PHRASE_VALIDATE,
  BACKUP_WALLET_IN_SETTINGS_FLOW,
  COLLECTIBLE,
  SEND_COLLECTIBLE_FROM_ASSET_FLOW,
  SEND_COLLECTIBLE_CONFIRM,
  WALLETCONNECT_FLOW,
  WALLETCONNECT,
  WALLETCONNECT_CONNECTED_APPS,
  WALLETCONNECT_CONNECTOR_REQUEST_SCREEN,
  WALLETCONNECT_CALL_REQUEST_SCREEN,
  WALLETCONNECT_PIN_CONFIRM_SCREEN,
  BADGE,
  TANK_SETTLE_FLOW,
  TANK_FUND_FLOW,
  FUND_TANK,
  FUND_CONFIRM,
  SETTLE_BALANCE,
  SETTLE_BALANCE_CONFIRM,
  MANAGE_WALLETS_FLOW,
  ACCOUNTS,
  PILLAR_NETWORK_INTRO,
  MENU,
  PPN_SEND_TOKEN_AMOUNT,
  PPN_SEND_TOKEN_FROM_ASSET_FLOW,
  PPN_SEND_SYNTHETIC_ASSET_FLOW,
  UNSETTLED_ASSETS,
  TANK_WITHDRAWAL_FLOW,
  TANK_WITHDRAWAL,
  TANK_WITHDRAWAL_CONFIRM,
  SEND_SYNTHETIC_AMOUNT,
  LOGOUT_PENDING,
  UNSETTLED_ASSETS_FLOW,
  SERVICES,
  PPN_HOME,
  STORYBOOK,
  WALLET_SETTINGS,
  COMMUNITY_SETTINGS,
  APP_SETTINGS,
  MENU_FLOW,
  CONNECT_FLOW,
  SEND_TOKEN_FROM_HOME_FLOW,
  PIN_CODE,
  WALLET_ACTIVATED,
  LENDING_CHOOSE_DEPOSIT,
  LENDING_DEPOSITED_ASSETS_LIST,
  LENDING_ADD_DEPOSIT_FLOW,
  LENDING_VIEW_DEPOSITED_ASSET,
  LENDING_ENTER_DEPOSIT_AMOUNT,
  LENDING_DEPOSIT_TRANSACTION_CONFIRM,
  LENDING_ENTER_WITHDRAW_AMOUNT,
  LENDING_WITHDRAW_DEPOSIT_FLOW,
  LENDING_WITHDRAW_TRANSACTION_CONFIRM,
  POOLTOGETHER_FLOW,
  POOLTOGETHER_DASHBOARD,
  POOLTOGETHER_PURCHASE,
  POOLTOGETHER_PURCHASE_CONFIRM,
  POOLTOGETHER_WITHDRAW,
  POOLTOGETHER_WITHDRAW_CONFIRM,
  KEY_BASED_ASSET_TRANSFER_INTRO,
  KEY_BASED_ASSET_TRANSFER_CHOOSE,
  KEY_BASED_ASSET_TRANSFER_EDIT_AMOUNT,
  KEY_BASED_ASSET_TRANSFER_CONFIRM,
  KEY_BASED_ASSET_TRANSFER_UNLOCK,
  KEY_BASED_ASSET_TRANSFER_FLOW,
  KEY_BASED_ASSET_TRANSFER_STATUS,
  CONTACTS_LIST,
  CONTACTS_FLOW,
  SABLIER_FLOW,
  SABLIER_STREAMS,
  SABLIER_NEW_STREAM,
  SABLIER_NEW_STREAM_REVIEW,
  SABLIER_INCOMING_STREAM,
  SABLIER_OUTGOING_STREAM,
  SABLIER_WITHDRAW,
  SABLIER_WITHDRAW_REVIEW,
  EXCHANGE_FLOW,
  RARI_FLOW,
  RARI_DEPOSIT,
  RARI_INFO,
  RARI_ADD_DEPOSIT,
  RARI_ADD_DEPOSIT_REVIEW,
  RARI_WITHDRAW,
  RARI_WITHDRAW_REVIEW,
  RARI_TRANSFER,
  RARI_TRANSFER_REVIEW,
  RARI_CLAIM_RGT,
  RARI_CLAIM_RGT_REVIEW,
  WALLETCONNECT_CALL_REQUEST_FLOW,
  LIQUIDITY_POOLS_FLOW,
  LIQUIDITY_POOLS,
  LIQUIDITY_POOL_DASHBOARD,
  LIQUIDITY_POOLS_ADD_LIQUIDITY,
  LIQUIDITY_POOLS_ADD_LIQUIDITY_REVIEW,
  LIQUIDITY_POOLS_STAKE,
  LIQUIDITY_POOLS_STAKE_REVIEW,
  LIQUIDITY_POOLS_UNSTAKE,
  LIQUIDITY_POOLS_UNSTAKE_REVIEW,
  LIQUIDITY_POOLS_REMOVE_LIQUIDITY,
  LIQUIDITY_POOLS_REMOVE_LIQUIDITY_REVIEW,
  LIQUIDITY_POOLS_CLAIM_REWARDS_REVIEW,
  LIQUIDITY_POOLS_INFO,
  TUTORIAL,
  TUTORIAL_FLOW,
  ENS_MIGRATION_CONFIRM,
  WEB_VIEW,
  ENS_MIGRATION_FLOW,
  ADD_CASH,
} from 'constants/navigationConstants';
import { DARK_THEME } from 'constants/appSettingsConstants';

// utils
import { modalTransition, addAppStateChangeListener, removeAppStateChangeListener } from 'utils/common';
import { getThemeByType, getThemeColors } from 'utils/themes';

// types
import type { Theme } from 'models/Theme';
import type { I18n } from 'models/Translations';
import type { Notification } from 'models/Notification';
import type { EthereumWallet } from 'models/Wallet';
import type { BackupStatus } from 'reducers/walletReducer';
import type { Dispatch, RootReducerState } from 'reducers/rootReducer';

const SLEEP_TIMEOUT = 20000;
const SMART_WALLET_SESSION_CHECK_INTERVAL = 30 * 60000; // 30 min
const ACTIVE_APP_STATE = 'active';
const BACKGROUND_APP_STATE = 'background';
const APP_LOGOUT_STATES = [BACKGROUND_APP_STATE];

const StackNavigatorModalConfig = {
  defaultNavigationOptions: {
    headerShown: false,
    cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
  },
};

const StackNavigatorConfig = {
  defaultNavigationOptions: {
    headerShown: false,
    gestureEnabled: true,
    cardStyle: {
      backgroundColor: {
        dark: getThemeColors(getThemeByType(DARK_THEME)).basic070,
        light: getThemeColors(getThemeByType()).basic070,
      },
    },
  },
};

// ASSETS FLOW
const assetsFlow = createStackNavigator(
  {
    [ASSETS]: AssetsScreen,
    [ASSET]: AssetScreen,
    [ASSET_SEARCH]: AssetSearchScreen,
    [COLLECTIBLE]: CollectibleScreen,
    [WALLET_SETTINGS]: WalletSettingsScreen,
  },
  StackNavigatorConfig,
);

const exchangeFlow = createStackNavigator(
  {
    [EXCHANGE]: ExchangeScreen,
    [EXCHANGE_CONFIRM]: ExchangeConfirmScreen,
    [EXCHANGE_INFO]: ExchangeInfoScreen,
    [SEND_TOKEN_PIN_CONFIRM]: SendTokenPinConfirmScreen,
    [SEND_TOKEN_TRANSACTION]: SendTokenTransactionScreen,
  },
  StackNavigatorConfig,
);

// SERVICES FLOW
const servicesFlow = createStackNavigator(
  {
    [SERVICES]: ServicesScreen,
  },
  StackNavigatorConfig,
);

// ADD CASH FLOW
const addCashFlow = createStackNavigator(
  {
    [ADD_CASH]: AddCashScreen,
  },
  StackNavigatorConfig,
);

// WALLET CONNECT CALL REQUEST FLOW
const walletConnectCallRequestFlow = createStackNavigator(
  {
    [WALLETCONNECT_PIN_CONFIRM_SCREEN]: WalletConnectPinConfirm,
    [SEND_TOKEN_TRANSACTION]: SendTokenTransactionScreen,
  },
  StackNavigatorConfig,
);

// WALLET CONNECT FLOW
const walletConnectFlow = createStackNavigator(
  {
    [WALLETCONNECT]: WalletConnectHomeScreen,
    [WALLETCONNECT_CONNECTED_APPS]: WalletConnectConnectedAppsScreen,
  },
  StackNavigatorConfig,
);

// HOME FLOW
const homeFlow = createStackNavigator(
  {
    [HOME]: HomeScreen,
    [HOME_HISTORY]: HistoryScreen,
    [COLLECTIBLE]: CollectibleScreen,
    [BADGE]: BadgeScreen,
    [STORYBOOK]: StorybookScreen,
    [WALLET_SETTINGS]: WalletSettingsScreen,
    [SEND_TOKEN_AMOUNT]: SendTokenAmountScreen,
    [POOLTOGETHER_PURCHASE]: PoolTogetherPurchaseScreen,
    [POOLTOGETHER_WITHDRAW]: PoolTogetherWithdrawScreen,
    [SABLIER_INCOMING_STREAM]: SablierIncomingStreamScreen,
    [SABLIER_OUTGOING_STREAM]: SablierOutgoingStreamScreen,
    [SEND_TOKEN_PIN_CONFIRM]: SendTokenPinConfirmScreen,
    [SEND_TOKEN_TRANSACTION]: SendTokenTransactionScreen,
  },
  StackNavigatorConfig,
);

// SEND TOKEN FLOW
const sendTokenFlow = createStackNavigator(
  {
    [SEND_TOKEN_AMOUNT]: SendTokenAmountScreen,
    [SEND_COLLECTIBLE_CONFIRM]: SendCollectibleConfirmScreen,
    [SEND_TOKEN_CONFIRM]: SendTokenConfirmScreen,
    [SEND_TOKEN_PIN_CONFIRM]: SendTokenPinConfirmScreen,
    [SEND_TOKEN_TRANSACTION]: SendTokenTransactionScreen,
  },
  StackNavigatorModalConfig,
);

const changePinFlow = createStackNavigator(
  {
    [CHANGE_PIN_CURRENT_PIN]: ChangePinCurrentPinScreen,
    [CHANGE_PIN_NEW_PIN]: ChangePinNewPinScreen,
    [CHANGE_PIN_CONFIRM_NEW_PIN]: ChangePinConfirmNewPinScreen,
  },
  StackNavigatorModalConfig,
);

// WALLET BACKUP IN SETTINGS FLOW
const backupWalletFlow = createStackNavigator(
  {
    [BACKUP_PHRASE]: BackupPhraseScreen,
    [BACKUP_PHRASE_VALIDATE]: BackupPhraseValidateScreen,
  },
  StackNavigatorModalConfig,
);

// TUTORIAL FLOW
const tutorialFlow = createStackNavigator(
  {
    [TUTORIAL]: TutorialScreen,
  },
  StackNavigatorConfig,
);

// PPN SEND TOKEN FROM ASSET FLOW
const ppnSendTokenFromAssetFlow = createStackNavigator(
  {
    [PPN_SEND_TOKEN_AMOUNT]: PPNSendTokenAmountScreen,
  },
  StackNavigatorModalConfig,
);

// PPN SEND SYNTHETIC ASSET FULL FLOW
const ppnSendSyntheticAssetFlow = createStackNavigator(
  {
    // synthetic
    [SEND_SYNTHETIC_AMOUNT]: SendSyntheticAmountScreen,
    [SEND_TOKEN_PIN_CONFIRM]: SendTokenPinConfirmScreen,
    [SEND_TOKEN_TRANSACTION]: SendTokenTransactionScreen,
    // other
    [SEND_TOKEN_AMOUNT]: SendTokenAmountScreen,
    [SEND_TOKEN_CONFIRM]: SendTokenConfirmScreen,
    [SEND_TOKEN_PIN_CONFIRM]: SendTokenPinConfirmScreen,
    [SEND_TOKEN_TRANSACTION]: SendTokenTransactionScreen,
  },
  StackNavigatorModalConfig,
);

// MANAGE WALLETS FLOW
const manageWalletsFlow = createStackNavigator(
  {
    [ACCOUNTS]: AccountsScreen,
    [FUND_CONFIRM]: FundConfirmScreen,
  },
  StackNavigatorConfig,
);

// TANK FLOWS
const tankSettleFlow = createStackNavigator(
  {
    [SETTLE_BALANCE]: SettleBalanceScreen,
    [SETTLE_BALANCE_CONFIRM]: SettleBalanceConfirmScreen,
  },
  StackNavigatorConfig,
);

// UNSETTLED ASSETS FLOW
const unsettledAssetsFlow = createStackNavigator(
  {
    [UNSETTLED_ASSETS]: UnsettledAssetsScreen,
    [SETTLE_BALANCE]: SettleBalanceScreen,
    [SETTLE_BALANCE_CONFIRM]: SettleBalanceConfirmScreen,
  },
  StackNavigatorConfig,
);

const tankFundFlow = createStackNavigator(
  {
    [FUND_TANK]: FundTankScreen,
    [FUND_CONFIRM]: FundConfirmScreen,
  },
  StackNavigatorConfig,
);

const tankWithdrawalFlow = createStackNavigator(
  {
    [TANK_WITHDRAWAL]: TankWithdrawalScreen,
    [TANK_WITHDRAWAL_CONFIRM]: TankWithdrawalConfirmScreen,
  },
  StackNavigatorConfig,
);

const menuFlow = createStackNavigator(
  {
    [MENU]: MenuScreen,
    [WALLET_SETTINGS]: WalletSettingsScreen,
    [COMMUNITY_SETTINGS]: CommunitySettingsScreen,
    [APP_SETTINGS]: AppSettingsScreen,
    [WEB_VIEW]: WebViewScreen,
  },
  StackNavigatorConfig,
);

// POOLTOGETHER FLOW
const poolTogetherFlow = createStackNavigator({
  [POOLTOGETHER_DASHBOARD]: PoolTogetherDashboardScreen,
  [POOLTOGETHER_PURCHASE]: PoolTogetherPurchaseScreen,
  [POOLTOGETHER_PURCHASE_CONFIRM]: PoolTogetherPurchaseConfirmScreen,
  [POOLTOGETHER_WITHDRAW]: PoolTogetherWithdrawScreen,
  [POOLTOGETHER_WITHDRAW_CONFIRM]: PoolTogetherWithdrawConfirmScreen,
  [SEND_TOKEN_PIN_CONFIRM]: SendTokenPinConfirmScreen,
  [SEND_TOKEN_TRANSACTION]: SendTokenTransactionScreen,
}, StackNavigatorConfig);

const lendingAddDepositsFlow = createStackNavigator({
  [LENDING_ENTER_DEPOSIT_AMOUNT]: EnterDepositAmountScreen,
  [LENDING_DEPOSIT_TRANSACTION_CONFIRM]: DepositTransactionConfirmScreen,
  [SEND_TOKEN_PIN_CONFIRM]: SendTokenPinConfirmScreen,
  [SEND_TOKEN_TRANSACTION]: SendTokenTransactionScreen,
}, StackNavigatorConfig);

const lendingWithdrawDepositsFlow = createStackNavigator({
  [LENDING_ENTER_WITHDRAW_AMOUNT]: EnterWithdrawAmountScreen,
  [LENDING_WITHDRAW_TRANSACTION_CONFIRM]: WithdrawTransactionConfirmScreen,
  [SEND_TOKEN_PIN_CONFIRM]: SendTokenPinConfirmScreen,
  [SEND_TOKEN_TRANSACTION]: SendTokenTransactionScreen,
}, StackNavigatorConfig);

const keyBasedAssetTransferFlow = createStackNavigator({
  [KEY_BASED_ASSET_TRANSFER_INTRO]: KeyBasedAssetTransferIntroScreen,
  [KEY_BASED_ASSET_TRANSFER_CHOOSE]: KeyBasedAssetTransferChooseScreen,
  [KEY_BASED_ASSET_TRANSFER_EDIT_AMOUNT]: KeyBasedAssetTransferEditAmountScreen,
  [KEY_BASED_ASSET_TRANSFER_CONFIRM]: KeyBasedAssetTransferConfirmScreen,
  [KEY_BASED_ASSET_TRANSFER_UNLOCK]: KeyBasedAssetTransferUnlockScreen,
  [SEND_TOKEN_TRANSACTION]: SendTokenTransactionScreen,
}, StackNavigatorConfig);

const contactsFlow = createStackNavigator({
  [CONTACTS_LIST]: ContactsListScreen,
}, StackNavigatorConfig);

const sablierFlow = createStackNavigator({
  [SABLIER_STREAMS]: SablierStreamsScreen,
  [SABLIER_NEW_STREAM]: SablierNewStreamScreen,
  [SABLIER_NEW_STREAM_REVIEW]: SablierNewStreamReviewScreen,
  [SABLIER_INCOMING_STREAM]: SablierIncomingStreamScreen,
  [SABLIER_OUTGOING_STREAM]: SablierOutgoingStreamScreen,
  [SABLIER_WITHDRAW]: SablierWithdrawScreen,
  [SABLIER_WITHDRAW_REVIEW]: SablierWithdrawReviewScreen,
  [SEND_TOKEN_PIN_CONFIRM]: SendTokenPinConfirmScreen,
  [SEND_TOKEN_TRANSACTION]: SendTokenTransactionScreen,
}, StackNavigatorConfig);

const rariFlow = createStackNavigator({
  [RARI_DEPOSIT]: RariDepositScreen,
  [RARI_INFO]: RariInfoScreen,
  [RARI_ADD_DEPOSIT]: RariAddDepositScreen,
  [RARI_ADD_DEPOSIT_REVIEW]: RariAddDepositReviewScreen,
  [RARI_WITHDRAW]: RariWithdrawScreen,
  [RARI_WITHDRAW_REVIEW]: RariWithdrawReviewScreen,
  [RARI_TRANSFER]: RariTransferScreen,
  [RARI_TRANSFER_REVIEW]: RariTransferReviewScreen,
  [RARI_CLAIM_RGT]: RariClaimRgtScreen,
  [RARI_CLAIM_RGT_REVIEW]: RariClaimRgtReviewScreen,
  [SEND_TOKEN_PIN_CONFIRM]: SendTokenPinConfirmScreen,
  [SEND_TOKEN_TRANSACTION]: SendTokenTransactionScreen,
}, StackNavigatorConfig);


const ensMigrationFlow = createStackNavigator({
  [ENS_MIGRATION_CONFIRM]: EnsMigrationConfirmScreen,
  [SEND_TOKEN_TRANSACTION]: SendTokenTransactionScreen,
}, StackNavigatorConfig);

const liquidityPoolsFlow = createStackNavigator({
  [LIQUIDITY_POOLS]: LiquidityPoolsScreen,
  [LIQUIDITY_POOL_DASHBOARD]: LiquidityPoolDashboardScreen,
  [LIQUIDITY_POOLS_ADD_LIQUIDITY]: LiquidityPoolsAddLiquidityScreen,
  [LIQUIDITY_POOLS_ADD_LIQUIDITY_REVIEW]: LiquidityPoolsAddLiquidityReviewScreen,
  [LIQUIDITY_POOLS_STAKE]: LiquidityPoolsStakeTokensScreen,
  [LIQUIDITY_POOLS_STAKE_REVIEW]: LiquidityPoolsStakeTokensReviewScreen,
  [LIQUIDITY_POOLS_UNSTAKE]: LiquidityPoolsUnstakeTokensScreen,
  [LIQUIDITY_POOLS_UNSTAKE_REVIEW]: LiquidityPoolsUnstakeTokensReviewScreen,
  [LIQUIDITY_POOLS_REMOVE_LIQUIDITY]: LiquidityPoolsRemoveLiquidityScreen,
  [LIQUIDITY_POOLS_REMOVE_LIQUIDITY_REVIEW]: LiquidityPoolsRemoveLiquidityReviewScreen,
  [LIQUIDITY_POOLS_CLAIM_REWARDS_REVIEW]: LiquidityPoolsClaimRewardsReviewScreen,
  [LIQUIDITY_POOLS_INFO]: LiquidityPoolsInfoScreen,
  [SEND_TOKEN_PIN_CONFIRM]: SendTokenPinConfirmScreen,
  [SEND_TOKEN_TRANSACTION]: SendTokenTransactionScreen,
}, StackNavigatorConfig);

const MainStack = createStackNavigator(
  {
    [HOME_FLOW]: homeFlow,
    [ASSETS]: assetsFlow,
  },
  StackNavigatorConfig,
);

// Below screens/flows will appear as modals
const AppFlowNavigation = createStackNavigator(
  {
    [MAIN_FLOW]: MainStack,
    [SEND_TOKEN_FROM_HOME_FLOW]: sendTokenFlow,
    [CONNECT_FLOW]: walletConnectFlow,
    [SERVICES_FLOW]: servicesFlow,
    [PPN_HOME]: PPNHomeScreen,
    [SEND_TOKEN_FROM_ASSET_FLOW]: sendTokenFlow,
    [PPN_SEND_TOKEN_FROM_ASSET_FLOW]: ppnSendTokenFromAssetFlow,
    [PPN_SEND_SYNTHETIC_ASSET_FLOW]: ppnSendSyntheticAssetFlow,
    [SEND_TOKEN_FROM_CONTACT_FLOW]: sendTokenFlow,
    [SEND_COLLECTIBLE_FROM_ASSET_FLOW]: sendTokenFlow,
    [CHANGE_PIN_FLOW]: changePinFlow,
    [REVEAL_BACKUP_PHRASE]: RevealBackupPhraseScreen,
    [BACKUP_WALLET_IN_SETTINGS_FLOW]: backupWalletFlow,
    [MANAGE_WALLETS_FLOW]: manageWalletsFlow,
    [TANK_SETTLE_FLOW]: tankSettleFlow,
    [UNSETTLED_ASSETS_FLOW]: unsettledAssetsFlow,
    [TANK_FUND_FLOW]: tankFundFlow,
    [TANK_WITHDRAWAL_FLOW]: tankWithdrawalFlow,
    [WALLETCONNECT_FLOW]: walletConnectFlow,
    [PILLAR_NETWORK_INTRO]: PillarNetworkIntro,
    [POOLTOGETHER_FLOW]: poolTogetherFlow,
    [LOGOUT_PENDING]: LogoutPendingScreen,
    [MENU_FLOW]: menuFlow,
    [PIN_CODE]: PinCodeUnlockScreen,
    [WALLET_ACTIVATED]: WalletActivatedScreen,
    [LENDING_CHOOSE_DEPOSIT]: ChooseAssetDepositScreen,
    [LENDING_VIEW_DEPOSITED_ASSET]: ViewDepositedAssetScreen,
    [LENDING_DEPOSITED_ASSETS_LIST]: DepositedAssetsListScreen,
    [LENDING_ADD_DEPOSIT_FLOW]: lendingAddDepositsFlow,
    [LENDING_WITHDRAW_DEPOSIT_FLOW]: lendingWithdrawDepositsFlow,
    [KEY_BASED_ASSET_TRANSFER_FLOW]: keyBasedAssetTransferFlow,
    [KEY_BASED_ASSET_TRANSFER_STATUS]: KeyBasedAssetTransferStatusScreen,
    [CONTACTS_FLOW]: contactsFlow,
    [SABLIER_FLOW]: sablierFlow,
    [EXCHANGE_FLOW]: exchangeFlow,
    [RARI_FLOW]: rariFlow,
    [LIQUIDITY_POOLS_FLOW]: liquidityPoolsFlow,
    [TUTORIAL_FLOW]: tutorialFlow,
    [WALLETCONNECT_CONNECTOR_REQUEST_SCREEN]: WalletConnectConnectorRequestScreen,
    [WALLETCONNECT_CALL_REQUEST_SCREEN]: WalletConnectCallRequestScreen,
    [WALLETCONNECT_CALL_REQUEST_FLOW]: walletConnectCallRequestFlow,
    [ETHERSPOT_DEPLOYMENT_INTERJECTION]: EtherspotDeploymentInterjection,
    [ENS_MIGRATION_FLOW]: ensMigrationFlow,
    [ADD_CASH]: addCashFlow,
  },
  modalTransition,
);

type Props = {
  fetchAppSettingsAndRedirect: Function,
  startListeningNotifications: Function,
  stopListeningNotifications: Function,
  initWalletConnect: Function,
  fetchAllAccountsAssetsBalances: () => Function,
  checkForMissedAssets: Function,
  notifications: Notification[],
  showHomeUpdateIndicator: boolean,
  navigation: NavigationScreenProp<*>,
  wallet: ?EthereumWallet,
  backupStatus: BackupStatus,
  isPickingImage: boolean,
  fetchAllCollectiblesData: Function,
  removePrivateKeyFromMemory: Function,
  isBrowsingWebView: boolean,
  isOnline: boolean,
  endWalkthrough: () => void,
  theme: Theme,
  handleSystemDefaultThemeChange: () => void,
  i18n: I18n,
  onboardingUsernameRegistrationFailed: boolean,
  handleSystemLanguageChange: () => void,
  checkArchanovaSession: () => void,
};

type State = {
  lastAppState: ?string,
};

let lockTimer;
let smartWalletSessionCheckInterval;

class AppFlow extends React.Component<Props, State> {
  state = {
    lastAppState: AppState.currentState,
  };

  componentDidMount() {
    const {
      startListeningNotifications,
      checkForMissedAssets,
      fetchAllAccountsAssetsBalances,
      fetchAllCollectiblesData,
      initWalletConnect,
      checkArchanovaSession,
    } = this.props;

    startListeningNotifications();
    addAppStateChangeListener(this.handleAppStateChange);

    smartWalletSessionCheckInterval = BackgroundTimer.setInterval(
      checkArchanovaSession,
      SMART_WALLET_SESSION_CHECK_INTERVAL,
    );

    // the following actions are useless if user is not yet registered on back-end
    fetchAllAccountsAssetsBalances();
    checkForMissedAssets();
    fetchAllCollectiblesData();
    initWalletConnect();
  }

  componentDidUpdate(prevProps: Props) {
    const {
      notifications,
      wallet,
      removePrivateKeyFromMemory,
    } = this.props;
    const { notifications: prevNotifications } = prevProps;

    if (wallet?.privateKey) {
      removePrivateKeyFromMemory();
    }

    notifications
      .slice(prevNotifications.length)
      // $FlowFixMe: flow update to 0.122
      .forEach((notification) => Toast.show({ ...notification }));
  }

  componentWillUnmount() {
    const { stopListeningNotifications } = this.props;

    stopListeningNotifications();
    removeAppStateChangeListener(this.handleAppStateChange);
    BackgroundTimer.clearInterval(smartWalletSessionCheckInterval);
  }

  handleAppStateChange = (nextAppState: string) => {
    const {
      stopListeningNotifications,
      isPickingImage,
      isBrowsingWebView,
      endWalkthrough,
      handleSystemDefaultThemeChange,
      handleSystemLanguageChange,
      checkArchanovaSession,
    } = this.props;
    const { lastAppState } = this.state;
    BackgroundTimer.clearTimeout(lockTimer);
    if (isPickingImage || isBrowsingWebView) return;
    // only checking if background state for logout or websocket channel close
    if (APP_LOGOUT_STATES.includes(nextAppState)) {
      // close walkthrough shade or tooltips
      endWalkthrough();
      lockTimer = BackgroundTimer.setTimeout(() => {
        stopListeningNotifications();
      }, SLEEP_TIMEOUT);
    } else if (APP_LOGOUT_STATES.includes(lastAppState) && nextAppState === ACTIVE_APP_STATE) {
      handleSystemDefaultThemeChange();
      handleSystemLanguageChange();
      checkArchanovaSession();
    }
    this.setState({ lastAppState: nextAppState });
  };

  render() {
    const {
      showHomeUpdateIndicator,
      navigation,
      backupStatus,
      theme,
      i18n,
      onboardingUsernameRegistrationFailed,
    } = this.props;

    if (onboardingUsernameRegistrationFailed) return <UsernameFailed />;

    const { isImported, isBackedUp } = backupStatus;
    const isWalletBackedUp = isImported || isBackedUp;

    return (
      <MemoizedAppFlowNavigation
        showHomeUpdateIndicator={showHomeUpdateIndicator}
        isWalletBackedUp={isWalletBackedUp}
        theme={theme}
        language={i18n.language}
        navigation={navigation}
      />
    );
  }
}

// Workaround for React Navigation 4 obscure crash occuring if `screenProps` object is re-created on each render.
// Functional component created just to use useMemo hook, can be inlined when AppFlow is migrated to FC.
const MemoizedAppFlowNavigation = ({
  showHomeUpdateIndicator,
  isWalletBackedUp,
  theme,
  language,
  navigation,
}) => {
  const screenProps = React.useMemo(
    () => ({
      showHomeUpdateIndicator,
      isWalletBackedUp,
      theme,
      language,
    }),
    [
      showHomeUpdateIndicator,
      isWalletBackedUp,
      theme,
      language,
    ],
  );

  return <AppFlowNavigation screenProps={screenProps} navigation={navigation} />;
};

const mapStateToProps = ({
  notifications: {
    data: notifications,
    showHomeUpdateIndicator,
  },
  wallet: { data: wallet, backupStatus },
  appSettings: { data: { isPickingImage, isBrowsingWebView } },
  session: { data: { isOnline } },
  onboarding: { usernameRegistrationFailed: onboardingUsernameRegistrationFailed },
}: RootReducerState): $Shape<Props> => ({
  notifications,
  showHomeUpdateIndicator,
  wallet,
  backupStatus,
  isPickingImage,
  isBrowsingWebView,
  isOnline,
  onboardingUsernameRegistrationFailed,
});

const mapDispatchToProps = (dispatch: Dispatch): $Shape<Props> => ({
  stopListeningNotifications: () => dispatch(stopListeningNotificationsAction()),
  startListeningNotifications: () => dispatch(startListeningNotificationsAction()),
  initWalletConnect: () => dispatch(initWalletConnectSessionsAction()),
  fetchAllAccountsAssetsBalances: () => dispatch(fetchAllAccountsAssetsBalancesAction()),
  checkForMissedAssets: () => dispatch(checkForMissedAssetsAction()),
  fetchAllCollectiblesData: () => dispatch(fetchAllCollectiblesDataAction()),
  removePrivateKeyFromMemory: () => dispatch(removePrivateKeyFromMemoryAction()),
  endWalkthrough: () => dispatch(endWalkthroughAction()),
  handleSystemDefaultThemeChange: () => dispatch(handleSystemDefaultThemeChangeAction()),
  handleSystemLanguageChange: () => dispatch(handleSystemLanguageChangeAction()),
  checkArchanovaSession: () => dispatch(checkArchanovaSessionIfNeededAction()),
});

const ConnectedAppFlow = withTranslation()(connect(mapStateToProps, mapDispatchToProps)(AppFlow));
ConnectedAppFlow.router = AppFlowNavigation.router;
ConnectedAppFlow.defaultNavigationOptions = AppFlowNavigation.defaultNavigationOptions;

export default withTheme(ConnectedAppFlow);
