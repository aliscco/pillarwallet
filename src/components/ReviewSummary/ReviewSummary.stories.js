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
import { storiesOf } from '@storybook/react-native';
import { Provider } from 'react-redux';

// Constants
import { CHAIN } from 'constants/chainConstants';
import { EUR, PLR } from 'constants/assetsConstants';

// Utils
import { createTestStore, initialTestState } from 'testUtils/store';

// Local
import WithThemeDecorator from '../../../storybook/WithThemeDecorator';
import CenterViewDecorator from '../../../storybook/CenterViewDecorator';
import { TokenReviewSummaryComponent } from './TokenReviewSummary';
import CollectibleReviewSummary from './CollectibleReviewSummary';


const plrAsset = {
  isPreferred: false,
  address: '0x0C16e81FB5E5215DB5dd5e8ECa7Bb9975fFa0F75',
  decimals: 18,
  name: 'Pillar',
  symbol: 'PLR',
  value: 'PLR',
  iconUrl: 'https://api-core.pillarproject.io/asset/images/tokens/icons/plrColor.png',
  email: 'info@pillarproject.io',
  telegram: 'https://t.me/pillarofficial',
  twitter: 'https://twitter.com/PillarWallet',
  website: 'https://pillarproject.io/',
  whitepaper: 'https://pillarproject.io/documents/Pillar-Gray-Paper.pdf',
  isDefault: true,
  updatedAt: '2019-07-19T12:43:23.540Z',
  id: '5c65a07d000204d2f9481c1d',
  totalSupply: '',
  socialMedia: [],
  icos: [],
};

const collectible = {
  id: '5191',
  name: 'CryptoKittiesRinkeby 5191',
  contractAddress: '0x16baf0de678e52367adc69fd067e5edd1d33e3bf',
  tokenType: 'COLLECTIBLES',
  image: 'https://lh3.googleusercontent.com/_xZzagx4SF8SL0y959uaWtk_qHwo5Q0ztJrsLYMaxOTr991UrisNXo4MS0Ny7EV9hgcCEL7MNQbz29_ji5Z-XEnk',
  imageUrl: 'https://lh3.googleusercontent.com/_xZzagx4SF8SL0y959uaWtk_qHwo5Q0ztJrsLYMaxOTr991UrisNXo4MS0Ny7EV9hgcCEL7MNQbz29_ji5Z-XEnk',
  icon: 'https://lh3.googleusercontent.com/_xZzagx4SF8SL0y959uaWtk_qHwo5Q0ztJrsLYMaxOTr991UrisNXo4MS0Ny7EV9hgcCEL7MNQbz29_ji5Z-XEnk=s250',
  iconUrl: 'https://lh3.googleusercontent.com/_xZzagx4SF8SL0y959uaWtk_qHwo5Q0ztJrsLYMaxOTr991UrisNXo4MS0Ny7EV9hgcCEL7MNQbz29_ji5Z-XEnk=s250',
  description: '',
  chain: CHAIN.ETHEREUM,
};

const store = createTestStore({
  ...initialTestState,
  assets: { supportedAssets: { ethereum: [plrAsset] } },
  rates: { data: { ethereum: { [PLR]: { [EUR]: 0.25 } } } },
  appSettings: { data: { baseFiatCurrency: EUR } },
});

storiesOf('ReviewSummary', module)
  .addDecorator(CenterViewDecorator)
  .addDecorator(WithThemeDecorator)
  .add('token', () => (
    <Provider store={store}>
      <TokenReviewSummaryComponent
        assetSymbol={PLR}
        text="You are sending"
        amount={102.1}
        chain={CHAIN.ETHEREUM}
      />
    </Provider>
  ))
  .add('collectible', () => (
    <CollectibleReviewSummary collectible={collectible} text="You are sending" />
  ));
