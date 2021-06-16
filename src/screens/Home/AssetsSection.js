// @flow
/*
    Pillar Wallet: the personal data locker
    Copyright (C) 2021 Stiftung Pillar Project

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
import { LayoutAnimation } from 'react-native';
import { useNavigation } from 'react-navigation-hooks';
import styled from 'styled-components/native';
import { BigNumber } from 'bignumber.js';
import { useTranslationWithPrefix } from 'translations/translate';

// Constants
import { ASSETS, SERVICES_FLOW } from 'constants/navigationConstants';
import { CHAIN } from 'constants/chainConstants';
import { ASSET_CATEGORY } from 'constants/assetsConstants';

// Selectors
import { useFiatCurrency, useActiveAccount } from 'selectors';
import { useSupportedChains } from 'selectors/chains';

// Hooks
import { useDeploymentStatus } from 'hooks/deploymentStatus';

// Utils
import { formatValue, formatFiatValue } from 'utils/format';
import { LIST_ITEMS_APPEARANCE } from 'utils/layoutAnimations';
import { calculateTotalBalancePerCategory } from 'utils/totalBalances';
import { useChainsConfig, useAssetCategoriesConfig } from 'utils/uiConfig';
import { spacing } from 'utils/variables';
import { isEtherspotAccount } from 'utils/accounts';

// Types
import type { AssetCategory } from 'models/AssetCategory';
import type { Chain, ChainRecord } from 'models/Chain';
import type { AccountTotalBalances, CategoryRecord } from 'models/TotalBalances';


// Local
import CategoryListItem from './components/CategoryListItem';
import ChainListItem from './components/ChainListItem';
import { calculateTotalCollectibleCount } from './utils';

type Props = {|
  accountTotalBalances: AccountTotalBalances,
  accountCollectibleCounts: ChainRecord<number>,
|};

type FlagPerCategory = { [AssetCategory]: ?boolean };

function AssetsSection({ accountTotalBalances, accountCollectibleCounts }: Props) {
  const { t } = useTranslationWithPrefix('home.assets');
  const navigation = useNavigation();

  const [showChainsPerCategory, setShowChainsPerCategory] = React.useState<FlagPerCategory>({});

  const chains = useSupportedChains();
  const fiatCurrency = useFiatCurrency();
  const activeAccount = useActiveAccount();

  const { isDeployedOnChain, showDeploymentInterjection } = useDeploymentStatus();

  const chainsConfig = useChainsConfig();
  const categoriesConfig = useAssetCategoriesConfig();

  const balancePerCategory = calculateTotalBalancePerCategory(accountTotalBalances);
  const totalCollectibleCount = calculateTotalCollectibleCount(accountCollectibleCounts);

  const navigateToAssetDetails = (category: AssetCategory, chain: Chain) => {
    navigation.navigate(ASSETS, { category, chain });
  };

  const toggleShowChains = (category: AssetCategory) => {
    LayoutAnimation.configureNext(LIST_ITEMS_APPEARANCE);
    const previousValue = showChainsPerCategory[category];
    // $FlowFixMe: flow is able to handle this
    setShowChainsPerCategory({ ...showChainsPerCategory, [category]: !previousValue });
  };

  const handlePressAssetCategory = (category: AssetCategory) => {
    if (chains.length && chains.length > 1) {
      toggleShowChains(category);
      return;
    }

    navigateToAssetDetails(category, CHAIN.ETHEREUM);
  };

  const renderCategoryWithBalance = (category: $Keys<CategoryRecord<BigNumber>>) => {
    const balance = balancePerCategory[category] ?? BigNumber(0);
    const formattedBalance = formatFiatValue(balance, fiatCurrency);

    const { title, iconName } = categoriesConfig[category];
    const showChains = showChainsPerCategory[category];

    return (
      <React.Fragment key={`${category}-fragment`}>
        <CategoryListItem
          key={category}
          iconName={iconName}
          title={title}
          value={formattedBalance}
          onPress={() => handlePressAssetCategory(category)}
        />
        {showChains && chains.map((chain) => renderChainWithBalance(category, chain))}
      </React.Fragment>
    );
  };

  const renderChainWithBalance = (category: $Keys<CategoryRecord<BigNumber>>, chain: Chain) => {
    const balance = accountTotalBalances?.[category]?.[chain] ?? BigNumber(0);
    const formattedBalance = formatFiatValue(balance, fiatCurrency);

    const { title } = chainsConfig[chain];

    return (
      <ChainListItem
        key={`${category}-${chain}`}
        title={title}
        value={formattedBalance}
        isDeployed={isDeployedOnChain[chain]}
        onPress={() => navigateToAssetDetails(category, chain)}
        onPressDeploy={() => showDeploymentInterjection(chain)}
      />
    );
  };

  const renderCollectiblesCategory = () => {
    const { title, iconName } = categoriesConfig.collectibles;
    const showChains = showChainsPerCategory.collectibles;
    return (
      <React.Fragment key="collectibles-fragment">
        <CategoryListItem
          key="collectibles"
          title={title}
          iconName={iconName}
          onPress={() => handlePressAssetCategory(ASSET_CATEGORY.COLLECTIBLES)}
          value={formatValue(totalCollectibleCount)}
        />
        {showChains && chains.map(renderChainCollectibleCount)}
      </React.Fragment>
    );
  };

  const renderChainCollectibleCount = (chain: Chain) => {
    return (
      <ChainListItem
        key={`collectibles-${chain}`}
        title={chainsConfig[chain].title}
        value={formatValue(accountCollectibleCounts[chain] ?? 0)}
        isDeployed={isDeployedOnChain[chain]}
        onPress={() => navigateToAssetDetails(ASSET_CATEGORY.COLLECTIBLES, chain)}
        onPressDeploy={() => showDeploymentInterjection(chain)}
      />
    );
  };

  return (
    <Container>
      {Object.keys(balancePerCategory).map((category) => renderCategoryWithBalance(category))}

      {renderCollectiblesCategory()}

      {/* Temporary entry until other UI provided */}
      {!isEtherspotAccount(activeAccount) && (
        <CategoryListItem
          key="services"
          title={t('services')}
          iconName="info"
          onPress={() => navigation.navigate(SERVICES_FLOW)}
        />
      )}
    </Container>
  );
}

export default AssetsSection;

const Container = styled.View`
  padding: 0 ${spacing.large}px;
`;
